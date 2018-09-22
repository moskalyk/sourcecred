// @flow

import React from "react";
import * as N from "./nodes";
import type {Repository, Commit} from "./types";
import type {RepoIdString} from "../../core/repoId";

export function description(
  address: N.StructuredAddress,
  repository: Repository
) {
  switch (address.type) {
    case "COMMIT": {
      const hash = address.hash;
      const commit = repository.commits[hash];
      if (commit == null) {
        console.error(`Unable to find data for commit ${hash}`);
        return <code>{hash}</code>;
      }
      const repoIdsForCommit = repository.commitToRepoId[hash];
      const repoIdStrings: $ReadOnlyArray<RepoIdString> =
        repoIdsForCommit == null
          ? []
          : (Object.keys(repository.commitToRepoId[hash]): any);
      if (repoIdStrings.length === 0) {
        console.error(`Unable to find repoIds for commit ${hash}`);
        return (
          <span>
            <code>{commit.shortHash}</code>: {commit.summary}
          </span>
        );
      }
      const hyperlinkedHash = getHyperlinkedShortHash(commit, repoIdStrings);
      return (
        <span>
          <code>{hyperlinkedHash}</code>: {commit.summary}
        </span>
      );
    }
    default:
      throw new Error(`unknown type: ${(address.type: empty)}`);
  }
}

function hyperlink(url, text) {
  return (
    <a href={url} target="_blank" rel="nofollow noopener">
      {text}
    </a>
  );
}

function getHyperlinkedShortHash(
  commit: Commit,
  repoIdStrings: $ReadOnlyArray<RepoIdString>
) {
  const firstRepo = repoIdStrings[0];
  const url = `https://github.com/${firstRepo}/commit/${commit.hash}`;
  return hyperlink(url, commit.shortHash);
}
