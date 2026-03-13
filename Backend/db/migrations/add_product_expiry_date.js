/**
 * Migration: Add expiry_date to products
 * Run: node Backend/db/migrations/add_product_expiry_date.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Running add_product_expiry_date migration...');
        await client.query('BEGIN');

        // Add expiry_date column
        await client.query(`
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS expiry_date DATE;
        `);
        console.log('✅ expiry_date column added to products table');

        await client.query('COMMIT');
        console.log('✨ Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
