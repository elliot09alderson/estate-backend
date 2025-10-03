import feedbackService from '../services/feedbackService.js';

export const createFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await feedbackService.getUserFeedbacks(req.user._id, page, limit);
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

export const getPropertyFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await feedbackService.getPropertyFeedbacks(req.params.propertyId, page, limit);
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

export const updateFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.updateFeedback(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    await feedbackService.deleteFeedback(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPropertyAverageRating = async (req, res) => {
  try {
    const result = await feedbackService.getPropertyAverageRating(req.params.propertyId);
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
    const status = req.query.status || null;

    const result = await feedbackService.getAllFeedbacks(page, limit, status);
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
    const { adminResponse } = req.body;
    const feedback = await feedbackService.respondToFeedback(req.params.id, adminResponse);
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