import feedbackRepository from '../repositories/feedbackRepository.js';
import userRepository from '../repositories/userRepository.js';
import propertyRepository from '../repositories/propertyRepository.js';

class FeedbackService {
  async createFeedback(feedbackData, userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (feedbackData.propertyId) {
      const property = await propertyRepository.findById(feedbackData.propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
    }

    const feedbackWithUser = {
      ...feedbackData,
      userId: user._id,
      userName: user.name,
      userEmail: user.email
    };

    return await feedbackRepository.create(feedbackWithUser);
  }

  async getFeedbackById(id) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    return feedback;
  }

  async getUserFeedbacks(userId, page = 1, limit = 10) {
    return await feedbackRepository.findByUser(userId, page, limit);
  }

  async getPropertyFeedbacks(propertyId, page = 1, limit = 10) {
    return await feedbackRepository.findByProperty(propertyId, page, limit);
  }

  async updateFeedback(id, updateData, userId) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    if (feedback.userId.toString() !== userId.toString()) {
      throw new Error('You are not authorized to update this feedback');
    }

    if (feedback.status !== 'pending') {
      throw new Error('Cannot update feedback that has been reviewed');
    }

    const allowedUpdates = ['subject', 'message', 'rating'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    return await feedbackRepository.update(id, updates);
  }

  async deleteFeedback(id, userId) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    if (feedback.userId.toString() !== userId.toString()) {
      throw new Error('You are not authorized to delete this feedback');
    }

    return await feedbackRepository.delete(id);
  }

  async getPropertyAverageRating(propertyId) {
    return await feedbackRepository.getAverageRating(propertyId);
  }

  async getAllFeedbacks(page = 1, limit = 10, status = null) {
    const filter = {};
    if (status) {
      filter.status = status;
    }
    return await feedbackRepository.findAll(filter, page, limit);
  }

  async respondToFeedback(id, adminResponse) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    return await feedbackRepository.updateStatus(id, 'resolved', adminResponse);
  }
}

export default new FeedbackService();