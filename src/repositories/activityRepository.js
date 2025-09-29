import Activity from '../models/Activity.js';

class ActivityRepository {
  async create(activityData) {
    const activity = new Activity(activityData);
    return await activity.save();
  }

  async findById(id) {
    return await Activity.findById(id).populate('adminId', 'name email avatar');
  }

  async findAll(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const activities = await Activity.find(filter)
      .populate('adminId', 'name email avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Activity.countDocuments(filter);
    return { activities, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByAdmin(adminId, page = 1, limit = 20) {
    return await this.findAll({ adminId }, page, limit);
  }

  async findByAction(action, page = 1, limit = 20) {
    return await this.findAll({ action }, page, limit);
  }

  async findByTarget(targetType, targetId, page = 1, limit = 20) {
    return await this.findAll({ targetType, targetId }, page, limit);
  }

  async findRecent(limit = 10) {
    return await Activity.find()
      .populate('adminId', 'name email avatar')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async delete(id) {
    return await Activity.findByIdAndDelete(id);
  }

  async deleteByTarget(targetType, targetId) {
    return await Activity.deleteMany({ targetType, targetId });
  }

  async countByAction(action) {
    return await Activity.countDocuments({ action });
  }

  async countAll() {
    return await Activity.countDocuments();
  }
}

export default new ActivityRepository();