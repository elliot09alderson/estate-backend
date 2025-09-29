import express from 'express';
import {
  createPropertyRequirement,
  getAllPropertyRequirements,
  getPropertyRequirementById,
  updatePropertyRequirement,
  deletePropertyRequirement,
  updatePropertyRequirementStatus,
  assignAgentToRequirement,
  getPropertyRequirementStats
} from '../controllers/propertyRequirementController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public route for creating property requirements
router.post('/', createPropertyRequirement);

// Admin-only routes
router.get('/', authMiddleware, adminMiddleware, getAllPropertyRequirements);
router.get('/stats', authMiddleware, adminMiddleware, getPropertyRequirementStats);
router.get('/:id', authMiddleware, adminMiddleware, getPropertyRequirementById);
router.put('/:id', authMiddleware, adminMiddleware, updatePropertyRequirement);
router.delete('/:id', authMiddleware, adminMiddleware, deletePropertyRequirement);
router.patch('/:id/status', authMiddleware, adminMiddleware, updatePropertyRequirementStatus);
router.patch('/:id/assign', authMiddleware, adminMiddleware, assignAgentToRequirement);

export default router;