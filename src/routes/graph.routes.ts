/**
 * Graph API routes
 */

import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller';

const router = Router();
const graphController = new GraphController();

// Graph endpoints
router.get('/graph', graphController.getGraph);
router.get('/nodes', graphController.getNodes);
router.get('/nodes/:name', graphController.getNode);
router.get('/health', graphController.health);

export default router;
