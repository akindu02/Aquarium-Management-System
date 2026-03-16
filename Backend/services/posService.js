const { getClient } = require('../config/db');

/**
 * Compute a zero-padded order reference string, e.g. ORD-00042
 */
const fmtOrderId = (id) => `ORD-${String(id).padStart(5, '0')}`;

const fmtReceiptNumber = (orderId) => {
    const yyyyMMdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `RCP-${yyyyMMdd}-${String(orderId).padStart(5, '0')}`;
};

/**
 * Create a cash-only POS order for a walk-in customer.
 *
 * Transactional:
 * - inserts pos_customers
 * - inserts orders (customer_id NULL, staff_id set)
 * - inserts order_items
 * - decrements product stock (row-locked)
 * - inserts payments (method Cash, status Completed)
 * - inserts receipts (1 per order)
 */
const createPosOrder = async ({ staffId, customer, items, discount = 0, discountType = 'percent' }) => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }
        if (!customer || !customer.name || !customer.name.trim()) {
            throw new Error('Customer name is required');
        }

        // Insert walk-in customer
        const customerResult = await client.query(
            `INSERT INTO pos_customers (name, phone, email, address)
             VALUES ($1, $2, $3, $4)
             RETURNING pos_customer_id`,
            [
                customer.name.trim(),
                customer.phone?.trim() || null,
                customer.email?.trim() || null,
                customer.address?.trim() || null,
            ]
        );

        const posCustomerId = customerResult.rows[0].pos_customer_id;

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

            const unitPrice = parseFloat((p.price - (p.price * p.discount_percent) / 100).toFixed(2));
            serverTotal += unitPrice * item.quantity;
            enrichedItems.push({ ...item, unitPrice, name: p.name });
        }

        serverTotal = parseFloat(serverTotal.toFixed(2));
        
        const discountValue = parseFloat(discount) || 0;
        let discountAmount;
        if (discountType === 'fixed') {
            discountAmount = parseFloat(Math.min(discountValue, serverTotal).toFixed(2));
        } else {
            const discountPercent = Math.min(discountValue, 100);
            discountAmount = parseFloat((serverTotal * (discountPercent / 100)).toFixed(2));
        }

        let finalTotal = serverTotal - discountAmount;
        if (finalTotal < 0) finalTotal = 0;
        finalTotal = parseFloat(finalTotal.toFixed(2));

        // Insert order (POS orders are cash-only and completed immediately)
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, pos_customer_id, staff_id, total_amount, discount, status)
             VALUES (NULL, $1, $2, $3, $4, 'Delivered')
             RETURNING order_id, total_amount, discount, status, order_date`,
            [posCustomerId, staffId, finalTotal, discountAmount]
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

        // Insert completed cash payment
        const txnRef = `CASH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        await client.query(
            `INSERT INTO payments (order_id, method, amount, status, transaction_reference, payment_date)
             VALUES ($1, 'Cash', $2, 'Completed', $3, NOW())`,
            [orderId, finalTotal, txnRef]
        );

        // Insert receipt
        const receiptNumber = fmtReceiptNumber(orderId);
        await client.query(
            `INSERT INTO receipts (order_id, receipt_number)
             VALUES ($1, $2)`,
            [orderId, receiptNumber]
        );

        await client.query('COMMIT');

        return {
            success: true,
            orderId,
            orderRef: fmtOrderId(orderId),
            subtotalAmount: serverTotal,
            discountAmount: discountAmount,
            totalAmount: finalTotal,
            receiptNumber,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { createPosOrder };
