import Property from "../models/Property.js";

class PropertyRepository {
  async create(propertyData) {
    const property = new Property(propertyData);
    return await property.save();
  }

  async findById(id) {
    return await Property.findById(id).populate(
      "agentId",
      "name email phone avatar averageRating totalRatings"
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
      .populate("agentId", "name email phone avatar averageRating totalRatings")
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

    // Use filterProperties method to handle complex search
    return await this.filterProperties(cleanFilter, page, limit);
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

    // Enhanced search functionality for location field
    if (filters.location) {
      const searchTerm = filters.location.trim();

      // Split search term by spaces and create OR conditions for each part
      const searchParts = searchTerm.split(/\s+/).filter(part => part.length > 0);

      if (searchParts.length > 0) {
        // Create OR conditions for each search part across all fields
        const orConditions = [];

        searchParts.forEach(part => {
          orConditions.push(
            { title: new RegExp(part, "i") },
            { description: new RegExp(part, "i") },
            { location: new RegExp(part, "i") },
            { address: new RegExp(part, "i") },
            { city: new RegExp(part, "i") },
            { state: new RegExp(part, "i") },
            { zipCode: new RegExp(part, "i") },
            { agentName: new RegExp(part, "i") },
            { agentPhone: new RegExp(part, "i") },
            { category: new RegExp(part, "i") },
            { listingType: new RegExp(part, "i") }
          );

          // Try to parse each part as number for price search
          const numericValue = parseFloat(part);
          if (!isNaN(numericValue)) {
            orConditions.push(
              { price: numericValue },
              { price: { $gte: numericValue - 100000, $lte: numericValue + 100000 } }
            );
          }
        });

        query.$or = orConditions;
      }
    }

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
