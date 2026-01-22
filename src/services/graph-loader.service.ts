/**
 * Service for loading and parsing the graph JSON file
 */

import * as fs from 'fs';
import * as path from 'path';
import { GraphData } from '../types/graph.types';
import { Graph } from '../models/graph.model';

export class GraphLoaderService {
  private graphData: GraphData | null = null;
  private graph: Graph | null = null;

  /**
   * Load graph from JSON file
   */
  loadGraph(filePath?: string): Graph {
    try {
      // Default to the JSON file in project root
      const defaultPath = path.join(__dirname, '../../train-ticket-be (1).json');
      const fullPath = filePath ? path.resolve(process.cwd(), filePath) : defaultPath;
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Graph file not found: ${fullPath}`);
      }
      
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      this.graphData = JSON.parse(fileContent) as GraphData;

      // Normalize edges: convert single 'to' to array format
      const normalizedEdges = this.graphData.edges.flatMap(edge => {
        const toArray = Array.isArray(edge.to) ? edge.to : [edge.to];
        return toArray.map(to => ({
          from: edge.from,
          to: to
        }));
      });

      this.graph = new Graph(this.graphData.nodes, normalizedEdges);
      return this.graph;
    } catch (error) {
      throw new Error(`Failed to load graph: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the loaded graph instance
   */
  getGraph(): Graph {
    if (!this.graph) {
      throw new Error('Graph not loaded. Call loadGraph() first.');
    }
    return this.graph;
  }

  /**
   * Get raw graph data
   */
  getGraphData(): GraphData {
    if (!this.graphData) {
      throw new Error('Graph data not loaded. Call loadGraph() first.');
    }
    return this.graphData;
  }
}
