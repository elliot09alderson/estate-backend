import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  addRating,
  getPropertyRatings,
  getUserRating,
  deleteRating
} from '../controllers/ratingController.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/', authenticateToken, addRating);
router.get('/property/:propertyId', getPropertyRatings);
router.get('/property/:propertyId/user', authenticateToken, getUserRating);
router.delete('/property/:propertyId', authenticateToken, deleteRating);

export default router;