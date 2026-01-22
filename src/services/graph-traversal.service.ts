/**
 * Service for traversing the graph and finding routes
 */

import { Graph } from '../models/graph.model';
import { Route } from '../types/graph.types';

export class GraphTraversalService {
  /**
   * Find all routes in the graph
   * Returns all possible paths, sorted by length (shortest first)
   */
  findAllRoutes(graph: Graph, maxDepth: number = 15): Route[] {
    const allRoutes: Route[] = [];
    const allNodes = graph.getAllNodeNames();

    // Find all routes from each node
    for (const startNode of allNodes) {
      const routes = this.findRoutesFromNode(graph, startNode, maxDepth);
      allRoutes.push(...routes);
    }

    // Sort by length (shortest first)
    return allRoutes.sort((a, b) => a.length - b.length);
  }

  /**
   * Find all routes starting from a specific node
   */
  findRoutesFromNode(graph: Graph, startNode: string, maxDepth: number = 15): Route[] {
    const routes: Route[] = [];
    const queue: { path: string[]; depth: number }[] = [{ path: [startNode], depth: 0 }];

    while (queue.length > 0) {
      const { path, depth } = queue.shift()!;
      const currentNode = path[path.length - 1];

      // If we've reached max depth, stop exploring
      if (depth >= maxDepth) {
        continue;
      }

      // Get outgoing edges
      const neighbors = graph.getOutgoingEdges(currentNode);

      // If no neighbors, this is a complete route (ends at a sink)
      if (neighbors.length === 0) {
        // Include single-node routes (sink nodes)
        routes.push({ path: [...path], length: path.length });
        continue;
      }

      // Explore each neighbor
      for (const neighbor of neighbors) {
        // Allow cycles but limit depth to prevent infinite loops
        const newPath = [...path, neighbor];
        queue.push({ path: newPath, depth: depth + 1 });

        // Also record this as a complete route (even if not a sink)
        routes.push({ path: [...newPath], length: newPath.length });
      }
    }

    return routes;
  }

  /**
   * Find routes between specific start and end nodes
   */
  findRoutesBetween(graph: Graph, startNode: string, endNode: string, maxDepth: number = 15): Route[] {
    const routes: Route[] = [];
    const queue: { path: string[]; depth: number }[] = [{ path: [startNode], depth: 0 }];

    while (queue.length > 0) {
      const { path, depth } = queue.shift()!;
      const currentNode = path[path.length - 1];

      // If we've reached max depth, stop exploring
      if (depth >= maxDepth) {
        continue;
      }

      // If we've reached the end node, record this route
      if (currentNode === endNode && path.length > 1) {
        routes.push({ path: [...path], length: path.length });
        // Continue exploring in case there are multiple paths
      }

      // Get outgoing edges
      const neighbors = graph.getOutgoingEdges(currentNode);

      // Explore each neighbor
      for (const neighbor of neighbors) {
        const newPath = [...path, neighbor];
        queue.push({ path: newPath, depth: depth + 1 });
      }
    }

    // Sort by length (shortest first)
    return routes.sort((a, b) => a.length - b.length);
  }
}
