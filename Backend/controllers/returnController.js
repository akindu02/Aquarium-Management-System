const returnService = require('../services/returnService');

// POST /api/returns  — Customer submits a return for a delivered order
const createReturn = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { orderId, reason, description } = req.body;

        if (!orderId || !reason) {
            return res.status(400).json({ success: false, message: 'orderId and reason are required.' });
        }

        const result = await returnService.createReturn(customerId, { orderId, reason, description });
        res.status(201).json(result);
    } catch (err) {
        const status = err.message.includes('not found') || err.message.includes('does not belong') ? 404
            : err.message.includes('already exists') || err.message.includes('Only delivered') ? 400
            : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// GET /api/returns/my  — Customer gets their own return requests
const getMyReturns = async (req, res) => {
    try {
        const data = await returnService.getMyReturns(req.user.id);
        res.json({ success: true, data });
    } catch (err) {
        console.error('getMyReturns error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/returns  — Admin/Staff gets all return requests
const getAllReturns = async (req, res) => {
    try {
        const { status, search } = req.query;
        const data = await returnService.getAllReturns({ status, search });
        res.json({ success: true, data });
    } catch (err) {
        console.error('getAllReturns error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/returns/:id/status  — Admin/Staff updates return status + note
const updateReturnStatus = async (req, res) => {
    try {
        const returnId = parseInt(req.params.id, 10);
        const { status, adminNote } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required.' });
        }

        const result = await returnService.updateReturnStatus(returnId, status, adminNote);
        res.json(result);
    } catch (err) {
        const code = err.message.includes('not found') ? 404
            : err.message.includes('Invalid status') || err.message.includes('already been refunded') ? 400
            : 500;
        res.status(code).json({ success: false, message: err.message });
    }
};

module.exports = { createReturn, getMyReturns, getAllReturns, updateReturnStatus };
