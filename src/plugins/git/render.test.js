// @flow

import * as GN from "./nodes";
import {description} from "./render";
import type {Repository} from "./types";

describe("plugins/git/render", () => {
  beforeEach(() => {
    // $ExpectFlowError
    console.error = jest.fn();
    // $ExpectFlowError
    console.warn = jest.fn();
  });
  afterEach(() => {
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  const exampleHash = "3715ddfb8d4c4fd2a6f6af75488c82f84c92ec2f";
  const exampleCommit: GN.CommitAddress = Object.freeze({
    type: GN.COMMIT_TYPE,
    hash: exampleHash,
  });
  const noRepoIdCommit: GN.CommitAddress = Object.freeze({
    type: GN.COMMIT_TYPE,
    hash: "norepo",
  });
  const multiRepositoryCommit: GN.CommitAddress = Object.freeze({
    type: GN.COMMIT_TYPE,
    hash: "multirepository",
  });
  const exampleRepository: Repository = Object.freeze({
    commits: {
      [exampleHash]: {
        hash: exampleHash,
        shortHash: exampleHash.slice(0, 7),
        summary: "This is an example commit",
        parentHashes: [],
      },
      norepo: {
        hash: "norepo",
        shortHash: "norepo",
        summary: "This commit doesn't really exist",
        parentHashes: [],
      },
      multirepository: {
        hash: "multirepository",
        shortHash: "multi",
        summary: "This nonexistent commit is in multiple repos",
        parentHashes: [],
      },
    },
    commitToRepoId: {
      [exampleHash]: {[("sourcecred/example-github": any)]: true},
      multirepository: {
        [("sourcecred/example-github": any)]: true,
        [("sourcecred/other-example": any)]: true,
      },
    },
  });

  it("a regular commit snapshots as expected", () => {
    expect(description(exampleCommit, exampleRepository)).toMatchSnapshot();
  });
  it("a commit with multiple repos snapshots as expected", () => {
    expect(
      description(multiRepositoryCommit, exampleRepository)
    ).toMatchSnapshot();
  });
  it("logs an error for a commit not in the repository", () => {
    const badCommit = {type: GN.COMMIT_TYPE, hash: "1234"};
    expect(description(badCommit, exampleRepository)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalledWith(
      "Unable to find data for commit 1234"
    );
    // $ExpectFlowError
    console.error = jest.fn();
  });
  it("logs an error for a commit without any matching repos", () => {
    expect(description(noRepoIdCommit, exampleRepository)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalledWith(
      "Unable to find repoIds for commit norepo"
    );
    // $ExpectFlowError
    console.error = jest.fn();
  });
});
