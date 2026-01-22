/**
 * Graph data model with adjacency lists for efficient traversal
 */

import { Node, Edge } from '../types/graph.types';

export class Graph {
  private nodes: Map<string, Node>;
  private adjacencyList: Map<string, string[]>;
  private reverseAdjacencyList: Map<string, string[]>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();

    // Build node map
    nodes.forEach(node => {
      this.nodes.set(node.name, node);
    });

    // Build adjacency lists
    edges.forEach(edge => {
      const from = edge.from;
      const toArray = Array.isArray(edge.to) ? edge.to : [edge.to];

      // Forward adjacency list (from -> to)
      if (!this.adjacencyList.has(from)) {
        this.adjacencyList.set(from, []);
      }
      this.adjacencyList.get(from)!.push(...toArray);

      // Reverse adjacency list (to -> from)
      toArray.forEach(to => {
        if (!this.reverseAdjacencyList.has(to)) {
          this.reverseAdjacencyList.set(to, []);
        }
        this.reverseAdjacencyList.get(to)!.push(from);
      });
    });
  }

  getNode(name: string): Node | undefined {
    return this.nodes.get(name);
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getOutgoingEdges(nodeName: string): string[] {
    return this.adjacencyList.get(nodeName) || [];
  }

  getIncomingEdges(nodeName: string): string[] {
    return this.reverseAdjacencyList.get(nodeName) || [];
  }

  getAllNodeNames(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Check if a node is a sink (has no outgoing edges)
   */
  isSink(nodeName: string): boolean {
    // Return false if node doesn't exist
    if (!this.nodes.has(nodeName)) {
      return false;
    }
    const outgoingEdges = this.adjacencyList.get(nodeName);
    return !outgoingEdges || outgoingEdges.length === 0;
  }

  /**
   * Get all sink nodes
   */
  getSinks(): string[] {
    return this.getAllNodeNames().filter(nodeName => this.isSink(nodeName));
  }

  /**
   * Get all public nodes (publicExposed === true)
   */
  getPublicNodes(): string[] {
    return this.getAllNodeNames().filter(nodeName => {
      const node = this.nodes.get(nodeName);
      return node?.publicExposed === true;
    });
  }

  /**
   * Check if a node has vulnerabilities
   */
  hasVulnerabilities(nodeName: string): boolean {
    const node = this.nodes.get(nodeName);
    return node?.vulnerabilities !== undefined && node.vulnerabilities.length > 0;
  }
}
