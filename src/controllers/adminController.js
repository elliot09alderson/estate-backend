import adminService from '../services/adminService.js';

export const approveProperty = async (req, res) => {
  try {
    const property = await adminService.approveProperty(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const property = await adminService.rejectProperty(
      req.params.id,
      reason,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'Property rejected successfully',
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const result = await adminService.deleteProperty(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPendingProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getPendingProperties(page, limit);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.isApproved) filter.isApproved = req.query.isApproved;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.listingType) filter.listingType = req.query.listingType;

    const result = await adminService.getAllProperties(page, limit, filter);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deactivateAgent = async (req, res) => {
  try {
    const agent = await adminService.deactivateAgent(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'Agent deactivated successfully',
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const activateAgent = async (req, res) => {
  try {
    const agent = await adminService.activateAgent(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'Agent activated successfully',
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await adminService.blockUser(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await adminService.unblockUser(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await adminService.deleteUser(
      req.params.id,
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const result = await adminService.getAllUsers(page, limit, filter);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const result = await adminService.getAllAgents(page, limit, filter);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAllFeedbacks(page, limit);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getFeedbacksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getFeedbacksByStatus(status, page, limit);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const respondToFeedback = async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const feedback = await adminService.respondToFeedback(
      req.params.id,
      adminResponse,
      status || 'reviewed',
      req.user._id,
      req.user.name
    );
    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};

    if (req.query.action) filter.action = req.query.action;
    if (req.query.targetType) filter.targetType = req.query.targetType;

    const result = await adminService.getActivities(page, limit, filter);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await adminService.getRecentActivities(limit);
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};