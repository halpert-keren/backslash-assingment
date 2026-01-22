# Train Ticket Graph Query API

## Solution Overview

This implementation provides a RESTful API for querying and filtering microservices dependency graphs.

## Architecture & Design Decisions

### Technology Stack
- **TypeScript** for type safety and better developer experience
- **Express.js** for the REST API layer
- **In-memory graph storage** using Map-based adjacency lists for O(1) node lookups and efficient traversal

### Core Components

**1. Graph Model (`graph.model.ts`)**
- Uses adjacency lists (forward and reverse) for efficient graph operations
- O(1) node lookup via Map structure
- Dynamic sink detection: nodes with no outgoing edges (not hardcoded by type)
- Helper methods for common queries (public nodes, sinks, vulnerabilities)

**2. Graph Loading (`graph-loader.service.ts`)**
- Loads and parses JSON on server startup
- Normalizes edge format (handles both `to: string` and `to: string[]`)
- Builds the in-memory graph representation once, reused for all queries

**3. Route Finding (`graph-traversal.service.ts`)**
- Uses **BFS (Breadth-First Search)** to find all possible routes
- Explores from every node as a starting point
- Handles cycles with configurable depth limit (default: 15)
- Returns routes sorted by length (shortest first)
- Records all paths, not just shortest paths

**4. Filter System (`filter.service.ts` + filters/)**
- **Chain of Responsibility pattern** for extensibility
- Each filter implements a simple `Filter` interface
- Filters applied sequentially with **AND logic** (all active filters must match)
- Three built-in filters:
  - `PublicStartFilter`: Routes where first node has `publicExposed: true`
  - `SinkEndFilter`: Routes where last node has no outgoing edges
  - `VulnerabilityFilter`: Routes containing at least one node with vulnerabilities
- Easy to extend: just create a new filter class and register it

**5. Query Orchestration (`graph-query.service.ts`)**
- Coordinates route finding, filtering, and response building
- Extracts subgraph from filtered routes (only nodes/edges in matching routes)
- Handles edge cases gracefully (filters out invalid nodes instead of throwing)

**6. API Layer (`graph.controller.ts`)**
- RESTful design: GET requests with query parameters
- Simple boolean filter parameters
- Returns generic format preserving all node properties for client-side visualization

### Key Design Decisions

1. **In-Memory Storage**: Chosen for simplicity and performance with small-to-medium graphs. Graph is loaded once at startup.

2. **Dynamic Sink Detection**: Instead of hardcoding node types (rds, sql), sinks are detected by checking for no outgoing edges. This is more flexible and accurate.

3. **BFS for Route Finding**: Finds all routes (not just shortest), naturally handles cycles with depth limiting, and results are sorted by length.

4. **AND Logic for Filters**: Multiple filters use AND logic - routes must satisfy all active filters. This is more restrictive and useful for security analysis.

5. **Generic Response Format**: Returns all node properties (not just id/label), making it compatible with various visualization libraries without transformation.

6. **Extensible Filter System**: New filters can be added without modifying existing code, following the Open/Closed Principle.

### Assumptions Made

- Routes are complete paths (sequences of nodes), not just edges
- Multiple filters use AND logic (all must match)
- Cycles are allowed but limited by maxDepth to prevent infinite loops
- Sinks are dynamically detected (nodes with no outgoing edges)
- Response format optimized for visualization libraries (D3.js, Cytoscape.js, etc.)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Ensure the JSON file `train-ticket-be (1).json` is in the project root

3. Build the project:
```bash
npm run build
```

## Usage

### Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` by default.

### API Endpoints

#### GET /api/graph
Get filtered graph structure.

**Query Parameters**:
- `startFromPublic` (boolean): Filter routes starting from public services
- `endInSink` (boolean): Filter routes ending in sinks
- `hasVulnerability` (boolean): Filter routes with vulnerabilities
- `maxDepth` (number, optional, default: 15): Maximum route depth

**Examples**:
```bash
# Get all routes starting from public services
GET /api/graph?startFromPublic=true

# Get routes ending in sinks
GET /api/graph?endInSink=true

# Get routes with vulnerabilities
GET /api/graph?hasVulnerability=true

# Combine filters (AND logic)
GET /api/graph?startFromPublic=true&endInSink=true&hasVulnerability=true

# With custom max depth
GET /api/graph?startFromPublic=true&maxDepth=10
```

**Response Format**:
```json
{
  "nodes": [
    {
      "name": "auth-service",
      "kind": "service",
      "language": "java",
      "path": "train-ticket/ts-auth-service",
      "publicExposed": false,
      "vulnerabilities": [...]
    }
  ],
  "edges": [
    {
      "from": "auth-service",
      "to": "verification-code-service"
    }
  ],
  "meta": {
    "totalNodes": 10,
    "totalEdges": 15,
    "filtersApplied": ["startFromPublic", "endInSink"],
    "routesFound": 5
  }
}
```

#### GET /api/nodes
Get all nodes in the graph.

#### GET /api/nodes/:name
Get a specific node by name.

#### GET /api/health
Health check endpoint.

## Testing

**Run all tests**:
```bash
npm test
```