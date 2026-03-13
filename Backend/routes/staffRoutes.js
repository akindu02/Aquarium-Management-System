const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// GET /api/staff/dashboard-stats
// Accessible by staff and admin
router.get('/dashboard-stats', authenticate, authorize('staff', 'admin'), staffController.getStats);

module.exports = router;
