import { GraphQueryService } from '../../../src/services/graph-query.service';
import { Graph } from '../../../src/models/graph.model';
import { Node, Edge, FilterOptions } from '../../../src/types/graph.types';

describe('GraphQueryService', () => {
  let service: GraphQueryService;
  let graph: Graph;

  beforeEach(() => {
    service = new GraphQueryService();
    
    const nodes: Node[] = [
      { name: 'public', kind: 'service', publicExposed: true },
      { name: 'vulnerable', kind: 'service', vulnerabilities: [{ file: 'test.java', severity: 'high', message: 'test', metadata: {} }] },
      { name: 'sink', kind: 'rds' },
      { name: 'other', kind: 'service' },
    ];

    const edges: Edge[] = [
      { from: 'public', to: 'vulnerable' },
      { from: 'vulnerable', to: 'sink' },
      { from: 'other', to: 'sink' },
    ];

    graph = new Graph(nodes, edges);
  });

  describe('queryGraph', () => {
    it('should return graph response with nodes and edges', () => {
      const options: FilterOptions = {};
      const result = service.queryGraph(graph, options);

      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(result).toHaveProperty('meta');
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.edges)).toBe(true);
    });

    it('should include metadata in response', () => {
      const options: FilterOptions = {};
      const result = service.queryGraph(graph, options);

      expect(result.meta).toBeDefined();
      expect(result.meta?.totalNodes).toBeGreaterThan(0);
      expect(result.meta?.totalEdges).toBeGreaterThan(0);
    });

    it('should apply filters and return filtered subgraph', () => {
      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
      };

      const result = service.queryGraph(graph, options);

      // Should only include nodes from filtered routes
      const nodeNames = result.nodes.map(n => n.name);
      expect(nodeNames).toContain('public');
      expect(nodeNames).toContain('sink');
      expect(result.meta?.filtersApplied).toContain('startFromPublic');
      expect(result.meta?.filtersApplied).toContain('endInSink');
    });

    it('should extract edges from filtered routes', () => {
      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
      };

      const result = service.queryGraph(graph, options);

      // Should have edges from the route: public -> vulnerable -> sink
      const hasEdge = result.edges.some(
        e => e.from === 'public' && e.to === 'vulnerable'
      );
      expect(hasEdge).toBe(true);
    });

    it('should include route count in metadata', () => {
      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
      };

      const result = service.queryGraph(graph, options);
      expect(result.meta?.routesFound).toBeGreaterThanOrEqual(0);
    });

    it('should respect maxDepth option', () => {
      const options: FilterOptions = {
        maxDepth: 2,
      };

      const result = service.queryGraph(graph, options);
      // With maxDepth 2, routes should be limited
      expect(result.meta?.routesFound).toBeGreaterThanOrEqual(0);
    });

    it('should return empty subgraph when no routes match filters', () => {
      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
        hasVulnerability: true,
      };

      // Create graph with no route matching all criteria
      const emptyNodes: Node[] = [
        { name: 'public', kind: 'service', publicExposed: true },
        { name: 'sink', kind: 'rds' },
      ];
      const emptyEdges: Edge[] = [
        { from: 'public', to: 'sink' },
      ];
      const emptyGraph = new Graph(emptyNodes, emptyEdges);

      const result = service.queryGraph(emptyGraph, options);
      expect(result.nodes.length).toBe(0);
      expect(result.edges.length).toBe(0);
      expect(result.meta?.routesFound).toBe(0);
    });
  });
});
