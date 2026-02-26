const { pool } = require('../config/db');

/**
 * Compute stock status from quantity (matches frontend logic)
 */
const getStockStatus = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
    return 'In Stock';
};

/**
 * Get all products with optional filters
 */
const getAllProducts = async ({ search = '', category = '' } = {}) => {
    let query = `
        SELECT
            p.product_id,
            p.name,
            p.category,
            p.description,
            p.price,
            p.discount_percent,
            ROUND(p.price - (p.price * p.discount_percent / 100), 2) AS sale_price,
            p.stock_quantity,
            p.image_url,
            p.supplier_id,
            s.company_name AS supplier_name,
            p.created_at,
            p.updated_at
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.user_id
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }
    if (category && category !== 'All') {
        params.push(category);
        query += ` AND p.category = $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const { rows } = await pool.query(query, params);

    // Attach computed stock_status
    return rows.map(r => ({ ...r, stock_status: getStockStatus(r.stock_quantity) }));
};

/**
 * Get single product by ID
 */
const getProductById = async (productId) => {
    const { rows } = await pool.query(`
        SELECT
            p.*,
            ROUND(p.price - (p.price * p.discount_percent / 100), 2) AS sale_price,
            s.company_name AS supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.user_id
        WHERE p.product_id = $1
    `, [productId]);

    if (!rows[0]) return null;
    return { ...rows[0], stock_status: getStockStatus(rows[0].stock_quantity) };
};

/**
 * Create a new product
 */
const createProduct = async ({ name, category, description, price, discount_percent, stock_quantity, supplier_id, image_url }) => {
    const { rows } = await pool.query(`
        INSERT INTO products (name, category, description, price, discount_percent, stock_quantity, supplier_id, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [
        name,
        category,
        description || null,
        price,
        discount_percent || 0,
        stock_quantity,
        supplier_id || null,
        image_url || null,
    ]);

    return { ...rows[0], stock_status: getStockStatus(rows[0].stock_quantity) };
};

/**
 * Update an existing product
 */
const updateProduct = async (productId, fields) => {
    const { name, category, description, price, discount_percent, stock_quantity, supplier_id, image_url } = fields;

    // supplier_id and description are intentionally nullable (can be cleared).
    // Use COALESCE only for non-nullable fields; always write nullable ones directly.
    const { rows } = await pool.query(`
        UPDATE products
        SET
            name             = COALESCE($1, name),
            category         = COALESCE($2, category),
            description      = $3,
            price            = COALESCE($4, price),
            discount_percent = COALESCE($5, discount_percent),
            stock_quantity   = COALESCE($6, stock_quantity),
            supplier_id      = $7,
            image_url        = COALESCE($8, image_url),
            updated_at       = CURRENT_TIMESTAMP
        WHERE product_id = $9
        RETURNING *
    `, [
        name        ?? null,
        category    ?? null,
        description ?? null,
        price       ?? null,
        discount_percent ?? null,
        stock_quantity   ?? null,
        supplier_id      ?? null,
        image_url        ?? null,
        productId,
    ]);

    if (!rows[0]) return null;
    return { ...rows[0], stock_status: getStockStatus(rows[0].stock_quantity) };
};

/**
 * Delete a product
 */
const deleteProduct = async (productId) => {
    const { rowCount } = await pool.query(
        'DELETE FROM products WHERE product_id = $1',
        [productId]
    );
    return rowCount > 0;
};

/**
 * Get low-stock products (stock_quantity <= 10) with their linked suppliers
 */
const getLowStockProducts = async () => {
    const { rows } = await pool.query(`
        SELECT
            p.product_id,
            p.name,
            p.category,
            p.price,
            p.stock_quantity,
            p.image_url,
            p.supplier_id,
            s.company_name AS supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.user_id
        WHERE p.stock_quantity <= 10
        ORDER BY p.stock_quantity ASC, p.name ASC
    `);
    return rows.map(r => ({ ...r, stock_status: getStockStatus(r.stock_quantity) }));
};

/**
 * Get suppliers linked to a specific product via product_suppliers bridge table
 */
const getProductSuppliers = async (productId) => {
    const { rows } = await pool.query(`
        SELECT
            ps.supplier_id,
            ps.is_primary,
            ps.supply_price,
            u.name AS user_name,
            s.company_name
        FROM product_suppliers ps
        JOIN suppliers s ON s.user_id = ps.supplier_id
        JOIN users u ON u.id = ps.supplier_id
        WHERE ps.product_id = $1
        ORDER BY ps.is_primary DESC, s.company_name ASC
    `, [productId]);
    return rows;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts, getProductSuppliers };
