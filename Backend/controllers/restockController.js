const restockService = require('../services/restockService');
const notificationService = require('../services/notificationService');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
function isNotPastDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) >= today;
}

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

        if (expected_date && expected_date !== '') {
            if (!DATE_REGEX.test(expected_date) || isNaN(new Date(expected_date).getTime()))
                return res.status(400).json({ success: false, message: 'Expected date must be a valid date (YYYY-MM-DD).' });
            if (!isNotPastDate(expected_date))
                return res.status(400).json({ success: false, message: 'Expected date cannot be a past date.' });
        }

        const result = await restockService.createRestockRequest({
            staffId: req.user.id,
            productId: parseInt(product_id),
            supplierId: parseInt(supplier_id),
            quantity: parseInt(quantity),
            unitCost: parseFloat(unit_cost),
            notes: notes || null,
            expectedDate: expected_date || null,
        });

        // Notify the supplier about the new restock request
        try {
            await notificationService.createNotification(
                parseInt(supplier_id),
                `New restock request #${result.request_id} has been assigned to you.`,
                'Order'
            );
        } catch (notifErr) {
            console.error('Failed to create notification for supplier:', notifErr);
        }

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
 * PUT /api/restock/:id/staff-status
 * Staff – update status to Ordered, Received, or Cancelled.
 */
const updateStaffRestockStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

        const updated = await restockService.updateStaffRestockStatus(req.params.id, status);
        if (!updated) return res.status(404).json({ success: false, message: 'Restock request not found.' });

        // Notify the supplier about status change
        if (updated.supplier_id) {
            try {
                let msg = '';
                if (status === 'Ordered') msg = `Restock Request #${updated.request_id} has been marked as Ordered by staff.`;
                else if (status === 'Received') msg = `Restock Request #${updated.request_id} delivery has been received. Stock updated.`;
                else if (status === 'Cancelled') msg = `Restock Request #${updated.request_id} has been cancelled by staff.`;
                if (msg) {
                    await notificationService.createNotification(
                        updated.supplier_id,
                        msg,
                        status === 'Cancelled' ? 'Alert' : 'Info'
                    );
                }
            } catch (notifErr) {
                console.error('Failed to create notification for supplier:', notifErr);
            }
        }

        res.json({ success: true, message: `Status updated to ${status}.`, data: updated });
    } catch (err) {
        console.error('updateStaffRestockStatus error:', err);
        res.status(400).json({ success: false, message: err.message || 'Failed to update status.' });
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

        // Notify the staff member who created the request
        if (updated.created_by_staff_id) {
            try {
                const statusMsg = status === 'Approved'
                    ? `Restock Request #${updated.request_id} has been approved by the supplier.`
                    : `Restock Request #${updated.request_id} has been rejected by the supplier.`;
                await notificationService.createNotification(
                    updated.created_by_staff_id,
                    statusMsg,
                    status === 'Approved' ? 'Success' : 'Alert'
                );
            } catch (notifErr) {
                console.error('Failed to create notification for staff:', notifErr);
            }
        }

        res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.`, data: updated });
    } catch (err) {
        console.error('updateRestockStatus error:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to update request status.' });
    }
};

module.exports = { createRestockRequest, getAllRestockRequests, getSupplierRestockRequests, updateRestockStatus, updateStaffRestockStatus };
