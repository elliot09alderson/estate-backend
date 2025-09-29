import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

class AuthService {
  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await userRepository.create(userData);
    const token = this.generateToken(user._id, user.role);

    return { user, token };
  }

  async login(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Your account has been deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id, user.role);
    const userObject = user.toJSON();

    return { user: userObject, token };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedUpdates = ['name', 'phone', 'avatar', 'companyName'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await userRepository.update(userId, updates);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async addFavorite(userId, propertyId) {
    return await userRepository.addFavorite(userId, propertyId);
  }

  async removeFavorite(userId, propertyId) {
    return await userRepository.removeFavorite(userId, propertyId);
  }

  async getFavorites(userId) {
    return await userRepository.getFavorites(userId);
  }
}

export default new AuthService();