import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', authenticateToken, feedbackController.createFeedback);
router.get('/my-feedbacks', authenticateToken, feedbackController.getUserFeedbacks);
router.get('/property/:propertyId', feedbackController.getPropertyFeedbacks);
router.get('/property/:propertyId/rating', feedbackController.getPropertyAverageRating);
router.get('/:id', authenticateToken, feedbackController.getFeedbackById);
router.put('/:id', authenticateToken, feedbackController.updateFeedback);
router.delete('/:id', authenticateToken, feedbackController.deleteFeedback);

export default router;