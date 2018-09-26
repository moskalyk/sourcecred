// @flow

import {Graph} from "../../core/graph";

import * as GT from "./types";
import * as GN from "./nodes";
import * as GE from "./edges";

export function createGraph(): Graph {
  const creator = new GraphCreator();
  return creator.graph;
}

class GraphCreator {
  graph: Graph;

  constructor() {
    this.graph = new Graph();
  }

  addNode(addr: GN.StructuredAddress) {
    this.graph.addNode(GN.toRaw(addr));
  }
}
