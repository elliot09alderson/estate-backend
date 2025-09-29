import User from '../models/User.js';

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAgents(filter = {}, page = 1, limit = 10) {
    return await this.findAll({ ...filter, role: 'agent' }, page, limit);
  }

  async updateStatus(id, isActive) {
    return await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
  }

  async addFavorite(userId, propertyId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: propertyId } },
      { new: true }
    ).select('-password');
  }

  async removeFavorite(userId, propertyId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: propertyId } },
      { new: true }
    ).select('-password');
  }

  async getFavorites(userId) {
    const user = await User.findById(userId).populate('favorites');
    return user ? user.favorites : [];
  }

  async countByRole(role) {
    return await User.countDocuments({ role });
  }

  async countAll() {
    return await User.countDocuments();
  }
}

export default new UserRepository();