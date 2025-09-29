import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  handleValidationErrors
} from '../middleware/validation.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/logout', authController.logout);

router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, handleValidationErrors, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

router.post('/favorites', authenticateToken, authController.addFavorite);
router.delete('/favorites/:propertyId', authenticateToken, authController.removeFavorite);
router.get('/favorites', authenticateToken, authController.getFavorites);

export default router;