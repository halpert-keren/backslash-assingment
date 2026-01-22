import { SinkEndFilter } from '../../../src/filters/sink-end.filter';
import { Graph } from '../../../src/models/graph.model';
import { Node, Edge, Route } from '../../../src/types/graph.types';

describe('SinkEndFilter', () => {
  let filter: SinkEndFilter;
  let graph: Graph;

  beforeEach(() => {
    filter = new SinkEndFilter();
    
    const nodes: Node[] = [
      { name: 'service1', kind: 'service' },
      { name: 'service2', kind: 'service' },
      { name: 'sink1', kind: 'rds' }, // Sink (no outgoing edges)
      { name: 'sink2', kind: 'sqs' }, // Sink (no outgoing edges)
    ];

    const edges: Edge[] = [
      { from: 'service1', to: 'service2' },
      { from: 'service2', to: 'sink1' },
      { from: 'service1', to: 'sink2' },
    ];

    graph = new Graph(nodes, edges);
  });

  describe('apply', () => {
    it('should filter routes ending in sinks', () => {
      const routes: Route[] = [
        { path: ['service1', 'service2', 'sink1'], length: 3 },
        { path: ['service1', 'sink2'], length: 2 },
        { path: ['service1', 'service2'], length: 2 }, // Not ending in sink
      ];

      const filtered = filter.apply(routes, graph);

      expect(filtered).toHaveLength(2);
      expect(filtered.some(r => r.path[r.path.length - 1] === 'sink1')).toBe(true);
      expect(filtered.some(r => r.path[r.path.length - 1] === 'sink2')).toBe(true);
    });

    it('should return empty array if no routes end in sinks', () => {
      const routes: Route[] = [
        { path: ['service1', 'service2'], length: 2 },
      ];

      const filtered = filter.apply(routes, graph);
      expect(filtered).toHaveLength(0);
    });

    it('should handle single-node routes that are sinks', () => {
      const routes: Route[] = [
        { path: ['sink1'], length: 1 },
        { path: ['service1'], length: 1 },
      ];

      const filtered = filter.apply(routes, graph);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path[0]).toBe('sink1');
    });

    it('should handle empty routes array', () => {
      const filtered = filter.apply([], graph);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('name', () => {
    it('should have correct filter name', () => {
      expect(filter.name).toBe('endInSink');
    });
  });
});
