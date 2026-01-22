import { Graph } from '../../../src/models/graph.model';
import { Node, Edge } from '../../../src/types/graph.types';

describe('Graph Model', () => {
  let graph: Graph;
  let nodes: Node[];
  let edges: Edge[];

  beforeEach(() => {
    nodes = [
      {
        name: 'node1',
        kind: 'service',
        publicExposed: true,
      },
      {
        name: 'node2',
        kind: 'service',
        publicExposed: false,
      },
      {
        name: 'node3',
        kind: 'rds',
      },
      {
        name: 'sink-node',
        kind: 'service',
      },
    ];

    edges = [
      { from: 'node1', to: 'node2' },
      { from: 'node2', to: 'node3' },
      { from: 'node2', to: 'sink-node' },
      // sink-node has no outgoing edges
    ];

    graph = new Graph(nodes, edges);
  });

  describe('getNode', () => {
    it('should return node by name', () => {
      const node = graph.getNode('node1');
      expect(node).toBeDefined();
      expect(node?.name).toBe('node1');
    });

    it('should return undefined for non-existent node', () => {
      const node = graph.getNode('non-existent');
      expect(node).toBeUndefined();
    });
  });

  describe('getAllNodes', () => {
    it('should return all nodes', () => {
      const allNodes = graph.getAllNodes();
      expect(allNodes).toHaveLength(4);
      expect(allNodes.map(n => n.name)).toContain('node1');
      expect(allNodes.map(n => n.name)).toContain('node2');
    });
  });

  describe('getOutgoingEdges', () => {
    it('should return outgoing edges for a node', () => {
      const edges = graph.getOutgoingEdges('node1');
      expect(edges).toHaveLength(1);
      expect(edges).toContain('node2');
    });

    it('should return empty array for node with no outgoing edges', () => {
      const edges = graph.getOutgoingEdges('sink-node');
      expect(edges).toHaveLength(0);
    });

    it('should return empty array for non-existent node', () => {
      const edges = graph.getOutgoingEdges('non-existent');
      expect(edges).toHaveLength(0);
    });
  });

  describe('getIncomingEdges', () => {
    it('should return incoming edges for a node', () => {
      const edges = graph.getIncomingEdges('node2');
      expect(edges).toHaveLength(1);
      expect(edges).toContain('node1');
    });

    it('should return empty array for node with no incoming edges', () => {
      const edges = graph.getIncomingEdges('node1');
      expect(edges).toHaveLength(0);
    });
  });

  describe('isSink', () => {
    it('should return true for node with no outgoing edges', () => {
      expect(graph.isSink('sink-node')).toBe(true);
    });

    it('should return false for node with outgoing edges', () => {
      expect(graph.isSink('node1')).toBe(false);
      expect(graph.isSink('node2')).toBe(false);
    });

    it('should return false for non-existent node', () => {
      expect(graph.isSink('non-existent')).toBe(false);
    });
  });

  describe('getSinks', () => {
    it('should return all sink nodes', () => {
      const sinks = graph.getSinks();
      expect(sinks).toContain('sink-node');
      expect(sinks).toContain('node3'); // node3 has no outgoing edges
    });
  });

  describe('getPublicNodes', () => {
    it('should return all public nodes', () => {
      const publicNodes = graph.getPublicNodes();
      expect(publicNodes).toContain('node1');
      expect(publicNodes).not.toContain('node2');
    });
  });

  describe('hasVulnerabilities', () => {
    it('should return false for node without vulnerabilities', () => {
      expect(graph.hasVulnerabilities('node1')).toBe(false);
    });

    it('should return true for node with vulnerabilities', () => {
      const vulnerableNode: Node = {
        name: 'vulnerable',
        kind: 'service',
        vulnerabilities: [
          {
            file: 'test.java',
            severity: 'high',
            message: 'Test vulnerability',
            metadata: {},
          },
        ],
      };
      const testGraph = new Graph([vulnerableNode], []);
      expect(testGraph.hasVulnerabilities('vulnerable')).toBe(true);
    });
  });
});
