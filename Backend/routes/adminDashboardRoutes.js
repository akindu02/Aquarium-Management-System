const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard-stats — Admin overview dashboard statistics
router.get(
    '/dashboard-stats',
    authenticate,
    adminOnly,
    adminDashboardController.getDashboardStats
);

module.exports = router;
