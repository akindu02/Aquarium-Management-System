/**
 * Migration Script: Add refund_requests table
 * Tracks refunds owed to customers when they cancel a paid order.
 * Staff / Admin can mark them Processing → Completed after sending money back.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting refund_requests migration...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS refund_requests (
                refund_id        SERIAL PRIMARY KEY,
                order_id         INTEGER REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
                payment_id       INTEGER REFERENCES payments(payment_id) ON DELETE SET NULL,
                customer_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
                amount           DECIMAL(10, 2) NOT NULL,
                status           VARCHAR(20) NOT NULL DEFAULT 'Pending',
                refund_ref       VARCHAR(100),
                admin_note       TEXT,
                created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                processed_at     TIMESTAMP WITH TIME ZONE,
                CONSTRAINT chk_refund_status CHECK (
                    status IN ('Pending', 'Processing', 'Completed')
                )
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_refund_requests_status
            ON refund_requests(status);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_refund_requests_customer
            ON refund_requests(customer_id);
        `);

        await client.query('COMMIT');
        console.log('✅ refund_requests migration complete!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
};

migrate().catch(() => process.exit(1));
