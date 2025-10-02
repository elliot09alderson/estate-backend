import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyTitle: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  senderPhone: {
    type: String,
    required: true,
    trim: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  repliedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ propertyId: 1 });
messageSchema.index({ isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;