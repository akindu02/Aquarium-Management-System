const posService = require('../services/posService');

const SL_PHONE_REGEX = /^(?:(?:\+|00)94|0)[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/pos/orders
// Staff/Admin creates a cash-only POS order for a walk-in customer
const createPosOrder = async (req, res) => {
    try {
        const staffId = req.user.id;
        const { customer, items, discount, discountType } = req.body;

        if (customer?.phone && customer.phone.trim() !== '') {
            const cleanPhone = customer.phone.trim().replace(/\s/g, '');
            if (!SL_PHONE_REGEX.test(cleanPhone))
                return res.status(400).json({ success: false, message: 'Customer phone must be a valid Sri Lankan number (e.g. 0771234567 or +94771234567).' });
        }
        if (customer?.email && customer.email.trim() !== '') {
            if (!EMAIL_REGEX.test(customer.email.trim()))
                return res.status(400).json({ success: false, message: 'Customer email is not a valid email address.' });
        }

        const result = await posService.createPosOrder({
            staffId, customer, items,
            discount: parseFloat(discount) || 0,
            discountType: discountType === 'fixed' ? 'fixed' : 'percent',
        });
        return res.status(201).json(result);
    } catch (err) {
        console.error('createPosOrder error:', err.message);
        return res.status(400).json({ success: false, message: err.message || 'Failed to create POS order' });
    }
};

module.exports = { createPosOrder };
