const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { authenticate, staffOrAdmin } = require('../middleware/authMiddleware');

// POST /api/pos/orders — Create a cash-only POS order (walk-in)
router.post('/orders', authenticate, staffOrAdmin, posController.createPosOrder);

module.exports = router;
