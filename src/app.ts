/**
 * Main Express application
 */

import express, { Application } from 'express';
import cors from 'cors';
import graphRoutes from './routes/graph.routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', graphRoutes);

// Root endpoint
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
