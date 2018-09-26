// @flow

import { NodeAddress, type NodeAddressT } from "../../core/graph";

export opaque type RawAddress: NodeAddressT = NodeAddressT;

const DISCOURSE_PREFIX = NodeAddress.fromParts(["sourcecred", "discourse"]);
export function _githubAddress(...parts: string[]): RawAddress {
  return NodeAddress.append(DISCOURSE_PREFIX, ...parts);
}

export const USER_TYPE: "USER" = "USER"; // a Discourse login identity
export const THREAD_TYPE: "THREAD" = "THREAD"; // a top-level thread
export const POST_TYPE: "POST" = "POST"; // an individual pots in a thread (including the first message in the thread)
export const CATEGORY_TYPE: "CATEGORY" = "CATEGORY"; // a Discourse category of threads
