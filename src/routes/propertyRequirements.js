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
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating property requirements
router.post('/', createPropertyRequirement);

// Admin-only routes
router.get('/', authenticateToken, authorizeRoles('admin'), getAllPropertyRequirements);
router.get('/stats', authenticateToken, authorizeRoles('admin'), getPropertyRequirementStats);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getPropertyRequirementById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updatePropertyRequirement);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePropertyRequirement);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), updatePropertyRequirementStatus);
router.patch('/:id/assign', authenticateToken, authorizeRoles('admin'), assignAgentToRequirement);

export default router;