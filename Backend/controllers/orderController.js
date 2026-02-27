const orderService = require('../services/orderService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Customer creates a new order (requires auth + 'customer' role)
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, phone, totalAmount } = req.body;
        const customerId = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
        }
        if (!shippingAddress || !shippingAddress.trim()) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const result = await orderService.createOrder({
            customerId,
            items,
            shippingAddress: shippingAddress.trim(),
            phone: phone.trim(),
            totalAmount,
        });

        return res.status(201).json(result);
    } catch (err) {
        console.error('createOrder error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Failed to create order' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/pay
// Customer marks their order as paid  (mock gateway – just records the intent)
// ─────────────────────────────────────────────────────────────────────────────
const markOrderPaid = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const customerId = req.user.id;
        const { paymentMethod } = req.body;

        const result = await orderService.markOrderPaid(orderId, customerId, paymentMethod || 'Card');
        return res.json(result);
    } catch (err) {
        console.error('markOrderPaid error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Payment failed' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders
// Customer → own orders; Admin/Staff → all orders
// ─────────────────────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        const { id: userId, role } = req.user;

        const orders = await orderService.getOrders({ userId, role, status, search });
        return res.json({ success: true, data: orders });
    } catch (err) {
        console.error('getOrders error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Get a single order (customer must own it; admin/staff can access any)
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { id: userId, role } = req.user;

        const order = await orderService.getOrderById(orderId, userId, role);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        return res.json({ success: true, data: order });
    } catch (err) {
        console.error('getOrderById error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/cancel
// Customer cancels their own order while it is Pending or Processing
// ─────────────────────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const customerId = req.user.id;

        const result = await orderService.cancelOrder(orderId, customerId);
        return res.json(result);
    } catch (err) {
        console.error('cancelOrder error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Failed to cancel order' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Admin / Staff update an order's workflow status
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const order = await orderService.updateOrderStatus(orderId, status);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.json({ success: true, data: order, message: `Order status updated to "${status}"` });
    } catch (err) {
        console.error('updateOrderStatus error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/stats
// Summary counts for admin/staff dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getOrderStats = async (req, res) => {
    try {
        const stats = await orderService.getOrderStats();
        return res.json({ success: true, data: stats });
    } catch (err) {
        console.error('getOrderStats error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch order stats' });
    }
};

module.exports = { createOrder, markOrderPaid, cancelOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats };
