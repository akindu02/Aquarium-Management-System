const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');

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

        const SL_PHONE_REGEX = /^(?:(?:\+|00)94|0)[0-9]{9}$/;
        const cleanPhone = phone.trim().replace(/\s/g, '');
        if (!SL_PHONE_REGEX.test(cleanPhone)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567).' });
        }

        const result = await orderService.createOrder({
            customerId,
            items,
            shippingAddress: shippingAddress.trim(),
            phone: phone.trim(),
            totalAmount,
        });

        await notificationService.createNotification(customerId, `Your order ${result.orderRef} has been created successfully.`, 'Order');

        // Notify staff about new online order
        notificationService.notifyAllStaff(
            `New online order ${result.orderRef} placed (LKR ${Number(totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}).`,
            'Order'
        ).catch(err => console.error('Staff notification error:', err));

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

        // Notify staff about cancelled order
        notificationService.notifyAllStaff(
            `Order #ORD-${String(orderId).padStart(4, '0')} was cancelled by the customer.`,
            'Alert'
        ).catch(err => console.error('Staff notification error:', err));

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

        await notificationService.createNotification(
            order.customer_id,
            `Your order ${order.order_ref} status has been updated to ${status}.`,
            'Order'
        );

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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/refunds
// Admin / Staff list all refund requests
// ─────────────────────────────────────────────────────────────────────────────
const getRefundRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const requests = await orderService.getRefundRequests({ status });
        return res.json({ success: true, data: requests });
    } catch (err) {
        console.error('getRefundRequests error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch refund requests' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/refunds/:refundId
// Admin / Staff advance a refund to Processing or Completed
// ─────────────────────────────────────────────────────────────────────────────
const processRefund = async (req, res) => {
    try {
        const refundId = parseInt(req.params.refundId, 10);
        const { status, adminNote, refundRef } = req.body;
        const result = await orderService.processRefund(refundId, { status, adminNote, refundRef });
        return res.json({ success: true, data: result, message: `Refund status updated to "${status}"` });
    } catch (err) {
        console.error('processRefund error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Failed to process refund' });
    }
};

module.exports = { createOrder, markOrderPaid, cancelOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats, getRefundRequests, processRefund };
