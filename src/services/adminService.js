import propertyRepository from '../repositories/propertyRepository.js';
import userRepository from '../repositories/userRepository.js';
import feedbackRepository from '../repositories/feedbackRepository.js';
import activityRepository from '../repositories/activityRepository.js';

class AdminService {
  async logActivity(adminId, adminName, action, targetType, targetId, targetName, description, metadata = {}) {
    return await activityRepository.create({
      adminId,
      adminName,
      action,
      targetType,
      targetId,
      targetName,
      description,
      metadata
    });
  }

  async approveProperty(propertyId, adminId, adminName) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (property.isApproved === 'approved') {
      throw new Error('Property is already approved');
    }

    const updatedProperty = await propertyRepository.approveProperty(propertyId);

    await this.logActivity(
      adminId,
      adminName,
      'approved_property',
      'property',
      propertyId,
      property.title,
      `Approved property: ${property.title}`,
      { category: property.category, agentId: property.agentId }
    );

    return updatedProperty;
  }

  async rejectProperty(propertyId, reason, adminId, adminName) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const updatedProperty = await propertyRepository.rejectProperty(propertyId, reason);

    await this.logActivity(
      adminId,
      adminName,
      'rejected_property',
      'property',
      propertyId,
      property.title,
      `Rejected property: ${property.title}. Reason: ${reason}`,
      { category: property.category, agentId: property.agentId, reason }
    );

    return updatedProperty;
  }

  async deleteProperty(propertyId, adminId, adminName) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    await propertyRepository.delete(propertyId);

    await this.logActivity(
      adminId,
      adminName,
      'deleted_property',
      'property',
      propertyId,
      property.title,
      `Deleted property: ${property.title}`,
      { category: property.category, agentId: property.agentId }
    );

    return { message: 'Property deleted successfully' };
  }

  async getPendingProperties(page = 1, limit = 10) {
    return await propertyRepository.findPending(page, limit);
  }

  async getAllProperties(page = 1, limit = 10, filter = {}) {
    return await propertyRepository.findAll(filter, page, limit);
  }

  async deactivateAgent(agentId, adminId, adminName) {
    const agent = await userRepository.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      throw new Error('Agent not found');
    }

    if (!agent.isActive) {
      throw new Error('Agent is already deactivated');
    }

    const updatedAgent = await userRepository.updateStatus(agentId, false);

    await this.logActivity(
      adminId,
      adminName,
      'deactivated_agent',
      'user',
      agentId,
      agent.name,
      `Deactivated agent: ${agent.name} (${agent.email})`,
      { email: agent.email }
    );

    return updatedAgent;
  }

  async activateAgent(agentId, adminId, adminName) {
    const agent = await userRepository.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      throw new Error('Agent not found');
    }

    if (agent.isActive) {
      throw new Error('Agent is already active');
    }

    const updatedAgent = await userRepository.updateStatus(agentId, true);

    await this.logActivity(
      adminId,
      adminName,
      'activated_agent',
      'user',
      agentId,
      agent.name,
      `Activated agent: ${agent.name} (${agent.email})`,
      { email: agent.email }
    );

    return updatedAgent;
  }

  async blockUser(userId, adminId, adminName) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      throw new Error('Cannot block admin users');
    }

    if (!user.isActive) {
      throw new Error('User is already blocked');
    }

    const updatedUser = await userRepository.updateStatus(userId, false);

    await this.logActivity(
      adminId,
      adminName,
      'blocked_user',
      'user',
      userId,
      user.name,
      `Blocked user: ${user.name} (${user.email})`,
      { email: user.email, role: user.role }
    );

    return updatedUser;
  }

  async unblockUser(userId, adminId, adminName) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isActive) {
      throw new Error('User is already active');
    }

    const updatedUser = await userRepository.updateStatus(userId, true);

    await this.logActivity(
      adminId,
      adminName,
      'unblocked_user',
      'user',
      userId,
      user.name,
      `Unblocked user: ${user.name} (${user.email})`,
      { email: user.email, role: user.role }
    );

    return updatedUser;
  }

  async deleteUser(userId, adminId, adminName) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      throw new Error('Cannot delete admin users');
    }

    await userRepository.delete(userId);

    await this.logActivity(
      adminId,
      adminName,
      'deleted_user',
      'user',
      userId,
      user.name,
      `Deleted user: ${user.name} (${user.email})`,
      { email: user.email, role: user.role }
    );

    return { message: 'User deleted successfully' };
  }

  async getAllUsers(page = 1, limit = 10, filter = {}) {
    return await userRepository.findAll(filter, page, limit);
  }

  async getAllAgents(page = 1, limit = 10, filter = {}) {
    return await userRepository.findAgents(filter, page, limit);
  }

  async getAllFeedbacks(page = 1, limit = 10) {
    return await feedbackRepository.findAll({}, page, limit);
  }

  async getFeedbacksByStatus(status, page = 1, limit = 10) {
    return await feedbackRepository.findByStatus(status, page, limit);
  }

  async respondToFeedback(feedbackId, adminResponse, status, adminId, adminName) {
    const feedback = await feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    const updatedFeedback = await feedbackRepository.updateStatus(feedbackId, status, adminResponse);

    await this.logActivity(
      adminId,
      adminName,
      'responded_feedback',
      'feedback',
      feedbackId,
      feedback.subject,
      `Responded to feedback: ${feedback.subject}`,
      { userId: feedback.userId, status }
    );

    return updatedFeedback;
  }

  async getActivities(page = 1, limit = 20, filter = {}) {
    return await activityRepository.findAll(filter, page, limit);
  }

  async getRecentActivities(limit = 10) {
    return await activityRepository.findRecent(limit);
  }

  async getDashboardStats() {
    const totalUsers = await userRepository.countAll();
    const totalAgents = await userRepository.countByRole('agent');
    const totalProperties = await propertyRepository.countAll();
    const pendingProperties = await propertyRepository.countByStatus('pending');
    const approvedProperties = await propertyRepository.countByStatus('approved');
    const rejectedProperties = await propertyRepository.countByStatus('rejected');
    const totalFeedbacks = await feedbackRepository.countAll();
    const pendingFeedbacks = await feedbackRepository.countByStatus('pending');

    return {
      users: {
        total: totalUsers,
        agents: totalAgents,
        regularUsers: totalUsers - totalAgents
      },
      properties: {
        total: totalProperties,
        pending: pendingProperties,
        approved: approvedProperties,
        rejected: rejectedProperties
      },
      feedbacks: {
        total: totalFeedbacks,
        pending: pendingFeedbacks
      }
    };
  }
}

export default new AdminService();