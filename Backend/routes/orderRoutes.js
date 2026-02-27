const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize, staffOrAdmin } = require('../middleware/authMiddleware');

// ─── Customer routes ────────────────────────────────────────────────────────

// POST /api/orders  — Customer places a new order
router.post(
    '/',
    authenticate,
    authorize('customer'),
    orderController.createOrder
);

// PATCH /api/orders/:id/pay  — Customer confirms payment after order creation
router.patch(
    '/:id/pay',
    authenticate,
    authorize('customer'),
    orderController.markOrderPaid
);

// ─── Shared read routes (customer sees own; admin/staff see all) ─────────────

// GET /api/orders/stats  — Must come BEFORE /:id route so "stats" isn't treated as an id
router.get(
    '/stats',
    authenticate,
    staffOrAdmin,
    orderController.getOrderStats
);

// GET /api/orders/refunds  — Must come BEFORE /:id route
router.get(
    '/refunds',
    authenticate,
    staffOrAdmin,
    orderController.getRefundRequests
);

// PATCH /api/orders/refunds/:refundId  — Admin / Staff process a refund
router.patch(
    '/refunds/:refundId',
    authenticate,
    staffOrAdmin,
    orderController.processRefund
);

// GET /api/orders
router.get(
    '/',
    authenticate,
    authorize('customer', 'admin', 'staff'),
    orderController.getOrders
);

// GET /api/orders/:id
router.get(
    '/:id',
    authenticate,
    authorize('customer', 'admin', 'staff'),
    orderController.getOrderById
);

// PATCH /api/orders/:id/cancel  — Customer cancels their own order (Pending / Processing only)
router.patch(
    '/:id/cancel',
    authenticate,
    authorize('customer'),
    orderController.cancelOrder
);

// ─── Admin / Staff management routes ────────────────────────────────────────

// PATCH /api/orders/:id/status  — Update workflow status
router.patch(
    '/:id/status',
    authenticate,
    staffOrAdmin,
    orderController.updateOrderStatus
);

module.exports = router;
