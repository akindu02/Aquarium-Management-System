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

/**
 * GET /api/restock/supplier
 * Supplier – fetch all restock requests assigned to them.
 */
const getSupplierRestockRequests = async (req, res) => {
    try {
        const supplierId = req.user.id; // supplier_id === user id
        const requests = await restockService.getSupplierRestockRequests(supplierId);
        res.json({ success: true, data: requests });
    } catch (err) {
        console.error('getSupplierRestockRequests error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch restock requests.' });
    }
};

/**
 * PUT /api/restock/:id/status
 * Supplier – accept (Approved) or reject (Rejected) a request.
 */
const updateRestockStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

        const supplierId = req.user.id;
        const updated = await restockService.updateRestockRequestStatus(
            req.params.id,
            status,
            supplierId
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Request not found or not authorised.' });
        res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.`, data: updated });
    } catch (err) {
        console.error('updateRestockStatus error:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to update request status.' });
    }
};

module.exports = { createRestockRequest, getAllRestockRequests, getSupplierRestockRequests, updateRestockStatus };
