import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/activities', adminController.getActivities);
router.get('/activities/recent', adminController.getRecentActivities);

router.get('/properties', adminController.getAllProperties);
router.get('/properties/pending', adminController.getPendingProperties);
router.put('/properties/:id/approve', adminController.approveProperty);
router.put('/properties/:id/reject', adminController.rejectProperty);
router.delete('/properties/:id', adminController.deleteProperty);

router.get('/users', adminController.getAllUsers);
router.get('/agents', adminController.getAllAgents);
router.put('/agents/:id/deactivate', adminController.deactivateAgent);
router.put('/agents/:id/activate', adminController.activateAgent);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/feedbacks', adminController.getAllFeedbacks);
router.get('/feedbacks/status/:status', adminController.getFeedbacksByStatus);
router.put('/feedbacks/:id/respond', adminController.respondToFeedback);

export default router;