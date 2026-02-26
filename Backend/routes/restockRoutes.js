const express = require('express');
const router = express.Router();
const restockController = require('../controllers/restockController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// POST – staff submits a restock request
router.post('/', authenticate, authorize('admin', 'staff'), restockController.createRestockRequest);

// GET – supplier fetches their own requests (must be before /:id routes)
router.get('/supplier', authenticate, authorize('supplier'), restockController.getSupplierRestockRequests);

// GET – staff/admin lists all restock requests
router.get('/', authenticate, authorize('admin', 'staff'), restockController.getAllRestockRequests);

// PUT – staff marks request as Ordered / Received / Cancelled
router.put('/:id/staff-status', authenticate, authorize('admin', 'staff'), restockController.updateStaffRestockStatus);

// PUT – supplier or admin accepts or rejects a request
router.put('/:id/status', authenticate, authorize('supplier', 'admin'), restockController.updateRestockStatus);

module.exports = router;
