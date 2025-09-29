import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;

    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(500).json({ message: 'Token verification failed' });
  }
};

// Authorize specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
export const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (userId should be in params or body)
  const resourceUserId = req.params.userId || req.body.userId || req.params.agentId;
  
  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({ message: 'Access denied - insufficient permissions' });
  }

  next();
};