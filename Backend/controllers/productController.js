const productService = require('../services/productService');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/products
 * Public – get all products (with optional ?search=&category= filters)
 */
const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const products = await productService.getAllProducts({ search, category });
        res.json({ success: true, data: products });
    } catch (err) {
        console.error('getAllProducts error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
};

/**
 * GET /api/products/:id
 * Public – get single product
 */
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, data: product });
    } catch (err) {
        console.error('getProductById error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch product.' });
    }
};

/**
 * POST /api/products
 * Admin only – create product (with optional image upload)
 */
const createProduct = async (req, res) => {
    try {
        const { name, category, description, price, discount_percent, stock_quantity, supplier_id, secondary_supplier_id, expiry_date } = req.body;

        // Validation
        if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Product name is required.' });
        if (!category) return res.status(400).json({ success: false, message: 'Category is required.' });
        if (!price || price < 0) return res.status(400).json({ success: false, message: 'Valid price is required.' });
        if (stock_quantity === undefined || stock_quantity < 0)
            return res.status(400).json({ success: false, message: 'Valid stock quantity is required.' });

        // Build image URL if file was uploaded
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/products/${req.file.filename}`;
        }

        const product = await productService.createProduct({
            name: name.trim(),
            category,
            description,
            price: parseFloat(price),
            discount_percent: parseFloat(discount_percent) || 0,
            stock_quantity: parseInt(stock_quantity),
            supplier_id: supplier_id && supplier_id !== '' ? parseInt(supplier_id) : null,
            secondary_supplier_id: secondary_supplier_id && secondary_supplier_id !== '' ? parseInt(secondary_supplier_id) : null,
            image_url,
            expiry_date: expiry_date && expiry_date !== '' ? expiry_date : null,
        });

        res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
    } catch (err) {
        console.error('createProduct error:', err);
        res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
};

/**
 * PUT /api/products/:id
 * Admin only – update product
 */
const updateProduct = async (req, res) => {
    try {
        const { name, category, description, price, discount_percent, stock_quantity, supplier_id, secondary_supplier_id, expiry_date } = req.body;

        let image_url = undefined;
        if (req.file) {
            image_url = `/uploads/products/${req.file.filename}`;
        }

        const product = await productService.updateProduct(req.params.id, {
            name:             name        ? name.trim()                    : undefined,
            category:         category    ? category                       : undefined,
            description:      description ? description.trim()             : null,
            price:            price       !== undefined && price !== ''    ? parseFloat(price)          : undefined,
            discount_percent: discount_percent !== undefined && discount_percent !== '' ? parseFloat(discount_percent) : undefined,
            stock_quantity:   stock_quantity   !== undefined && stock_quantity   !== '' ? parseInt(stock_quantity)    : undefined,
            // Convert empty string → null so PostgreSQL FK constraint is satisfied
            supplier_id:           supplier_id && supplier_id !== '' ? parseInt(supplier_id) : null,
            secondary_supplier_id: secondary_supplier_id && secondary_supplier_id !== '' ? parseInt(secondary_supplier_id) : null,
            image_url,
            expiry_date:           expiry_date && expiry_date !== '' ? expiry_date : null,
        });

        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, message: 'Product updated successfully.', data: product });
    } catch (err) {
        console.error('updateProduct error:', err);
        res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
};

/**
 * DELETE /api/products/:id
 * Admin only – delete product
 */
const deleteProduct = async (req, res) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('deleteProduct error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
};

/**
 * GET /api/products/low-stock
 * Staff / Admin – products with stock_quantity <= 10
 */
const getLowStockProducts = async (req, res) => {
    try {
        const products = await productService.getLowStockProducts();
        res.json({ success: true, data: products });
    } catch (err) {
        console.error('getLowStockProducts error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch low-stock products.' });
    }
};

/**
 * GET /api/products/:id/suppliers
 * Staff / Admin – suppliers linked to a product
 */
const getProductSuppliers = async (req, res) => {
    try {
        const suppliers = await productService.getProductSuppliers(req.params.id);
        res.json({ success: true, data: suppliers });
    } catch (err) {
        console.error('getProductSuppliers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch product suppliers.' });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts, getProductSuppliers };
