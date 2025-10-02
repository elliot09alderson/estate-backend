import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  sendMessage,
  getMyMessages,
  getMessage,
  markAsRead,
  toggleArchive,
  deleteMessage,
  getMessageStats
} from '../controllers/messageController.js';

const router = express.Router();

// Public route - send message (with optional auth)
router.post('/send', (req, res, next) => {
  // Try to authenticate but don't require it
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    authenticateToken(req, res, (err) => {
      // Continue regardless of authentication result
      next();
    });
  } else {
    // No token provided, continue without authentication
    next();
  }
}, sendMessage);

// Protected routes - require authentication
router.get('/my-messages', authenticateToken, getMyMessages);
router.get('/stats', authenticateToken, getMessageStats);
router.get('/:id', authenticateToken, getMessage);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/:id/archive', authenticateToken, toggleArchive);
router.delete('/:id', authenticateToken, deleteMessage);

export default router;