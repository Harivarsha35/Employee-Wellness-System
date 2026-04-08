const express = require('express');
const router = express.Router();
const { sendNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, sendNotification)
    .get(protect, getNotifications);

router.put('/:id/read', protect, markAsRead);

module.exports = router;
