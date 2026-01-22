/**
 * Type definitions for the graph structure
 */

export interface Vulnerability {
  file: string;
  severity: string;
  message: string;
  metadata: {
    cwe?: string;
    [key: string]: any;
  };
}

export interface Node {
  name: string;
  kind: string;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities?: Vulnerability[];
  metadata?: {
    [key: string]: any;
  };
}

export interface Edge {
  from: string;
  to: string | string[];
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface Route {
  path: string[];
  length: number;
}

export interface GraphResponse {
  nodes: Node[];
  edges: Edge[];
  meta?: {
    totalNodes: number;
    totalEdges: number;
    filtersApplied?: string[];
    routesFound?: number;
  };
}

export interface FilterOptions {
  startFromPublic?: boolean;
  endInSink?: boolean;
  hasVulnerability?: boolean;
  maxDepth?: number;
}
