import { PublicStartFilter } from '../../../src/filters/public-start.filter';
import { Graph } from '../../../src/models/graph.model';
import { Node, Edge, Route } from '../../../src/types/graph.types';

describe('PublicStartFilter', () => {
  let filter: PublicStartFilter;
  let graph: Graph;

  beforeEach(() => {
    filter = new PublicStartFilter();
    
    const nodes: Node[] = [
      { name: 'public1', kind: 'service', publicExposed: true },
      { name: 'public2', kind: 'service', publicExposed: true },
      { name: 'private1', kind: 'service', publicExposed: false },
      { name: 'private2', kind: 'service' }, // undefined = not public
    ];

    const edges: Edge[] = [
      { from: 'public1', to: 'private1' },
      { from: 'private1', to: 'private2' },
      { from: 'public2', to: 'private2' },
    ];

    graph = new Graph(nodes, edges);
  });

  describe('apply', () => {
    it('should filter routes starting from public services', () => {
      const routes: Route[] = [
        { path: ['public1', 'private1'], length: 2 },
        { path: ['private1', 'private2'], length: 2 },
        { path: ['public2', 'private2'], length: 2 },
      ];

      const filtered = filter.apply(routes, graph);

      expect(filtered).toHaveLength(2);
      expect(filtered.some(r => r.path[0] === 'public1')).toBe(true);
      expect(filtered.some(r => r.path[0] === 'public2')).toBe(true);
      expect(filtered.some(r => r.path[0] === 'private1')).toBe(false);
    });

    it('should return empty array if no routes start from public services', () => {
      const routes: Route[] = [
        { path: ['private1', 'private2'], length: 2 },
      ];

      const filtered = filter.apply(routes, graph);
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty routes array', () => {
      const filtered = filter.apply([], graph);
      expect(filtered).toHaveLength(0);
    });

    it('should preserve route structure', () => {
      const routes: Route[] = [
        { path: ['public1', 'private1', 'private2'], length: 3 },
      ];

      const filtered = filter.apply(routes, graph);
      expect(filtered[0].path).toEqual(['public1', 'private1', 'private2']);
      expect(filtered[0].length).toBe(3);
    });
  });

  describe('name', () => {
    it('should have correct filter name', () => {
      expect(filter.name).toBe('startFromPublic');
    });
  });
});
