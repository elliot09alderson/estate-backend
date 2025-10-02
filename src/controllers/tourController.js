import Tour from '../models/Tour.js';
import Property from '../models/Property.js';

export const getMyTours = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all tours for the buyer, but prioritize accepted and scheduled ones
    const tours = await Tour.find({ buyer: userId })
      .populate({
        path: 'property',
        select: 'title location address images price'
      })
      .populate({
        path: 'agent',
        select: 'name email phone avatar'
      })
      .sort({ status: 1, date: -1 }); // Sort by status first (accepted/scheduled first), then by date

    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tours'
    });
  }
};

export const scheduleTour = async (req, res) => {
  try {
    const { propertyId, date, time, notes, buyerPhone, buyerEmail } = req.body;
    const buyerId = req.user._id;

    const property = await Property.findById(propertyId).populate('agentId');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const existingTour = await Tour.findOne({
      property: propertyId,
      buyer: buyerId,
      date: new Date(date),
      status: 'scheduled'
    });

    if (existingTour) {
      return res.status(400).json({
        success: false,
        message: 'You already have a tour scheduled for this property on this date'
      });
    }

    const tour = new Tour({
      property: propertyId,
      buyer: buyerId,
      agent: property.agentId._id,
      date: new Date(date),
      time,
      notes,
      buyerPhone: buyerPhone || req.user.phone,
      buyerEmail: buyerEmail || req.user.email
    });

    await tour.save();

    const populatedTour = await Tour.findById(tour._id)
      .populate('property', 'title location address')
      .populate('agent', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Tour scheduled successfully',
      data: populatedTour
    });
  } catch (error) {
    console.error('Error scheduling tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling tour'
    });
  }
};

export const updateTourStatus = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Agents can accept/reject scheduled tours
    // Buyers can cancel their tours
    // Admins can update any status
    const isAgent = tour.agent.toString() === userId.toString();
    const isBuyer = tour.buyer.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAgent && !isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this tour'
      });
    }

    // Validation: Agents can only accept/reject scheduled tours
    if (isAgent && !isAdmin) {
      if (tour.status !== 'scheduled' && (status === 'accepted' || status === 'cancelled')) {
        return res.status(400).json({
          success: false,
          message: 'Can only accept or reject scheduled tours'
        });
      }
      if (status !== 'accepted' && status !== 'cancelled' && status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status for agent'
        });
      }
    }

    // Validation: Buyers can only cancel their tours
    if (isBuyer && !isAdmin) {
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'You can only cancel your tours'
        });
      }
    }

    tour.status = status;
    await tour.save();

    const updatedTour = await Tour.findById(tour._id)
      .populate('property', 'title location address')
      .populate('agent', 'name email phone')
      .populate('buyer', 'name email phone');

    res.json({
      success: true,
      message: 'Tour status updated successfully',
      data: updatedTour
    });
  } catch (error) {
    console.error('Error updating tour status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour status'
    });
  }
};

export const getAgentTours = async (req, res) => {
  try {
    const agentId = req.user._id;

    const tours = await Tour.find({ agent: agentId })
      .populate({
        path: 'property',
        select: 'title location address images price'
      })
      .populate({
        path: 'buyer',
        select: 'name email phone'
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching agent tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tours'
    });
  }
};