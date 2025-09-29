import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  adminName: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'approved_property',
      'rejected_property',
      'deleted_property',
      'deactivated_agent',
      'activated_agent',
      'blocked_user',
      'unblocked_user',
      'deleted_user',
      'updated_property',
      'responded_feedback'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['user', 'property', 'feedback']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

activitySchema.index({ adminId: 1 });
activitySchema.index({ action: 1 });
activitySchema.index({ targetType: 1, targetId: 1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;