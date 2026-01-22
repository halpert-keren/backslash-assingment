import { FilterService } from '../../../src/services/filter.service';
import { Graph } from '../../../src/models/graph.model';
import { Node, Edge, Route, FilterOptions } from '../../../src/types/graph.types';

describe('FilterService', () => {
  let service: FilterService;
  let graph: Graph;

  beforeEach(() => {
    service = new FilterService();
    
    const nodes: Node[] = [
      { name: 'public', kind: 'service', publicExposed: true },
      { name: 'vulnerable', kind: 'service', vulnerabilities: [{ file: 'test.java', severity: 'high', message: 'test', metadata: {} }] },
      { name: 'sink', kind: 'rds' },
    ];

    const edges: Edge[] = [
      { from: 'public', to: 'vulnerable' },
      { from: 'vulnerable', to: 'sink' },
    ];

    graph = new Graph(nodes, edges);
  });

  describe('applyFilters', () => {
    it('should apply no filters when all options are false', () => {
      const routes: Route[] = [
        { path: ['public', 'vulnerable', 'sink'], length: 3 },
      ];

      const options: FilterOptions = {
        startFromPublic: false,
        endInSink: false,
        hasVulnerability: false,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toEqual(routes);
    });

    it('should apply startFromPublic filter', () => {
      const routes: Route[] = [
        { path: ['public', 'vulnerable'], length: 2 },
        { path: ['vulnerable', 'sink'], length: 2 },
      ];

      const options: FilterOptions = {
        startFromPublic: true,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path[0]).toBe('public');
    });

    it('should apply endInSink filter', () => {
      const routes: Route[] = [
        { path: ['public', 'vulnerable', 'sink'], length: 3 },
        { path: ['public', 'vulnerable'], length: 2 },
      ];

      const options: FilterOptions = {
        endInSink: true,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path[filtered[0].path.length - 1]).toBe('sink');
    });

    it('should apply hasVulnerability filter', () => {
      const routes: Route[] = [
        { path: ['public', 'vulnerable', 'sink'], length: 3 },
        { path: ['public', 'sink'], length: 2 },
      ];

      const options: FilterOptions = {
        hasVulnerability: true,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path).toContain('vulnerable');
    });

    it('should apply multiple filters with AND logic', () => {
      const routes: Route[] = [
        { path: ['public', 'vulnerable', 'sink'], length: 3 }, // Matches all
        { path: ['public', 'vulnerable'], length: 2 }, // Missing sink
        { path: ['vulnerable', 'sink'], length: 2 }, // Missing public start
        { path: ['public', 'sink'], length: 2 }, // Missing vulnerability
      ];

      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
        hasVulnerability: true,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path).toEqual(['public', 'vulnerable', 'sink']);
    });

    it('should return empty array when no routes match all filters', () => {
      const routes: Route[] = [
        { path: ['vulnerable', 'sink'], length: 2 }, // Missing public start
      ];

      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
        hasVulnerability: true,
      };

      const filtered = service.applyFilters(routes, graph, options);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getAppliedFilters', () => {
    it('should return list of applied filter names', () => {
      const options: FilterOptions = {
        startFromPublic: true,
        endInSink: true,
        hasVulnerability: false,
      };

      const applied = service.getAppliedFilters(options);
      expect(applied).toContain('startFromPublic');
      expect(applied).toContain('endInSink');
      expect(applied).not.toContain('hasVulnerability');
    });

    it('should return empty array when no filters applied', () => {
      const options: FilterOptions = {};
      const applied = service.getAppliedFilters(options);
      expect(applied).toHaveLength(0);
    });
  });
});
