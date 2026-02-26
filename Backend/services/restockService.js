const { pool } = require('../config/db');

/**
 * Create a restock request with a single line item.
 * Inserts into restock_requests + restock_items inside a transaction.
 */
const createRestockRequest = async ({ staffId, productId, supplierId, quantity, unitCost, notes, expectedDate }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1 — Create the parent request
        const { rows: reqRows } = await client.query(`
            INSERT INTO restock_requests
                (created_by_staff_id, supplier_id, notes, expected_date, status)
            VALUES ($1, $2, $3, $4, 'Pending')
            RETURNING *
        `, [staffId, supplierId, notes || null, expectedDate || null]);

        const request = reqRows[0];

        // 2 — Create the line item
        const { rows: itemRows } = await client.query(`
            INSERT INTO restock_items
                (request_id, product_id, quantity, unit_cost)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [request.request_id, productId, quantity, unitCost]);

        await client.query('COMMIT');

        return { ...request, item: itemRows[0] };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Get all restock requests (for admin/staff history view – optional future use)
 */
const getAllRestockRequests = async () => {
    const { rows } = await pool.query(`
        SELECT
            rr.request_id,
            rr.status,
            rr.notes,
            rr.expected_date,
            rr.requested_at,
            u_staff.name  AS staff_name,
            s.company_name AS supplier_name,
            ri.quantity,
            ri.unit_cost,
            ri.total_cost,
            p.name         AS product_name,
            p.stock_quantity
        FROM restock_requests rr
        LEFT JOIN users u_staff   ON u_staff.id   = rr.created_by_staff_id
        LEFT JOIN suppliers s     ON s.user_id     = rr.supplier_id
        LEFT JOIN restock_items ri ON ri.request_id = rr.request_id
        LEFT JOIN products p      ON p.product_id  = ri.product_id
        ORDER BY rr.requested_at DESC
    `);
    return rows;
};

module.exports = { createRestockRequest, getAllRestockRequests };
