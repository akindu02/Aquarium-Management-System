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
            p.updated_at,
            (SELECT supplier_id FROM product_suppliers WHERE product_id = p.product_id AND is_primary = false LIMIT 1) AS secondary_supplier_id
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
            s.company_name AS supplier_name,
            (SELECT supplier_id FROM product_suppliers WHERE product_id = p.product_id AND is_primary = false LIMIT 1) AS secondary_supplier_id
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.user_id
        WHERE p.product_id = $1
    `, [productId]);

    if (!rows[0]) return null;
    return { ...rows[0], stock_status: getStockStatus(rows[0].stock_quantity) };
};

/**
 * Create a new product and sync its primary/secondary suppliers.
 */
const createProduct = async ({ name, category, description, price, discount_percent, stock_quantity, supplier_id, secondary_supplier_id, image_url, expiry_date }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1 — Insert into products
        const { rows: prodRows } = await client.query(`
            INSERT INTO products (name, category, description, price, discount_percent, stock_quantity, supplier_id, image_url, expiry_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            name,
            category,
            description || null,
            price,
            discount_percent || 0,
            stock_quantity,
            supplier_id || null, // Primary supplier in main table
            image_url || null,
            expiry_date || null,
        ]);

        const newProduct = prodRows[0];

        // 2 — Sync product_suppliers bridge table
        // Delete any existing (unlikely for new product but safe)
        await client.query('DELETE FROM product_suppliers WHERE product_id = $1', [newProduct.product_id]);

        // Insert primary supplier if exists
        if (supplier_id) {
            await client.query(`
                INSERT INTO product_suppliers (product_id, supplier_id, is_primary)
                VALUES ($1, $2, true)
            `, [newProduct.product_id, supplier_id]);
        }

        // Insert secondary supplier if exists and different
        if (secondary_supplier_id && secondary_supplier_id !== supplier_id) {
            await client.query(`
                INSERT INTO product_suppliers (product_id, supplier_id, is_primary)
                VALUES ($1, $2, false)
            `, [newProduct.product_id, secondary_supplier_id]);
        }

        await client.query('COMMIT');
        return { ...newProduct, stock_status: getStockStatus(newProduct.stock_quantity) };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Update an existing product and its supplier mappings.
 */
const updateProduct = async (productId, fields) => {
    const { name, category, description, price, discount_percent, stock_quantity, supplier_id, secondary_supplier_id, image_url, expiry_date } = fields;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1 — Update products table
        // We use COALESCE only for fields that aren't provided in the "fields" object at all.
        // If a field IS provided but is null/undefined, we might want to update it to that value.
        const { rows: prodRows } = await client.query(`
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
                expiry_date      = $9,
                updated_at       = CURRENT_TIMESTAMP
            WHERE product_id = $10
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
            expiry_date      ?? null,
            productId,
        ]);

        if (prodRows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // 2 — Sync product_suppliers bridge table
        // Primary supplier is whatever is in products.supplier_id
        const primaryId = prodRows[0].supplier_id;

        // Reset all mappings for this product
        await client.query('DELETE FROM product_suppliers WHERE product_id = $1', [productId]);

        // Insert Primary
        if (primaryId) {
            await client.query(`
                INSERT INTO product_suppliers (product_id, supplier_id, is_primary)
                VALUES ($1, $2, true)
            `, [productId, primaryId]);
        }

        // Insert Secondary (if provided and different)
        if (secondary_supplier_id && secondary_supplier_id !== primaryId) {
            await client.query(`
                INSERT INTO product_suppliers (product_id, supplier_id, is_primary)
                VALUES ($1, $2, false)
            `, [productId, secondary_supplier_id]);
        }

        await client.query('COMMIT');
        return { ...prodRows[0], stock_status: getStockStatus(prodRows[0].stock_quantity) };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
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
 * Get all products for inventory/restock overview with supplier info and computed stock status
 */
const getInventorySummary = async () => {
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
        ORDER BY p.stock_quantity ASC, p.name ASC
    `);
    return rows.map(r => ({ ...r, stock_status: getStockStatus(r.stock_quantity) }));
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
 * Get expiring products (have expiry_date set, ordered by date)
 */
const getExpiringProducts = async () => {
    const { rows } = await pool.query(`
        SELECT
            p.product_id,
            p.name,
            p.category,
            p.price,
            p.stock_quantity,
            p.image_url,
            p.supplier_id,
            p.expiry_date,
            s.company_name AS supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.user_id
        WHERE p.expiry_date IS NOT NULL
          AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY p.expiry_date ASC, p.name ASC
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

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts, getExpiringProducts, getProductSuppliers, getInventorySummary };
