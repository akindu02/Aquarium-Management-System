/**
 * Migration Script: Add POS walk-in customers support
 * - Creates pos_customers table
 * - Adds orders.pos_customer_id column + index
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const migrate = async () => {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting POS customers migration...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS pos_customers (
                pos_customer_id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS pos_customer_id INTEGER
            REFERENCES pos_customers(pos_customer_id)
            ON DELETE SET NULL;
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_pos_customer
            ON orders(pos_customer_id);
        `);

        await client.query('COMMIT');
        console.log('✅ POS customers migration complete!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
