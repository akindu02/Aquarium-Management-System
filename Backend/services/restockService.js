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

/**
 * Get restock requests assigned to a specific supplier
 */
const getSupplierRestockRequests = async (supplierId) => {
    const { rows } = await pool.query(`
        SELECT
            rr.request_id,
            rr.status,
            rr.notes,
            rr.expected_date,
            rr.requested_at,
            rr.updated_at,
            u_staff.name   AS staff_name,
            ri.quantity,
            ri.unit_cost,
            ri.total_cost,
            p.product_id,
            p.name          AS product_name,
            p.category      AS product_category,
            p.stock_quantity AS current_stock,
            p.image_url
        FROM restock_requests rr
        LEFT JOIN users u_staff    ON u_staff.id    = rr.created_by_staff_id
        LEFT JOIN restock_items ri ON ri.request_id  = rr.request_id
        LEFT JOIN products p       ON p.product_id   = ri.product_id
        WHERE rr.supplier_id = $1
        ORDER BY
            CASE rr.status WHEN 'Pending' THEN 0 ELSE 1 END,
            rr.requested_at DESC
    `, [supplierId]);
    return rows;
};

/**
 * Staff updates a restock request status (Ordered / Received / Cancelled).
 * Ordered: staff confirms they placed the order after supplier Approved it.
 * Received: staff marks the delivery as received.
 * Cancelled: staff cancels a Pending request.
 */
const updateStaffRestockStatus = async (requestId, status) => {
    const allowed = ['Ordered', 'Received', 'Cancelled'];
    if (!allowed.includes(status)) throw new Error('Invalid status. Allowed: Ordered, Received, Cancelled.');

    const { rows } = await pool.query(`
        UPDATE restock_requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE request_id = $2
        RETURNING *
    `, [status, requestId]);

    return rows[0] || null;
};

/**
 * Supplier accepts or rejects a restock request.
 * Only the owning supplier may change the status.
 */
const updateRestockRequestStatus = async (requestId, status, supplierId) => {
    const allowed = ['Approved', 'Rejected'];
    if (!allowed.includes(status)) throw new Error('Invalid status.');

    const { rows } = await pool.query(`
        UPDATE restock_requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE request_id = $2 AND supplier_id = $3
        RETURNING *
    `, [status, requestId, supplierId]);

    return rows[0] || null;
};

module.exports = { createRestockRequest, getAllRestockRequests, getSupplierRestockRequests, updateRestockRequestStatus, updateStaffRestockStatus };
