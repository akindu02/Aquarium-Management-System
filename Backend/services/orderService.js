const { pool, getClient } = require('../config/db');

/**
 * Compute a zero-padded order reference string, e.g. ORD-00042
 */
const fmtOrderId = (id) => `ORD-${String(id).padStart(5, '0')}`;

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ORDER  (transactional)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Creates an order, order_items, decrements stock, and inserts a pending payment.
 * Also upserts the customer profile row (phone + address).
 *
 * @param {object} params
 * @param {number}   params.customerId     - users.id of the authenticated customer
 * @param {Array}    params.items          - [{ productId, quantity }]
 * @param {string}   params.shippingAddress
 * @param {string}   params.phone
 * @param {number}   params.totalAmount    - pre-calculated total (server re-validates)
 * @returns {{ success, orderId, orderRef, totalAmount }}
 */
const createOrder = async ({ customerId, items, shippingAddress, phone, totalAmount }) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Upsert customer profile (phone + address are required by the DB)
        await client.query(
            `INSERT INTO customers (user_id, phone, address)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id) DO UPDATE SET phone = $2, address = $3`,
            [customerId, phone, shippingAddress]
        );

        // Calculate server-side total and validate stock
        let serverTotal = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await client.query(
                `SELECT product_id, name, price, discount_percent, stock_quantity
                 FROM products WHERE product_id = $1 FOR UPDATE`,
                [item.productId]
            );

            if (product.rows.length === 0) {
                throw new Error(`Product ${item.productId} not found`);
            }

            const p = product.rows[0];

            if (p.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for "${p.name}" (available: ${p.stock_quantity})`);
            }

            const unitPrice = parseFloat(
                (p.price - (p.price * p.discount_percent) / 100).toFixed(2)
            );

            serverTotal += unitPrice * item.quantity;
            enrichedItems.push({ ...item, unitPrice, name: p.name });
        }

        serverTotal = parseFloat(serverTotal.toFixed(2));

        // Insert order
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, total_amount, status)
             VALUES ($1, $2, 'Pending')
             RETURNING order_id, total_amount, status, order_date`,
            [customerId, serverTotal]
        );

        const orderId = orderResult.rows[0].order_id;

        // Insert order items and decrement stock
        for (const item of enrichedItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId, item.quantity, item.unitPrice]
            );

            await client.query(
                `UPDATE products SET stock_quantity = stock_quantity - $1
                 WHERE product_id = $2`,
                [item.quantity, item.productId]
            );
        }

        // Insert pending payment record
        await client.query(
            `INSERT INTO payments (order_id, method, amount, status)
             VALUES ($1, 'Card', $2, 'Pending')`,
            [orderId, serverTotal]
        );

        await client.query('COMMIT');

        return {
            success: true,
            orderId,
            orderRef: fmtOrderId(orderId),
            totalAmount: serverTotal,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK ORDER PAID  (transactional)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Transitions order to "Processing" and payment to "Completed".
 * Only the order owner can call this, and only while status = 'Pending'.
 */
const markOrderPaid = async (orderId, customerId, paymentMethod) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Verify ownership and current status
        const orderCheck = await client.query(
            `SELECT order_id, status, total_amount
             FROM orders WHERE order_id = $1 AND customer_id = $2`,
            [orderId, customerId]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found or you are not authorised');
        }
        if (orderCheck.rows[0].status !== 'Pending') {
            throw new Error('This order has already been processed');
        }

        // Advance order status
        await client.query(
            `UPDATE orders SET status = 'Processing' WHERE order_id = $1`,
            [orderId]
        );

        // Generate a transaction reference
        const txnRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Update payment record
        await client.query(
            `UPDATE payments
             SET status = 'Completed',
                 method = $1,
                 transaction_reference = $2,
                 payment_date = NOW()
             WHERE order_id = $3`,
            [paymentMethod || 'Card', txnRef, orderId]
        );

        await client.query('COMMIT');

        return {
            success: true,
            orderId,
            orderRef: fmtOrderId(orderId),
            transactionReference: txnRef,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ORDERS LIST
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns a list of orders.
 * Customers see only their own; admin/staff see all.
 */
const getOrders = async ({ userId, role, status, search } = {}) => {
    let sql = `
        SELECT
            o.order_id,
            o.status,
            o.total_amount,
            o.order_date,
            o.updated_at,
            COALESCE(u.name, pc.name)   AS customer_name,
            COALESCE(u.email, pc.email) AS customer_email,
            COALESCE(c.phone, pc.phone) AS phone,
            COALESCE(c.address, pc.address) AS shipping_address,
            p.status            AS payment_status,
            p.method            AS payment_method,
            p.transaction_reference,
            COALESCE(
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'name',       pr.name,
                        'quantity',   oi.quantity,
                        'unit_price', oi.unit_price,
                        'subtotal',   oi.subtotal
                    ) ORDER BY oi.order_item_id
                ) FILTER (WHERE oi.order_item_id IS NOT NULL),
                '[]'
            ) AS items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.user_id
        LEFT JOIN users     u ON c.user_id     = u.id
        LEFT JOIN pos_customers pc ON o.pos_customer_id = pc.pos_customer_id
        LEFT JOIN payments   p  ON p.order_id  = o.order_id
        LEFT JOIN order_items oi ON oi.order_id = o.order_id
        LEFT JOIN products   pr ON oi.product_id = pr.product_id
    `;

    const conditions = [];
    const params = [];

    // Customers only see their own orders
    if (role === 'customer') {
        params.push(userId);
        conditions.push(`o.customer_id = $${params.length}`);
    }

    if (status && status !== 'All') {
        params.push(status);
        conditions.push(`o.status = $${params.length}`);
    }

    if (search) {
        params.push(`%${search}%`);
        const idx = params.length;
        conditions.push(
            `(
                u.name ILIKE $${idx}
                OR u.email ILIKE $${idx}
                OR pc.name ILIKE $${idx}
                OR pc.phone ILIKE $${idx}
                OR pc.email ILIKE $${idx}
                OR CAST(o.order_id AS TEXT) ILIKE $${idx}
            )`
        );
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    sql += `
        GROUP BY
            o.order_id,
            u.name, u.email, c.phone, c.address,
            pc.name, pc.email, pc.phone, pc.address,
            p.status, p.method, p.transaction_reference
        ORDER BY o.order_id DESC
    `;

    const { rows } = await pool.query(sql, params);
    // Attach human-readable reference
    return rows.map((r) => ({ ...r, order_ref: fmtOrderId(r.order_id) }));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE ORDER
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (orderId, userId, role) => {
    let sql = `
        SELECT
            o.order_id,
            o.status,
            o.total_amount,
            o.order_date,
            o.updated_at,
            COALESCE(u.name, pc.name)   AS customer_name,
            COALESCE(u.email, pc.email) AS customer_email,
            COALESCE(c.phone, pc.phone) AS phone,
            COALESCE(c.address, pc.address) AS shipping_address,
            p.status            AS payment_status,
            p.method            AS payment_method,
            p.transaction_reference,
            COALESCE(
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'name',       pr.name,
                        'quantity',   oi.quantity,
                        'unit_price', oi.unit_price,
                        'subtotal',   oi.subtotal,
                        'image_url',  pr.image_url
                    ) ORDER BY oi.order_item_id
                ) FILTER (WHERE oi.order_item_id IS NOT NULL),
                '[]'
            ) AS items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.user_id
        LEFT JOIN users     u ON c.user_id     = u.id
        LEFT JOIN pos_customers pc ON o.pos_customer_id = pc.pos_customer_id
        LEFT JOIN payments   p  ON p.order_id  = o.order_id
        LEFT JOIN order_items oi ON oi.order_id = o.order_id
        LEFT JOIN products   pr ON oi.product_id = pr.product_id
        WHERE o.order_id = $1
    `;

    const params = [orderId];

    if (role === 'customer') {
        params.push(userId);
        sql += ` AND o.customer_id = $2`;
    }

    sql += `
        GROUP BY
            o.order_id,
            u.name, u.email, c.phone, c.address,
            pc.name, pc.email, pc.phone, pc.address,
            p.status, p.method, p.transaction_reference
    `;

    const { rows } = await pool.query(sql, params);
    if (!rows[0]) return null;
    return { ...rows[0], order_ref: fmtOrderId(rows[0].order_id) };
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL ORDER  (customer-initiated, transactional)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Allows a customer to cancel their own order while it is still
 * in 'Pending' or 'Processing' status (i.e. before it is shipped).
 * Stock is restored and, if the payment was already completed, the
 * payment record is flipped to 'Refunded'.
 *
 * @param {number} orderId
 * @param {number} customerId - users.id of the authenticated customer
 * @returns {{ success, orderId, orderRef, message }}
 */
const cancelOrder = async (orderId, customerId) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Verify ownership and cancellable status
        const orderCheck = await client.query(
            `SELECT order_id, status FROM orders
             WHERE order_id = $1 AND customer_id = $2`,
            [orderId, customerId]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found or you are not authorised to cancel it');
        }

        const { status } = orderCheck.rows[0];
        if (!['Pending', 'Processing'].includes(status)) {
            throw new Error(
                `Order cannot be cancelled because it is already "${status}". ` +
                'Only Pending or Processing orders can be cancelled.'
            );
        }

        // Restore stock for each item
        const items = await client.query(
            `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
            [orderId]
        );
        for (const item of items.rows) {
            await client.query(
                `UPDATE products
                 SET stock_quantity = stock_quantity + $1
                 WHERE product_id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // Cancel the order
        await client.query(
            `UPDATE orders SET status = 'Cancelled', updated_at = NOW()
             WHERE order_id = $1`,
            [orderId]
        );

        // If payment was already Completed → flip to Refunded and create a refund request
        const paymentRes = await client.query(
            `UPDATE payments
             SET status = 'Refunded'
             WHERE order_id = $1 AND status = 'Completed'
             RETURNING payment_id, amount`,
            [orderId]
        );

        let refundRequested = false;
        let refundAmount = null;

        if (paymentRes.rows.length > 0) {
            refundRequested = true;
            refundAmount = parseFloat(paymentRes.rows[0].amount);
            const paymentId = paymentRes.rows[0].payment_id;
            const orderRef = fmtOrderId(orderId);

            // Create refund request record
            await client.query(
                `INSERT INTO refund_requests (order_id, payment_id, customer_id, amount)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (order_id) DO NOTHING`,
                [orderId, paymentId, customerId, refundAmount]
            );

            // Notify the customer
            await client.query(
                `INSERT INTO notifications (user_id, message, type)
                 VALUES ($1, $2, 'Warning')`,
                [
                    customerId,
                    `Your order ${orderRef} has been cancelled. A refund of LKR ${refundAmount.toLocaleString()} has been initiated and will be processed within 3–5 business days.`,
                ]
            );

            // Notify all active admins
            const admins = await client.query(
                `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
            );
            for (const admin of admins.rows) {
                await client.query(
                    `INSERT INTO notifications (user_id, message, type)
                     VALUES ($1, $2, 'Warning')`,
                    [
                        admin.id,
                        `Refund required: Order ${orderRef} was cancelled by the customer. Amount: LKR ${refundAmount.toLocaleString()}. Please process the refund in Order Management → Refunds.`,
                    ]
                );
            }
        } else {
            // No paid payment — just inform the customer
            await client.query(
                `INSERT INTO notifications (user_id, message, type)
                 VALUES ($1, $2, 'Info')`,
                [customerId, `Your order ${fmtOrderId(orderId)} has been cancelled successfully.`]
            );
        }

        await client.query('COMMIT');

        return {
            success: true,
            orderId,
            orderRef: fmtOrderId(orderId),
            refundRequested,
            refundAmount,
            message: refundRequested
                ? `Order cancelled. A refund of LKR ${refundAmount.toLocaleString()} will be processed within 3–5 business days.`
                : 'Order cancelled successfully.',
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS  (admin / staff)
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (orderId, newStatus) => {
    const { rows } = await pool.query(
        `UPDATE orders SET status = $1 WHERE order_id = $2
         RETURNING order_id, status, total_amount, order_date`,
        [newStatus, orderId]
    );
    if (!rows[0]) return null;
    return { ...rows[0], order_ref: fmtOrderId(rows[0].order_id) };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY STATS  (admin / staff dashboard)
// ─────────────────────────────────────────────────────────────────────────────
const getOrderStats = async () => {
    const { rows } = await pool.query(`
        SELECT
            COUNT(*)                                               AS total_orders,
            COUNT(*) FILTER (WHERE status = 'Pending')            AS pending,
            COUNT(*) FILTER (WHERE status = 'Processing')         AS processing,
            COUNT(*) FILTER (WHERE status = 'Shipped')            AS shipped,
            COUNT(*) FILTER (WHERE status = 'Delivered')          AS delivered,
            COUNT(*) FILTER (WHERE status = 'Cancelled')          AS cancelled,
            COALESCE(SUM(total_amount) FILTER (
                WHERE status NOT IN ('Cancelled', 'Returned')
            ), 0)                                                  AS total_revenue
        FROM orders
    `);
    return rows[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// GET REFUND REQUESTS  (admin / staff)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns all refund requests, optionally filtered by status.
 */
const getRefundRequests = async ({ status } = {}) => {
    let sql = `
        SELECT
            rr.refund_id,
            rr.order_id,
            rr.amount,
            rr.status,
            rr.refund_ref,
            rr.admin_note,
            rr.created_at,
            rr.processed_at,
            COALESCE(u.name,  'Unknown') AS customer_name,
            COALESCE(u.email, '')        AS customer_email,
            p.method                     AS payment_method,
            p.transaction_reference
        FROM refund_requests rr
        LEFT JOIN users    u ON rr.customer_id = u.id
        LEFT JOIN payments p ON rr.payment_id  = p.payment_id
    `;

    const params = [];
    if (status && status !== 'All') {
        params.push(status);
        sql += ` WHERE rr.status = $1`;
    }

    sql += ` ORDER BY rr.created_at DESC`;

    const { rows } = await pool.query(sql, params);
    return rows.map(r => ({ ...r, order_ref: fmtOrderId(r.order_id) }));
};

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS REFUND  (admin / staff)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Admin / staff advance a refund request to 'Processing' or 'Completed'.
 * When marked Completed the customer receives an in-app notification.
 */
const processRefund = async (refundId, { status, adminNote, refundRef } = {}) => {
    const validStatuses = ['Processing', 'Completed'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const processedAt = status === 'Completed' ? 'NOW()' : 'NULL';

    const { rows } = await pool.query(
        `UPDATE refund_requests
         SET status       = $1,
             admin_note   = COALESCE($2, admin_note),
             refund_ref   = COALESCE($3, refund_ref),
             processed_at = ${processedAt}
         WHERE refund_id = $4
         RETURNING *`,
        [status, adminNote || null, refundRef || null, refundId]
    );

    if (!rows[0]) throw new Error('Refund request not found');

    const row = rows[0];

    // Notify the customer when the refund is completed
    if (status === 'Completed' && row.customer_id) {
        const refNote = refundRef ? ` Refund reference: ${refundRef}.` : '';
        await pool.query(
            `INSERT INTO notifications (user_id, message, type)
             VALUES ($1, $2, 'Success')`,
            [
                row.customer_id,
                `Your refund of LKR ${parseFloat(row.amount).toLocaleString()} for order ${fmtOrderId(row.order_id)} has been processed successfully.${refNote}`,
            ]
        );
    }

    return { ...row, order_ref: fmtOrderId(row.order_id) };
};

module.exports = {
    createOrder,
    markOrderPaid,
    cancelOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    getRefundRequests,
    processRefund,
};
