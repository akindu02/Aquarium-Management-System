const restockService = require('../services/restockService');

/**
 * POST /api/restock
 * Staff creates a restock request for a low-stock product.
 */
const createRestockRequest = async (req, res) => {
    try {
        const { product_id, supplier_id, quantity, unit_cost, notes, expected_date } = req.body;

        // Validation
        if (!product_id) return res.status(400).json({ success: false, message: 'Product is required.' });
        if (!supplier_id) return res.status(400).json({ success: false, message: 'Supplier is required.' });
        if (!quantity || Number(quantity) < 1)
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
        if (unit_cost === undefined || unit_cost === '' || Number(unit_cost) < 0)
            return res.status(400).json({ success: false, message: 'Unit cost must be 0 or greater.' });

        const result = await restockService.createRestockRequest({
            staffId: req.user.id,
            productId: parseInt(product_id),
            supplierId: parseInt(supplier_id),
            quantity: parseInt(quantity),
            unitCost: parseFloat(unit_cost),
            notes: notes || null,
            expectedDate: expected_date || null,
        });

        res.status(201).json({
            success: true,
            message: 'Restock request submitted successfully.',
            data: result,
        });
    } catch (err) {
        console.error('createRestockRequest error:', err);
        res.status(500).json({ success: false, message: 'Failed to submit restock request.' });
    }
};

/**
 * GET /api/restock
 * Staff / Admin – fetch all restock requests.
 */
const getAllRestockRequests = async (req, res) => {
    try {
        const requests = await restockService.getAllRestockRequests();
        res.json({ success: true, data: requests });
    } catch (err) {
        console.error('getAllRestockRequests error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch restock requests.' });
    }
};

module.exports = { createRestockRequest, getAllRestockRequests };
