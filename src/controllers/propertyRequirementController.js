import propertyRequirementService from '../services/PropertyRequirementService.js';

export const createPropertyRequirement = async (req, res) => {
  try {
    const result = await propertyRequirementService.createRequirement(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPropertyRequirements = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, propertyType, budgetRange, assignedAgent, search } = req.query;

    const filters = {
      status,
      propertyType,
      budgetRange,
      assignedAgent,
      search
    };

    const result = await propertyRequirementService.getAllRequirements(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPropertyRequirementById = async (req, res) => {
  try {
    const result = await propertyRequirementService.getRequirementById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePropertyRequirement = async (req, res) => {
  try {
    const result = await propertyRequirementService.updateRequirement(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deletePropertyRequirement = async (req, res) => {
  try {
    const result = await propertyRequirementService.deleteRequirement(
      req.params.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePropertyRequirementStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const result = await propertyRequirementService.updateStatus(
      req.params.id,
      status,
      notes,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const assignAgentToRequirement = async (req, res) => {
  try {
    const { agentId } = req.body;
    const result = await propertyRequirementService.assignAgent(
      req.params.id,
      agentId,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPropertyRequirementStats = async (req, res) => {
  try {
    const result = await propertyRequirementService.getStats(req.user.role);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};