// @flow

import {
  type Edge,
  type EdgeAddressT,
  EdgeAddress,
  NodeAddress,
} from "../../core/graph";

// Edge Types
export const AUTHORS_TYPE = "AUTHORS"; // user authors a post or thread
export const REFERENCES_TYPE = "REFERENCES"; // a post references a user, thread, or post (via url or @-refernece)
export const QUOTES_TYPE = "QUOTES"; // a post quotes another post (there's an explicit tag)
export const CONTAINS_TYPE = "CONTAINS"; // categories contain threads and threads contain posts
export const LIKES_TYPE = "LIKES"; // a user likes a post
