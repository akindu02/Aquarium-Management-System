const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, adminOnly, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// ── Public routes ──────────────────────────────────────────
// GET all products (customers can browse)
router.get('/', productController.getAllProducts);

// GET low-stock products (must be before /:id to avoid route conflict)
router.get('/low-stock', authenticate, authorize('admin', 'staff'), productController.getLowStockProducts);

// GET suppliers for a specific product
router.get('/:id/suppliers', authenticate, authorize('admin', 'staff'), productController.getProductSuppliers);

// GET single product
router.get('/:id', productController.getProductById);

// ── Admin-only routes ──────────────────────────────────────
// POST – create product with optional image (admin and staff)
router.post(
    '/',
    authenticate,
    authorize('admin', 'staff'),
    upload.single('image'),
    productController.createProduct
);

// PUT – update product with optional new image (admin and staff)
router.put(
    '/:id',
    authenticate,
    authorize('admin', 'staff'),
    upload.single('image'),
    productController.updateProduct
);

// DELETE – remove product
router.delete(
    '/:id',
    authenticate,
    adminOnly,
    productController.deleteProduct
);

module.exports = router;
