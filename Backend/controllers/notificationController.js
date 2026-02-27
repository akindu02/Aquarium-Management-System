const notificationService = require('../services/notificationService');

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user.
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        const unreadCount = await notificationService.getUnreadCount(req.user.id);
        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications.
 */
const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({ success: true, unreadCount: count });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch unread count.' });
    }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        res.json({ success: true, data: notification });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
    }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
const markAllAsRead = async (req, res) => {
    try {
        const count = await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true, message: `${count} notification(s) marked as read.` });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
    }
};

/**
 * DELETE /api/notifications/:id
 * Delete a single notification.
 */
const deleteNotification = async (req, res) => {
    try {
        const deleted = await notificationService.deleteNotification(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        res.json({ success: true, message: 'Notification deleted.' });
    } catch (err) {
        console.error('deleteNotification error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete notification.' });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
