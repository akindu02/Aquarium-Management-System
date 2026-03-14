const { pool } = require('../config/db');

/**
 * Create a new notification for a user.
 */
const createNotification = async (userId, message, type = 'Info') => {
    const { rows } = await pool.query(
        `INSERT INTO notifications (user_id, message, type)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, message, type]
    );
    return rows[0];
};

/**
 * Get all notifications for a user, newest first.
 * Optionally limit results.
 */
const getUserNotifications = async (userId, limit = 50) => {
    const { rows } = await pool.query(
        `SELECT notification_id, user_id, message, type, is_read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return rows;
};

/**
 * Get count of unread notifications for a user.
 */
const getUnreadCount = async (userId) => {
    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM notifications
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return rows[0].count;
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (notificationId, userId) => {
    const { rows } = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE notification_id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return rows[0] || null;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllAsRead = async (userId) => {
    const { rowCount } = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return rowCount;
};

/**
 * Delete a single notification.
 */
const deleteNotification = async (notificationId, userId) => {
    const { rowCount } = await pool.query(
        `DELETE FROM notifications
         WHERE notification_id = $1 AND user_id = $2`,
        [notificationId, userId]
    );
    return rowCount > 0;
};

/**
 * Clear all notifications for a user.
 */
const clearAll = async (userId) => {
    const { rowCount } = await pool.query(
        `DELETE FROM notifications WHERE user_id = $1`,
        [userId]
    );
    return rowCount;
};

/**
 * Notify all active staff members.
 */
const notifyAllStaff = async (message, type = 'Info') => {
    const { rows: staffUsers } = await pool.query(
        `SELECT id FROM users WHERE role = 'staff' AND is_active = true`
    );
    const promises = staffUsers.map(u =>
        createNotification(u.id, message, type)
    );
    return Promise.allSettled(promises);
};

/**
 * Notify all active admins.
 */
const notifyAllAdmins = async (message, type = 'Info') => {
    const { rows: adminUsers } = await pool.query(
        `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
    );
    const promises = adminUsers.map(u =>
        createNotification(u.id, message, type)
    );
    return Promise.allSettled(promises);
};

/**
 * Notify all staff AND admins.
 */
const notifyStaffAndAdmins = async (message, type = 'Info') => {
    const { rows: users } = await pool.query(
        `SELECT id FROM users WHERE role IN ('staff', 'admin') AND is_active = true`
    );
    const promises = users.map(u =>
        createNotification(u.id, message, type)
    );
    return Promise.allSettled(promises);
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notifyAllStaff,
    notifyAllAdmins,
    notifyStaffAndAdmins,
};
