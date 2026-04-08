const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send notification
// @route   POST /api/notifications
// @access  Private (Admin/HR)
const sendNotification = async (req, res) => {
    const { recipientId, message, type } = req.body;

    if (!recipientId || !message) {
        return res.status(400).json({ message: 'Please provide recipient and message' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
    }

    const notification = await Notification.create({
        recipient: recipientId,
        sender: req.user.id,
        message,
        type: type || 'General'
    });

    res.status(201).json(notification);
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name role');

    res.status(200).json(notifications);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.recipient.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
};

module.exports = {
    sendNotification,
    getNotifications,
    markAsRead
};
