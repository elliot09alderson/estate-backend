import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getMyTours, scheduleTour, updateTourStatus, getAgentTours } from '../controllers/tourController.js';

const router = express.Router();

router.get('/my-tours', authenticateToken, authorizeRoles('user'), getMyTours);

router.post('/schedule', authenticateToken, authorizeRoles('user'), scheduleTour);

router.put('/:tourId/status', authenticateToken, updateTourStatus);

router.get('/agent-tours', authenticateToken, authorizeRoles('agent', 'admin'), getAgentTours);

export default router;