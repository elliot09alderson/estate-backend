import Property from "../models/Property.js";

class PropertyRepository {
  async create(propertyData) {
    const property = new Property(propertyData);
    return await property.save();
  }

  async findById(id) {
    return await Property.findById(id).populate(
      "agentId",
      "name email phone avatar"
    );
  }

  async update(id, updateData) {
    return await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Property.findByIdAndDelete(id);
  }

  async findAll(filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const properties = await Property.find(filter)
      .populate("agentId", "name email phone avatar")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    const total = await Property.countDocuments(filter);
    return { properties, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByAgent(agentId, page = 1, limit = 10) {
    return await this.findAll({ agentId }, page, limit);
  }

  async findApproved(filter = {}, page = 1, limit = 10) {
    // Remove isApproved and isActive from filter if present to avoid conflicts
    const { isApproved, isActive, ...cleanFilter } = filter;
    console.log(cleanFilter);
    const approvedFilter = {
      ...cleanFilter,
      isApproved: "approved",
      isActive: true,
    };
    console.log("Approved filter:", approvedFilter);
    return await this.findAll(approvedFilter, page, limit);
  }

  async findPending(page = 1, limit = 10) {
    return await this.findAll({ isApproved: "pending" }, page, limit);
  }

  async approveProperty(id, adminId) {
    return await Property.findByIdAndUpdate(
      id,
      { isApproved: "approved", rejectionReason: null },
      { new: true }
    );
  }

  async rejectProperty(id, reason) {
    return await Property.findByIdAndUpdate(
      id,
      { isApproved: "rejected", rejectionReason: reason },
      { new: true }
    );
  }

  async updateStatus(id, isActive) {
    return await Property.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async incrementViews(id) {
    return await Property.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  async searchProperties(searchTerm, filter = {}, page = 1, limit = 10) {
    const searchFilter = {
      ...filter,
      $text: { $search: searchTerm },
    };
    return await this.findAll(searchFilter, page, limit);
  }

  async filterProperties(filters, page = 1, limit = 10) {
    const query = { isApproved: "approved", isActive: true };

    if (filters.category) query.category = filters.category;
    if (filters.listingType) query.listingType = filters.listingType;
    if (filters.minPrice)
      query.price = { ...query.price, $gte: filters.minPrice };
    if (filters.maxPrice)
      query.price = { ...query.price, $lte: filters.maxPrice };
    if (filters.location) query.location = new RegExp(filters.location, "i");
    if (filters.minArea) query.area = { ...query.area, $gte: filters.minArea };
    if (filters.maxArea) query.area = { ...query.area, $lte: filters.maxArea };
    if (filters.bedrooms) query.bedrooms = { $gte: filters.bedrooms };
    if (filters.bathrooms) query.bathrooms = { $gte: filters.bathrooms };

    const sort = {};
    if (filters.sortBy === "price_asc") sort.price = 1;
    else if (filters.sortBy === "price_desc") sort.price = -1;
    else if (filters.sortBy === "newest") sort.createdAt = -1;
    else if (filters.sortBy === "oldest") sort.createdAt = 1;
    else sort.createdAt = -1;

    return await this.findAll(query, page, limit, sort);
  }

  async countByStatus(status) {
    return await Property.countDocuments({ isApproved: status });
  }

  async countByAgent(agentId) {
    return await Property.countDocuments({ agentId });
  }

  async countAll() {
    return await Property.countDocuments();
  }

  async getStats() {
    const total = await this.countAll();
    const approved = await this.countByStatus("approved");
    const pending = await this.countByStatus("pending");
    const rejected = await this.countByStatus("rejected");

    return { total, approved, pending, rejected };
  }
}

export default new PropertyRepository();
