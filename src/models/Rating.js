import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per property
ratingSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ propertyId: 1, createdAt: -1 });
ratingSchema.index({ rating: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;