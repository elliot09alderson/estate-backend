import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'accepted', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  buyerPhone: {
    type: String
  },
  buyerEmail: {
    type: String
  }
}, { timestamps: true });

tourSchema.index({ buyer: 1, date: -1 });
tourSchema.index({ agent: 1, date: -1 });
tourSchema.index({ property: 1 });

export default mongoose.model('Tour', tourSchema);