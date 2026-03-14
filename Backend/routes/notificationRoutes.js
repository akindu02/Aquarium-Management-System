const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(authenticate);

// GET – fetch all notifications for the logged-in user
router.get('/', notificationController.getNotifications);

// GET – get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH – mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// DELETE – delete all notifications
router.delete('/clear-all', notificationController.clearAll);

// PATCH – mark a single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE – delete a single notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
