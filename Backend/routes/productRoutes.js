const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// ── Public routes ──────────────────────────────────────────
// GET all products (customers can browse)
router.get('/', productController.getAllProducts);

// GET single product
router.get('/:id', productController.getProductById);

// ── Admin-only routes ──────────────────────────────────────
// POST – create product with optional image
router.post(
    '/',
    authenticate,
    adminOnly,
    upload.single('image'),
    productController.createProduct
);

// PUT – update product with optional new image
router.put(
    '/:id',
    authenticate,
    adminOnly,
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
