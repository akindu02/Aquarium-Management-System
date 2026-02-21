const { pool, getClient } = require('../config/db');

/**
 * Format a return reference string, e.g. RET-00003
 */
const fmtReturnId = (id) => `RET-${String(id).padStart(5, '0')}`;

// ─────────────────────────────────────────────────────────────────────────────
// CREATE RETURN  (customer submits a full-order return request)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {number} customerId  - users.id of the authenticated customer
 * @param {object} params
 * @param {number} params.orderId     - numeric orders.order_id
 * @param {string} params.reason
 * @param {string} params.description
 */
const createReturn = async (customerId, { orderId, reason, description }) => {
    // Verify the order belongs to this customer and is Delivered
    const orderRes = await pool.query(
        `SELECT o.order_id, o.status, o.total_amount
         FROM orders o
         WHERE o.order_id = $1 AND o.customer_id = $2`,
        [orderId, customerId]
    );

    if (orderRes.rows.length === 0) {
        throw new Error('Order not found or does not belong to you.');
    }

    const order = orderRes.rows[0];

    if (order.status !== 'Delivered') {
        throw new Error('Only delivered orders can be returned.');
    }

    // Check if a return request already exists for this order
    const existingRes = await pool.query(
        `SELECT return_id FROM order_returns WHERE order_id = $1`,
        [orderId]
    );

    if (existingRes.rows.length > 0) {
        throw new Error('A return request already exists for this order.');
    }

    // Insert the return record (refund_amount = full order total)
    const insertRes = await pool.query(
        `INSERT INTO order_returns (order_id, reason, description, refund_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING return_id, status, created_at`,
        [orderId, reason, description || null, order.total_amount]
    );

    const ret = insertRes.rows[0];

    return {
        success: true,
        returnId: ret.return_id,
        returnRef: fmtReturnId(ret.return_id),
        status: ret.status,
        refundAmount: parseFloat(order.total_amount),
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY RETURNS  (customer view — own returns only)
// ─────────────────────────────────────────────────────────────────────────────
const getMyReturns = async (customerId) => {
    const { rows } = await pool.query(
        `SELECT
            r.return_id,
            r.order_id,
            o.order_id                                      AS order_ref_id,
            CONCAT('ORD-', LPAD(o.order_id::text, 5, '0')) AS order_ref,
            r.reason,
            r.description,
            r.status,
            r.refund_amount,
            r.admin_note,
            r.created_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'name',     p.name,
                        'qty',      oi.quantity,
                        'price',    oi.unit_price
                    ) ORDER BY oi.order_item_id
                ) FILTER (WHERE oi.order_item_id IS NOT NULL),
                '[]'
            ) AS items
         FROM order_returns r
         JOIN orders o ON o.order_id = r.order_id
         LEFT JOIN order_items oi ON oi.order_id = o.order_id
         LEFT JOIN products p ON p.product_id = oi.product_id
         WHERE o.customer_id = $1
         GROUP BY r.return_id, r.order_id, o.order_id, r.reason,
                  r.description, r.status, r.refund_amount, r.admin_note, r.created_at
         ORDER BY r.created_at DESC`,
        [customerId]
    );

    return rows.map(r => ({
        returnId: r.return_id,
        returnRef: fmtReturnId(r.return_id),
        orderId: r.order_id,
        orderRef: r.order_ref,
        reason: r.reason,
        description: r.description,
        status: r.status,
        refundAmount: parseFloat(r.refund_amount),
        adminNote: r.admin_note || '',
        submittedDate: r.created_at ? r.created_at.toISOString().split('T')[0] : '',
        items: r.items,
    }));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL RETURNS  (admin / staff view)
// ─────────────────────────────────────────────────────────────────────────────
const getAllReturns = async ({ status, search } = {}) => {
    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
        params.push(status);
        conditions.push(`r.status = $${params.length}`);
    }

    if (search) {
        params.push(`%${search}%`);
        conditions.push(
            `(u.name ILIKE $${params.length} OR CONCAT('RET-', LPAD(r.return_id::text,5,'0')) ILIKE $${params.length} OR CONCAT('ORD-', LPAD(o.order_id::text,5,'0')) ILIKE $${params.length})`
        );
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
        `SELECT
            r.return_id,
            CONCAT('RET-', LPAD(r.return_id::text, 5, '0'))  AS return_ref,
            r.order_id,
            CONCAT('ORD-', LPAD(o.order_id::text, 5, '0'))   AS order_ref,
            u.name                                             AS customer_name,
            u.email                                            AS customer_email,
            r.reason,
            r.description,
            r.status,
            r.refund_amount,
            r.admin_note,
            r.created_at,
            COALESCE(
                STRING_AGG(p.name || ' (x' || oi.quantity || ')', ', '
                    ORDER BY oi.order_item_id),
                ''
            ) AS items_summary
         FROM order_returns r
         JOIN orders o ON o.order_id = r.order_id
         JOIN customers c ON c.user_id = o.customer_id
         JOIN users u ON u.id = c.user_id
         LEFT JOIN order_items oi ON oi.order_id = o.order_id
         LEFT JOIN products p ON p.product_id = oi.product_id
         ${where}
         GROUP BY r.return_id, o.order_id, u.name, u.email,
                  r.reason, r.description, r.status, r.refund_amount,
                  r.admin_note, r.created_at
         ORDER BY r.created_at DESC`,
        params
    );

    return rows.map(r => ({
        returnId: r.return_id,
        returnRef: r.return_ref,
        orderId: r.order_id,
        orderRef: r.order_ref,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        reason: r.reason,
        description: r.description,
        status: r.status,
        refundAmount: parseFloat(r.refund_amount),
        adminNote: r.admin_note || '',
        submittedDate: r.created_at ? r.created_at.toISOString().split('T')[0] : '',
        itemsSummary: r.items_summary,
    }));
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE RETURN STATUS  (admin / staff)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Updates the return status and admin note.
 * When status becomes 'Refunded':
 *   - Sets payment.status = 'Refunded'
 *   - Sets order.status   = 'Returned'
 *   - Restocks product quantities from order_items
 */
const updateReturnStatus = async (returnId, newStatus, adminNote) => {
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Refunded'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Fetch the return to get order_id
        const retRes = await client.query(
            `SELECT r.return_id, r.order_id, r.status
             FROM order_returns r WHERE r.return_id = $1`,
            [returnId]
        );

        if (retRes.rows.length === 0) {
            throw new Error('Return request not found.');
        }

        const { order_id, status: currentStatus } = retRes.rows[0];

        if (currentStatus === 'Refunded') {
            throw new Error('This return has already been refunded.');
        }

        // Update the return record
        await client.query(
            `UPDATE order_returns
             SET status = $1, admin_note = $2, updated_at = CURRENT_TIMESTAMP
             WHERE return_id = $3`,
            [newStatus, adminNote || null, returnId]
        );

        // If marking Refunded — update payment, order, and restock
        if (newStatus === 'Refunded') {
            // Update payment to Refunded
            await client.query(
                `UPDATE payments SET status = 'Refunded'
                 WHERE order_id = $1`,
                [order_id]
            );

            // Update order status to Returned
            await client.query(
                `UPDATE orders SET status = 'Returned', updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = $1`,
                [order_id]
            );

            // Restock: add back the quantities from order_items
            await client.query(
                `UPDATE products p
                 SET stock_quantity = p.stock_quantity + oi.quantity,
                     updated_at = CURRENT_TIMESTAMP
                 FROM order_items oi
                 WHERE oi.product_id = p.product_id
                   AND oi.order_id = $1`,
                [order_id]
            );
        }

        await client.query('COMMIT');

        return { success: true, returnId, newStatus };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { createReturn, getMyReturns, getAllReturns, updateReturnStatus };
