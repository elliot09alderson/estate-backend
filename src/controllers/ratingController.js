import Rating from '../models/Rating.js';
import Property from '../models/Property.js';

// Add or update a rating
export const addRating = async (req, res) => {
  try {
    const { propertyId, rating, review } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user already rated this property
    let existingRating = await Rating.findOne({ propertyId, userId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || '';
      await existingRating.save();
    } else {
      // Create new rating
      existingRating = new Rating({
        propertyId,
        userId,
        userName,
        rating,
        review: review || ''
      });
      await existingRating.save();
    }

    // Recalculate property average rating
    await updatePropertyRating(propertyId);

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: existingRating
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

// Get ratings for a property
export const getPropertyRatings = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ propertyId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ propertyId });

    res.status(200).json({
      success: true,
      data: {
        ratings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get property ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.message
    });
  }
};

// Get user's rating for a specific property
export const getUserRating = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({ propertyId, userId });

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rating',
      error: error.message
    });
  }
};

// Delete a rating
export const deleteRating = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOneAndDelete({ propertyId, userId });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Recalculate property average rating
    await updatePropertyRating(propertyId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};

// Helper function to update property average rating
async function updatePropertyRating(propertyId) {
  try {
    const result = await Rating.aggregate([
      { $match: { propertyId: propertyId } },
      {
        $group: {
          _id: '$propertyId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const averageRating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
    const totalRatings = result.length > 0 ? result[0].totalRatings : 0;

    await Property.findByIdAndUpdate(propertyId, {
      averageRating,
      totalRatings
    });
  } catch (error) {
    console.error('Update property rating error:', error);
  }
}