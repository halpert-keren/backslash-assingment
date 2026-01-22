/**
 * Controller for graph API endpoints
 */

import { Request, Response } from 'express';
import { GraphQueryService } from '../services/graph-query.service';
import { GraphLoaderService } from '../services/graph-loader.service';
import { FilterOptions } from '../types/graph.types';

export class GraphController {
  private graphLoader: GraphLoaderService;
  private queryService: GraphQueryService;

  constructor() {
    this.graphLoader = new GraphLoaderService();
    this.queryService = new GraphQueryService();

    // Load graph on initialization
    try {
      this.graphLoader.loadGraph();
    } catch (error) {
      console.error('Failed to load graph:', error);
    }
  }

  /**
   * GET /api/graph - Get filtered graph
   */
  getGraph = (req: Request, res: Response): void => {
    try {
      const graph = this.graphLoader.getGraph();

      // Parse query parameters
      const maxDepthValue = req.query.maxDepth ? parseInt(req.query.maxDepth as string, 10) : 15;
      const options: FilterOptions = {
        startFromPublic: req.query.startFromPublic === 'true',
        endInSink: req.query.endInSink === 'true',
        hasVulnerability: req.query.hasVulnerability === 'true',
        maxDepth: isNaN(maxDepthValue) ? 15 : maxDepthValue
      };

      // Query graph with filters
      const result = this.queryService.queryGraph(graph, options);

      res.json(result);
    } catch (error) {
      console.error('Error in getGraph:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * GET /api/nodes - Get all nodes
   */
  getNodes = (req: Request, res: Response): void => {
    try {
      const graph = this.graphLoader.getGraph();
      const nodes = graph.getAllNodes();
      res.json({ nodes });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * GET /api/nodes/:name - Get specific node
   */
  getNode = (req: Request, res: Response): void => {
    try {
      const graph = this.graphLoader.getGraph();
      const nodeName = req.params.name;
      const node = graph.getNode(nodeName);

      if (!node) {
        res.status(404).json({ error: 'Node not found' });
        return;
      }

      res.json({ node });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * GET /api/health - Health check
   */
  health = (req: Request, res: Response): void => {
    try {
      const graph = this.graphLoader.getGraph();
      const nodeCount = graph.getAllNodes().length;
      res.json({
        status: 'healthy',
        graphLoaded: true,
        nodeCount
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        graphLoaded: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}
