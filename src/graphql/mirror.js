// @flow

import type Database from "better-sqlite3";
import stringify from "json-stable-stringify";

import dedent from "../util/dedent";
import * as Schema from "./schema";

/**
 * A local mirror of a subset of a GraphQL database.
 */
export class Mirror {
  +_db: Database;
  +_schema: Schema.Schema;

  /**
   * Create a GraphQL mirror using the given database connection and
   * GraphQL schema.
   *
   * The connection must be to a database that either (a) is empty and
   * unused, or (b) has been previously used for a GraphQL mirror with
   * an identical GraphQL schema. The database attached to the
   * connection must not be modified by any other clients. In other
   * words, passing a connection to this constructor entails transferring
   * ownership of the attached database to this module.
   *
   * If the database attached to the connection has been used with an
   * incompatible GraphQL schema or an outdated version of this module,
   * an error will be thrown and the database will remain unmodified.
   */
  constructor(db: Database, schema: Schema.Schema): void {
    if (db == null) throw new Error("db: " + String(db));
    if (schema == null) throw new Error("schema: " + String(schema));
    this._db = db;
    this._schema = schema;
    this._initialize();
  }

  _initialize() {
    const blob = stringify({version: "0.1.0", schema: this._schema});
    const db = this._db;
    _inTransaction(db, () => {
      // We store the metadata in a singleton table `meta`, whose unique row
      // has primary key `0`. Only the first ever insert will succeed; we
      // are locked into the first schema.
      db.prepare(
        dedent`\
          CREATE TABLE IF NOT EXISTS meta (
            zero INTEGER PRIMARY KEY,
            schema TEXT NOT NULL
          )
        `
      ).run();

      const existingBlob: string | void = db
        .prepare("SELECT schema FROM meta")
        .pluck()
        .get();
      if (existingBlob === blob) {
        // Already set up; nothing to do.
        return;
      } else if (existingBlob !== undefined) {
        throw new Error(
          "Database already populated with incompatible schema or version"
        );
      }
      db.prepare("INSERT INTO meta (zero, schema) VALUES (0, ?)").run(blob);

      // Create structural tables, which are independent of the schema.
      const structuralTables = [
        // Time is stored in milliseconds since 1970-01-01T00:00Z, with
        // ECMAScript semantics (leap seconds ignored, exactly 86.4M ms
        // per day, etc.).
        //
        // We use milliseconds rather than seconds because (a) this
        // simplifies JavaScript interop to a simple `+new Date()` and
        // `new Date(value)`, and (b) this avoids a Year 2038 problem by
        // surfacing >32-bit values immediately. (We have over 200,000
        // years before the number of milliseconds since epoch is more
        // than `Number.MAX_SAFE_INTEGER`.)
        dedent`\
          CREATE TABLE updates (
              rowid INTEGER PRIMARY KEY,
              time_epoch_millis INTEGER NOT NULL
          )
        `,
        dedent`\
          CREATE TABLE objects (
              id TEXT NOT NULL PRIMARY KEY,
              last_update INTEGER,
              typename TEXT NOT NULL,
              FOREIGN KEY(last_update) REFERENCES updates(rowid)
          )
        `,
        dedent`\
          CREATE TABLE links (
              rowid INTEGER PRIMARY KEY,
              parent_id TEXT NOT NULL,
              fieldname TEXT NOT NULL,
              child_id TEXT,
              UNIQUE(parent_id, fieldname),
              FOREIGN KEY(parent_id) REFERENCES objects(id),
              FOREIGN KEY(child_id) REFERENCES objects(id)
          )
        `,
        dedent`\
          CREATE UNIQUE INDEX idx_links__parent_id__fieldname
          ON links (parent_id, fieldname)
        `,
        dedent`\
          CREATE TABLE connections (
              rowid INTEGER PRIMARY KEY,
              object_id TEXT NOT NULL,
              fieldname TEXT NOT NULL,
              last_update INTEGER,
              total_count INTEGER,  -- NULL iff never updated
              has_next_page BOOLEAN,  -- NULL iff never updated
              -- The end cursor may be NULL if no items are in the connection;
              -- this is a consequence of GraphQL and the Relay pagination spec.
              -- (It may also be NULL if the connection was never updated.)
              end_cursor TEXT,
              UNIQUE(object_id, fieldname),
              FOREIGN KEY(object_id) REFERENCES objects(id),
              FOREIGN KEY(last_update) REFERENCES updates(rowid)
          )
        `,
        dedent`\
          CREATE UNIQUE INDEX idx_connections__object_id__fieldname
          ON connections (object_id, fieldname)
        `,
        dedent`\
          CREATE TABLE connection_entries (
              rowid INTEGER PRIMARY KEY,
              connection_id INTEGER NOT NULL,
              idx INTEGER NOT NULL,  -- impose an ordering
              child_id TEXT NOT NULL,
              UNIQUE(connection_id, idx),
              FOREIGN KEY(connection_id) REFERENCES connections(rowid),
              FOREIGN KEY(child_id) REFERENCES objects(id)
          )
        `,
        dedent`\
          CREATE INDEX idx_connection_entries__connection_id
          ON connection_entries (connection_id)
        `,
      ];
      for (const sql of structuralTables) {
        db.prepare(sql).run();
      }

      // Create own-data tables, which depend on the schema.
      const schema = this._schema;
      for (const typename of Object.keys(schema)) {
        const nodeType = schema[typename];
        switch (nodeType.type) {
          case "UNION":
            // Unions exist at the type level only; they have no physical
            // representation.
            break;
          case "OBJECT": {
            if (!isSqlSafe(typename)) {
              throw new Error("invalid object type name: " + typename);
            }
            const primitiveFieldNames: Schema.Fieldname[] = [];
            for (const fieldname of Object.keys(nodeType.fields)) {
              const field = nodeType.fields[fieldname];
              switch (field.type) {
                case "ID": // handled separately
                  break;
                case "NODE": // goes in `links` table
                  break;
                case "CONNECTION": // goes in `connections` table
                  break;
                case "PRIMITIVE":
                  if (!isSqlSafe(fieldname)) {
                    throw new Error("invalid field name: " + fieldname);
                  }
                  primitiveFieldNames.push(fieldname);
                  break;
                // istanbul ignore next
                default:
                  throw new Error((field.type: empty));
              }
            }
            const tableName = `"data_${typename}"`;
            const tableSpec = [
              "id TEXT NOT NULL PRIMARY KEY",
              ...primitiveFieldNames.map((fieldname) => `"${fieldname}"`),
              "FOREIGN KEY(id) REFERENCES objects(id)",
            ].join(", ");
            db.prepare(`CREATE TABLE ${tableName} (${tableSpec})`).run();
            break;
          }
          // istanbul ignore next
          default:
            throw new Error((nodeType.type: empty));
        }
      }
    });
  }
}

/**
 * Execute a function inside a database transaction.
 *
 * The database must not be in a transaction. A new transaction will be
 * entered, and then the callback will be invoked.
 *
 * If the callback completes normally, then its return value is passed
 * up to the caller, and the currently active transaction (if any) is
 * committed.
 *
 * If the callback throws an error, then the error is propagated to the
 * caller, and the currently active transaction (if any) is rolled back.
 *
 * Note that the callback may choose to commit or roll back the
 * transaction before returning or throwing an error. Conversely, note
 * that if the callback commits the transaction, and then begins a new
 * transaction but does not end it, then this function will commit the
 * new transaction if the callback returns (or roll it back if it
 * throws).
 */
export function _inTransaction<R>(db: Database, fn: () => R): R {
  if (db.inTransaction) {
    throw new Error("already in transaction");
  }
  try {
    db.prepare("BEGIN").run();
    const result = fn();
    if (db.inTransaction) {
      db.prepare("COMMIT").run();
    }
    return result;
  } finally {
    if (db.inTransaction) {
      db.prepare("ROLLBACK").run();
    }
  }
}

/*
 * In some cases, we need to interpolate user input in SQL queries in
 * positions that do not allow bound variables in prepared statements
 * (e.g., table and column names). In these cases, we manually sanitize.
 *
 * If this function returns `true`, then its argument may be safely
 * included in a SQL identifier. If it returns `false`, then no such
 * guarantee is made (this function is overly conservative, so it is
 * possible that the argument may in fact be safe).
 *
 * For instance, the function will return `true` if passed "col", but
 * will return `false` if passed "'); DROP TABLE objects; --".
 */
function isSqlSafe(token) {
  return !token.match(/[^A-Za-z0-9_]/);
}
