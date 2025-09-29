import PropertyRequirement from '../models/PropertyRequirement.js';

class PropertyRequirementService {
  async createRequirement(requirementData) {
    try {
      const requirement = new PropertyRequirement(requirementData);
      await requirement.save();
      return {
        success: true,
        data: requirement,
        message: 'Property requirement submitted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create property requirement: ${error.message}`);
    }
  }

  async getAllRequirements(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Build query based on filters
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.propertyType) {
        query.propertyType = filters.propertyType;
      }

      if (filters.budgetRange) {
        query.budgetRange = filters.budgetRange;
      }

      if (filters.assignedAgent) {
        query.assignedAgent = filters.assignedAgent;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } },
          { preferredLocation: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const [requirements, total] = await Promise.all([
        PropertyRequirement.find(query)
          .populate('assignedAgent', 'name email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        PropertyRequirement.countDocuments(query)
      ]);

      return {
        success: true,
        data: requirements,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch property requirements: ${error.message}`);
    }
  }

  async getRequirementById(id) {
    try {
      const requirement = await PropertyRequirement.findById(id)
        .populate('assignedAgent', 'name email phone');

      if (!requirement) {
        throw new Error('Property requirement not found');
      }

      return {
        success: true,
        data: requirement
      };
    } catch (error) {
      throw new Error(`Failed to fetch property requirement: ${error.message}`);
    }
  }

  async updateRequirement(id, updateData, userId, userRole) {
    try {
      const requirement = await PropertyRequirement.findById(id);

      if (!requirement) {
        throw new Error('Property requirement not found');
      }

      // Only admins can update requirements
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update property requirements');
      }

      // Update the requirement
      Object.assign(requirement, updateData);
      requirement.updatedAt = Date.now();

      await requirement.save();

      return {
        success: true,
        data: requirement,
        message: 'Property requirement updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update property requirement: ${error.message}`);
    }
  }

  async deleteRequirement(id, userRole) {
    try {
      if (userRole !== 'admin') {
        throw new Error('Only administrators can delete property requirements');
      }

      const requirement = await PropertyRequirement.findByIdAndDelete(id);

      if (!requirement) {
        throw new Error('Property requirement not found');
      }

      return {
        success: true,
        message: 'Property requirement deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete property requirement: ${error.message}`);
    }
  }

  async updateStatus(id, status, notes, userRole) {
    try {
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update requirement status');
      }

      const requirement = await PropertyRequirement.findById(id);

      if (!requirement) {
        throw new Error('Property requirement not found');
      }

      requirement.status = status;
      if (notes) {
        requirement.notes = notes;
      }
      requirement.updatedAt = Date.now();

      await requirement.save();

      return {
        success: true,
        data: requirement,
        message: 'Status updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  async assignAgent(id, agentId, userRole) {
    try {
      if (userRole !== 'admin') {
        throw new Error('Only administrators can assign agents');
      }

      const requirement = await PropertyRequirement.findById(id);

      if (!requirement) {
        throw new Error('Property requirement not found');
      }

      requirement.assignedAgent = agentId;
      requirement.status = 'in_progress';
      requirement.updatedAt = Date.now();

      await requirement.save();
      await requirement.populate('assignedAgent', 'name email phone');

      return {
        success: true,
        data: requirement,
        message: 'Agent assigned successfully'
      };
    } catch (error) {
      throw new Error(`Failed to assign agent: ${error.message}`);
    }
  }

  async getStats(userRole) {
    try {
      if (userRole !== 'admin') {
        throw new Error('Only administrators can view statistics');
      }

      const stats = await PropertyRequirement.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts = {
        pending: 0,
        contacted: 0,
        in_progress: 0,
        fulfilled: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        statusCounts[stat._id] = stat.count;
      });

      const total = await PropertyRequirement.countDocuments();

      return {
        success: true,
        data: {
          total,
          statusCounts,
          stats
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }
}

export default new PropertyRequirementService();