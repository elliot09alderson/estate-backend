import Message from '../models/Message.js';
import Property from '../models/Property.js';
import User from '../models/User.js';

// Send a message to property agent
export const sendMessage = async (req, res) => {
  try {
    const { propertyId, senderName, senderEmail, senderPhone, message } = req.body;

    // Find the property
    const property = await Property.findById(propertyId).populate('agentId');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Get sender ID if logged in
    const senderId = req.user ? req.user._id : null;

    // Create the message
    const newMessage = new Message({
      propertyId: property._id,
      propertyTitle: property.title,
      senderId,
      senderName,
      senderEmail,
      senderPhone,
      recipientId: property.agentId._id,
      recipientName: property.agentName,
      recipientEmail: property.agentId.email,
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get messages for logged in agent/admin
export const getMyMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { recipientId: req.user._id };

    if (filter === 'unread') {
      query.isRead = false;
    } else if (filter === 'read') {
      query.isRead = true;
    } else if (filter === 'archived') {
      query.isArchived = true;
    } else {
      query.isArchived = false; // Don't show archived by default
    }

    const messages = await Message.find(query)
      .populate('propertyId', 'title images')
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get single message
export const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('propertyId')
      .populate('senderId', 'name email phone');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has permission to view this message
    if (message.recipientId.toString() !== req.user._id.toString() &&
        (!message.senderId || message.senderId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this message'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has permission
    if (message.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this message'
      });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message
    });
  }
};

// Archive/Unarchive message
export const toggleArchive = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has permission
    if (message.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this message'
      });
    }

    message.isArchived = !message.isArchived;
    await message.save();

    res.status(200).json({
      success: true,
      message: message.isArchived ? 'Message archived' : 'Message unarchived',
      data: message
    });
  } catch (error) {
    console.error('Archive message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive message',
      error: error.message
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has permission
    if (message.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Get message statistics for dashboard
export const getMessageStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, unread, archived] = await Promise.all([
      Message.countDocuments({ recipientId: userId }),
      Message.countDocuments({ recipientId: userId, isRead: false }),
      Message.countDocuments({ recipientId: userId, isArchived: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        archived,
        read: total - unread
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
};