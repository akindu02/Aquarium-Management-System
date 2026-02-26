const express = require('express');
const router = express.Router();
const restockController = require('../controllers/restockController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// POST – staff submits a restock request
router.post('/', authenticate, authorize('admin', 'staff'), restockController.createRestockRequest);

// GET – staff/admin lists all restock requests
router.get('/', authenticate, authorize('admin', 'staff'), restockController.getAllRestockRequests);

module.exports = router;
