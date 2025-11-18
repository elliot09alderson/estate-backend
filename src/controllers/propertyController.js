import propertyService from "../services/propertyService.js";

export const createProperty = async (req, res) => {
  try {
    console.log('=== CREATING PROPERTY ===');
    console.log('User:', req.user?.email || 'Unknown User');
    console.log('User ID:', req.user?._id);
    console.log('Property Data Keys:', Object.keys(req.body));
    console.log('Images Count:', req.body.images?.length || 0);
    console.log('========================');

    const property = await propertyService.createProperty(
      req.body,
      req.user._id
    );

    console.log('Property created successfully:', property._id);

    res.status(201).json({
      success: true,
      message: "Property created successfully and pending approval",
      data: property,
    });
  } catch (error) {
    console.error('=== PROPERTY CREATION ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('User:', req.user?.email || 'Unknown User');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Request Body Keys:', Object.keys(req.body || {}));
    console.error('==============================');

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create property. Please try again.',
      error: 'PROPERTY_CREATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyDetails(req.params.id);
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.listingType) filters.listingType = req.query.listingType;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);
    if (req.query.location) filters.location = req.query.location;
    if (req.query.minArea) filters.minArea = parseFloat(req.query.minArea);
    if (req.query.maxArea) filters.maxArea = parseFloat(req.query.maxArea);
    if (req.query.bedrooms) filters.bedrooms = parseInt(req.query.bedrooms);
    if (req.query.bathrooms) filters.bathrooms = parseInt(req.query.bathrooms);
    if (req.query.sortBy) filters.sortBy = req.query.sortBy;

    console.log('Clean filters:', filters);
    const result = await propertyService.getApprovedProperties(
      filters,
      page,
      limit
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAgentProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const agentId = req.params.agentId || req.user._id;

    const result = await propertyService.getAgentProperties(
      agentId,
      page,
      limit
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchProperties = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await propertyService.searchProperties(q, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const togglePropertyStatus = async (req, res) => {
  try {
    const property = await propertyService.togglePropertyStatus(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: `Property ${
        property.isActive ? "activated" : "deactivated"
      } successfully`,
      data: property,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const trackPropertyView = async (req, res) => {
  try {
    const property = await propertyService.trackPropertyView(req.params.id);
    res.status(200).json({
      success: true,
      message: "View tracked successfully",
      data: { views: property.views },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
