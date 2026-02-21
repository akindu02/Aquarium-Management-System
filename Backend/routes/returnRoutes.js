const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const returnController = require('../controllers/returnController');

// POST /api/returns  — Customer submits a return for a delivered order
router.post(
    '/',
    authenticate,
    authorize('customer'),
    returnController.createReturn
);

// GET /api/returns/my  — Must be before /:id to avoid conflict
// Customer fetches their own returns
router.get(
    '/my',
    authenticate,
    authorize('customer'),
    returnController.getMyReturns
);

// GET /api/returns  — Admin / Staff fetches all returns
router.get(
    '/',
    authenticate,
    authorize('admin', 'staff'),
    returnController.getAllReturns
);

// PATCH /api/returns/:id/status  — Admin / Staff updates return status + note
router.patch(
    '/:id/status',
    authenticate,
    authorize('admin', 'staff'),
    returnController.updateReturnStatus
);

module.exports = router;
