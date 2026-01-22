import { GraphTraversalService } from '../../../src/services/graph-traversal.service';
import { Graph } from '../../../src/models/graph.model';
import { Node, Edge } from '../../../src/types/graph.types';

describe('GraphTraversalService', () => {
  let service: GraphTraversalService;
  let graph: Graph;

  beforeEach(() => {
    service = new GraphTraversalService();
    
    // Create a simple test graph
    const nodes: Node[] = [
      { name: 'A', kind: 'service', publicExposed: true },
      { name: 'B', kind: 'service' },
      { name: 'C', kind: 'service' },
      { name: 'D', kind: 'rds' }, // Sink
    ];

    const edges: Edge[] = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'A', to: 'C' }, // Alternative path
    ];

    graph = new Graph(nodes, edges);
  });

  describe('findAllRoutes', () => {
    it('should find all routes in the graph', () => {
      const routes = service.findAllRoutes(graph, 10);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should return routes sorted by length', () => {
      const routes = service.findAllRoutes(graph, 10);
      for (let i = 1; i < routes.length; i++) {
        expect(routes[i].length).toBeGreaterThanOrEqual(routes[i - 1].length);
      }
    });

    it('should respect maxDepth limit', () => {
      const routes = service.findAllRoutes(graph, 2);
      routes.forEach(route => {
        expect(route.length).toBeLessThanOrEqual(3); // depth 2 = max 3 nodes
      });
    });

    it('should include routes ending at sinks', () => {
      const routes = service.findAllRoutes(graph, 10);
      const routesToSink = routes.filter(r => r.path[r.path.length - 1] === 'D');
      expect(routesToSink.length).toBeGreaterThan(0);
    });
  });

  describe('findRoutesFromNode', () => {
    it('should find routes starting from specific node', () => {
      const routes = service.findRoutesFromNode(graph, 'A', 10);
      expect(routes.length).toBeGreaterThan(0);
      routes.forEach(route => {
        expect(route.path[0]).toBe('A');
      });
    });

    it('should find multiple paths to same destination', () => {
      const routes = service.findRoutesFromNode(graph, 'A', 10);
      const routesToC = routes.filter(r => r.path.includes('C'));
      expect(routesToC.length).toBeGreaterThan(1); // A->B->C and A->C
    });

    it('should handle node with no outgoing edges', () => {
      const routes = service.findRoutesFromNode(graph, 'D', 10);
      // D is a sink, so routes should just be [D]
      expect(routes.some(r => r.path.length === 1 && r.path[0] === 'D')).toBe(true);
    });
  });

  describe('findRoutesBetween', () => {
    it('should find routes between two nodes', () => {
      const routes = service.findRoutesBetween(graph, 'A', 'D', 10);
      expect(routes.length).toBeGreaterThan(0);
      routes.forEach(route => {
        expect(route.path[0]).toBe('A');
        expect(route.path[route.path.length - 1]).toBe('D');
      });
    });

    it('should return empty array if no route exists', () => {
      const routes = service.findRoutesBetween(graph, 'D', 'A', 10);
      expect(routes).toHaveLength(0);
    });

    it('should find all paths between nodes', () => {
      const routes = service.findRoutesBetween(graph, 'A', 'C', 10);
      // Should find both A->B->C and A->C
      expect(routes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('cycle handling', () => {
    it('should handle cycles with depth limit', () => {
      // Create graph with cycle: A -> B -> C -> A
      const cyclicNodes: Node[] = [
        { name: 'A', kind: 'service' },
        { name: 'B', kind: 'service' },
        { name: 'C', kind: 'service' },
      ];
      const cyclicEdges: Edge[] = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' },
      ];
      const cyclicGraph = new Graph(cyclicNodes, cyclicEdges);

      const routes = service.findAllRoutes(cyclicGraph, 5);
      // Should not hang or create infinite routes
      expect(routes.length).toBeGreaterThan(0);
      routes.forEach(route => {
        expect(route.length).toBeLessThanOrEqual(6); // maxDepth 5 = max 6 nodes
      });
    });
  });
});
