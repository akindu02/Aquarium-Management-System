const posService = require('../services/posService');

// POST /api/pos/orders
// Staff/Admin creates a cash-only POS order for a walk-in customer
const createPosOrder = async (req, res) => {
    try {
        const staffId = req.user.id;
        const { customer, items } = req.body;

        const result = await posService.createPosOrder({ staffId, customer, items });
        return res.status(201).json(result);
    } catch (err) {
        console.error('createPosOrder error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Failed to create POS order' });
    }
};

module.exports = { createPosOrder };
