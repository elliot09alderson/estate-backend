import propertyRepository from '../repositories/propertyRepository.js';
import userRepository from '../repositories/userRepository.js';
import activityRepository from '../repositories/activityRepository.js';

class PropertyService {
  async createProperty(propertyData, userId) {
    const user = await userRepository.findById(userId);
    if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
      throw new Error('Only agents and admins can create properties');
    }

    if (user.role === 'agent' && !user.isActive) {
      throw new Error('Your agent account is deactivated');
    }

    const propertyWithUser = {
      ...propertyData,
      agentId: user._id,
      agentName: user.name,
      agentPhone: user.phone || user.email,
      // Auto-approve admin properties
      isApproved: user.role === 'admin' ? 'approved' : 'pending'
    };

    return await propertyRepository.create(propertyWithUser);
  }

  async getPropertyById(id) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  }

  async getPropertyDetails(id) {
    const property = await this.getPropertyById(id);
    await propertyRepository.incrementViews(id);
    return property;
  }

  async updateProperty(id, updateData, userId, userRole) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }

    if (userRole !== 'admin' && property.agentId.toString() !== userId.toString()) {
      throw new Error('You are not authorized to update this property');
    }

    const allowedUpdates = [
      'title', 'description', 'price', 'category', 'listingType',
      'area', 'bedrooms', 'bathrooms', 'location', 'address',
      'images', 'features', 'isActive'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    return await propertyRepository.update(id, updates);
  }

  async deleteProperty(id, userId, userRole) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }

    if (userRole !== 'admin' && property.agentId.toString() !== userId.toString()) {
      throw new Error('You are not authorized to delete this property');
    }

    return await propertyRepository.delete(id);
  }

  async getProperties(filters = {}, page = 1, limit = 10) {
    return await propertyRepository.filterProperties(filters, page, limit);
  }

  async getApprovedProperties(filters = {}, page = 1, limit = 10) {
    return await propertyRepository.findApproved(filters, page, limit);
  }

  async getAgentProperties(agentId, page = 1, limit = 10) {
    return await propertyRepository.findByAgent(agentId, page, limit);
  }

  async searchProperties(searchTerm, page = 1, limit = 10) {
    return await propertyRepository.searchProperties(searchTerm, {}, page, limit);
  }

  async togglePropertyStatus(id, userId, userRole) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }

    if (userRole !== 'admin' && property.agentId.toString() !== userId.toString()) {
      throw new Error('You are not authorized to modify this property');
    }

    return await propertyRepository.updateStatus(id, !property.isActive);
  }
}

export default new PropertyService();