import request from 'supertest';
import express, { Application } from 'express';
import cors from 'cors';
import graphRoutes from '../../src/routes/graph.routes';

// Create test app without starting server
const createTestApp = (): Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', graphRoutes);
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Train Ticket Graph API',
      version: '1.0.0',
      endpoints: {
        graph: '/api/graph',
        nodes: '/api/nodes',
        node: '/api/nodes/:name',
        health: '/api/health'
      }
    });
  });
  
  return app;
};

describe('API Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('graphLoaded');
    });

    it('should indicate if graph is loaded', async () => {
      const response = await request(app).get('/api/health');
      
      // Graph should be loaded if JSON file exists
      expect(typeof response.body.graphLoaded).toBe('boolean');
      if (response.body.graphLoaded) {
        expect(response.body).toHaveProperty('nodeCount');
        expect(response.body.nodeCount).toBeGreaterThan(0);
      }
    });
  });

  describe('GET /api/nodes', () => {
    it('should return all nodes', async () => {
      const response = await request(app).get('/api/nodes');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(Array.isArray(response.body.nodes)).toBe(true);
    });

    it('should return nodes with all properties', async () => {
      const response = await request(app).get('/api/nodes');
      
      if (response.body.nodes.length > 0) {
        const node = response.body.nodes[0];
        expect(node).toHaveProperty('name');
        expect(node).toHaveProperty('kind');
      }
    });
  });

  describe('GET /api/nodes/:name', () => {
    it('should return specific node', async () => {
      // First get all nodes to find a valid name
      const nodesResponse = await request(app).get('/api/nodes');
      
      if (nodesResponse.body.nodes.length > 0) {
        const nodeName = nodesResponse.body.nodes[0].name;
        const response = await request(app).get(`/api/nodes/${nodeName}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('node');
        expect(response.body.node.name).toBe(nodeName);
      }
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app).get('/api/nodes/non-existent-node-12345');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/graph', () => {
    it('should return graph structure', async () => {
      const response = await request(app).get('/api/graph');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
      expect(response.body).toHaveProperty('meta');
    });

    it('should return nodes and edges arrays', async () => {
      const response = await request(app).get('/api/graph');
      
      expect(Array.isArray(response.body.nodes)).toBe(true);
      expect(Array.isArray(response.body.edges)).toBe(true);
    });

    it('should include metadata', async () => {
      const response = await request(app).get('/api/graph');
      
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalNodes).toBeGreaterThanOrEqual(0);
      expect(response.body.meta.totalEdges).toBeGreaterThanOrEqual(0);
    });

    it('should filter by startFromPublic', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({ startFromPublic: 'true' });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.filtersApplied).toContain('startFromPublic');
      
      // All returned nodes should be from routes starting with public nodes
      if (response.body.nodes.length > 0) {
        // Verify structure is correct
        expect(response.body.nodes.every((n: any) => n.name)).toBe(true);
      }
    });

    it('should filter by endInSink', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({ endInSink: 'true' });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.filtersApplied).toContain('endInSink');
    });

    it('should filter by hasVulnerability', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({ hasVulnerability: 'true' });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.filtersApplied).toContain('hasVulnerability');
    });

    it('should apply multiple filters', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({
          startFromPublic: 'true',
          endInSink: 'true',
          hasVulnerability: 'true',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.filtersApplied.length).toBeGreaterThanOrEqual(3);
      expect(response.body.meta.filtersApplied).toContain('startFromPublic');
      expect(response.body.meta.filtersApplied).toContain('endInSink');
      expect(response.body.meta.filtersApplied).toContain('hasVulnerability');
    });

    it('should respect maxDepth parameter', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({ maxDepth: '5' });
      
      expect(response.status).toBe(200);
      // Should complete without error
      expect(response.body).toHaveProperty('meta');
    });

    it('should handle invalid maxDepth gracefully', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({ maxDepth: 'not-a-number' });
      
      // Should use default value and not error
      expect(response.status).toBe(200);
    });

    it('should handle false filter values', async () => {
      const response = await request(app)
        .get('/api/graph')
        .query({
          startFromPublic: 'false',
          endInSink: 'false',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.filtersApplied).toHaveLength(0);
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});
