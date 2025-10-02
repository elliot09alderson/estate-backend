import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['flat', 'land', 'shop', 'house'],
      message: 'Category must be one of: flat, land, shop, house'
    }
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: {
      values: ['sale', 'rent'],
      message: 'Listing type must be either sale or rent'
    }
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [1, 'Area must be at least 1 square unit']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: null
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    default: null
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    trim: true,
    maxlength: [10, 'Zip code cannot exceed 10 characters']
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 5;
      },
      message: 'Property must have between 1 and 5 images'
    }
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent ID is required']
  },
  agentName: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true
  },
  agentPhone: {
    type: String,
    required: [true, 'Agent phone is required'],
    trim: true
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each feature cannot exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
propertySchema.index({ category: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ state: 1 });
propertySchema.index({ zipCode: 1 });
propertySchema.index({ agentId: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ isFeatured: 1 });
propertySchema.index({ isApproved: 1 });
propertySchema.index({ createdAt: -1 });

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  address: 'text',
  city: 'text',
  state: 'text',
  zipCode: 'text'
});

const Property = mongoose.model('Property', propertySchema);

export default Property;