/**
 * Main service for querying the graph with filters
 */

import { Graph } from '../models/graph.model';
import { GraphTraversalService } from './graph-traversal.service';
import { FilterService } from './filter.service';
import { Route, FilterOptions, GraphResponse, Edge } from '../types/graph.types';

export class GraphQueryService {
  private traversalService: GraphTraversalService;
  private filterService: FilterService;

  constructor() {
    this.traversalService = new GraphTraversalService();
    this.filterService = new FilterService();
  }

  /**
   * Query the graph with filters and return filtered subgraph
   */
  queryGraph(graph: Graph, options: FilterOptions = {}): GraphResponse {
    const maxDepth = options.maxDepth || 15;

    // Find all routes
    const allRoutes = this.traversalService.findAllRoutes(graph, maxDepth);

    // Apply filters
    const filteredRoutes = this.filterService.applyFilters(allRoutes, graph, options);

    // Extract nodes and edges from filtered routes
    const { nodes, edges } = this.extractSubgraph(filteredRoutes, graph);

    // Build response
    const response: GraphResponse = {
      nodes,
      edges,
      meta: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        filtersApplied: this.filterService.getAppliedFilters(options),
        routesFound: filteredRoutes.length
      }
    };

    return response;
  }

  /**
   * Extract nodes and edges from filtered routes
   */
  private extractSubgraph(routes: Route[], graph: Graph): { nodes: any[]; edges: Edge[] } {
    const nodeSet = new Set<string>();
    const edgeSet = new Set<string>();

    // Collect all nodes and edges from routes
    routes.forEach(route => {
      route.path.forEach(nodeName => {
        nodeSet.add(nodeName);
      });

      // Create edges from consecutive nodes in path
      for (let i = 0; i < route.path.length - 1; i++) {
        const from = route.path[i];
        const to = route.path[i + 1];
        edgeSet.add(`${from}->${to}`);
      }
    });

    // Build nodes array with all properties
    // Filter out any nodes that don't exist in the graph (defensive check)
    const nodes = Array.from(nodeSet)
      .map(nodeName => graph.getNode(nodeName))
      .filter((node): node is NonNullable<typeof node> => node !== undefined);

    // Build edges array - only include edges where both nodes exist
    const validNodeSet = new Set(nodes.map(n => n.name));
    const edges: Edge[] = Array.from(edgeSet)
      .map(edgeKey => {
        const [from, to] = edgeKey.split('->');
        return { from, to };
      })
      .filter(edge => validNodeSet.has(edge.from) && validNodeSet.has(edge.to));

    return { nodes, edges };
  }
}
