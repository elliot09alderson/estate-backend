import mongoose from 'mongoose';

const propertyRequirementSchema = new mongoose.Schema({
  propertyType: {
    type: String,
    enum: {
      values: ['apartment', 'house', 'commercial', 'land'],
      message: 'Property type must be one of: apartment, house, commercial, land'
    }
  },
  budgetRange: {
    type: String,
    enum: {
      values: ['0-10L', '10L-25L', '25L-50L', '50L-1Cr', '1Cr-2Cr', '2Cr+'],
      message: 'Invalid budget range'
    }
  },
  preferredLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  minSize: {
    type: Number,
    min: [0, 'Size cannot be negative']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative']
  },
  additionalRequirements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional requirements cannot exceed 1000 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'contacted', 'in_progress', 'fulfilled', 'cancelled'],
      message: 'Invalid status'
    },
    default: 'pending'
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching and sorting
propertyRequirementSchema.index({ createdAt: -1 });
propertyRequirementSchema.index({ status: 1 });
propertyRequirementSchema.index({ email: 1 });

const PropertyRequirement = mongoose.model('PropertyRequirement', propertyRequirementSchema);

export default PropertyRequirement;