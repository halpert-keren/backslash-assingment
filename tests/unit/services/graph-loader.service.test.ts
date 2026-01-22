import * as fs from 'fs';
import * as path from 'path';
import { GraphLoaderService } from '../../../src/services/graph-loader.service';
import { Graph } from '../../../src/models/graph.model';

describe('GraphLoaderService', () => {
  let loader: GraphLoaderService;
  const testGraphPath = path.join(__dirname, '../../fixtures/test-graph.json');

  beforeEach(() => {
    loader = new GraphLoaderService();
  });

  describe('loadGraph', () => {
    it('should load graph from JSON file', () => {
      const graph = loader.loadGraph(testGraphPath);
      expect(graph).toBeInstanceOf(Graph);
    });

    it('should throw error for non-existent file', () => {
      expect(() => {
        loader.loadGraph('non-existent-file.json');
      }).toThrow();
    });

    it('should parse nodes correctly', () => {
      const graph = loader.loadGraph(testGraphPath);
      const nodes = graph.getAllNodes();
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.some(n => n.name === 'frontend')).toBe(true);
    });

    it('should parse edges correctly', () => {
      const graph = loader.loadGraph(testGraphPath);
      const edges = graph.getOutgoingEdges('frontend');
      expect(edges.length).toBeGreaterThan(0);
    });

    it('should normalize edges with array format', () => {
      const graph = loader.loadGraph(testGraphPath);
      // frontend has edges to both auth-service and user-service
      const edges = graph.getOutgoingEdges('frontend');
      expect(edges).toContain('auth-service');
      expect(edges).toContain('user-service');
    });
  });

  describe('getGraph', () => {
    it('should return loaded graph', () => {
      loader.loadGraph(testGraphPath);
      const graph = loader.getGraph();
      expect(graph).toBeInstanceOf(Graph);
    });

    it('should throw error if graph not loaded', () => {
      expect(() => {
        loader.getGraph();
      }).toThrow('Graph not loaded');
    });
  });

  describe('getGraphData', () => {
    it('should return raw graph data', () => {
      loader.loadGraph(testGraphPath);
      const data = loader.getGraphData();
      expect(data).toHaveProperty('nodes');
      expect(data).toHaveProperty('edges');
    });

    it('should throw error if data not loaded', () => {
      expect(() => {
        loader.getGraphData();
      }).toThrow('Graph data not loaded');
    });
  });
});
