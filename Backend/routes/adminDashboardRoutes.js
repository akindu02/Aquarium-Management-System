const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const salesReportController = require('../controllers/salesReportController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard-stats — Admin overview dashboard statistics
router.get(
    '/dashboard-stats',
    authenticate,
    adminOnly,
    adminDashboardController.getDashboardStats
);

// GET /api/admin/sales-report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get(
    '/sales-report',
    authenticate,
    adminOnly,
    salesReportController.getSalesReport
);

module.exports = router;
