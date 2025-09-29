import Feedback from '../models/Feedback.js';

class FeedbackRepository {
  async create(feedbackData) {
    const feedback = new Feedback(feedbackData);
    return await feedback.save();
  }

  async findById(id) {
    return await Feedback.findById(id)
      .populate('userId', 'name email avatar')
      .populate('propertyId', 'title');
  }

  async update(id, updateData) {
    return await Feedback.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Feedback.findByIdAndDelete(id);
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'name email avatar')
      .populate('propertyId', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Feedback.countDocuments(filter);
    return { feedbacks, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByUser(userId, page = 1, limit = 10) {
    return await this.findAll({ userId }, page, limit);
  }

  async findByProperty(propertyId, page = 1, limit = 10) {
    return await this.findAll({ propertyId }, page, limit);
  }

  async findByStatus(status, page = 1, limit = 10) {
    return await this.findAll({ status }, page, limit);
  }

  async updateStatus(id, status, adminResponse = null) {
    const updateData = { status };
    if (adminResponse) updateData.adminResponse = adminResponse;
    return await this.update(id, updateData);
  }

  async countByStatus(status) {
    return await Feedback.countDocuments({ status });
  }

  async countAll() {
    return await Feedback.countDocuments();
  }

  async getAverageRating(propertyId) {
    const result = await Feedback.aggregate([
      { $match: { propertyId, rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    return result.length > 0 ? result[0] : { avgRating: 0, count: 0 };
  }
}

export default new FeedbackRepository();