

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