/**
 * Migration: Add slot_id, service_address, service_phone, service_city to service_bookings
 * Run once: node Backend/db/migrations/add_booking_fields.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Running add_booking_fields migration...');
        await client.query('BEGIN');

        // Add slot_id column — RESTRICT prevents deleting a slot that has a booking
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS slot_id INTEGER REFERENCES service_time_slots(slot_id) ON DELETE RESTRICT;
        `);
        console.log('✅  slot_id column added');

        // Drop redundant service_id if it still exists (derivable via slot_id → service_time_slots)
        await client.query(`
            ALTER TABLE service_bookings
            DROP COLUMN IF EXISTS service_id;
        `);
        console.log('✅  service_id column removed (redundant — use slot_id JOIN)');
        // Add service_phone column
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS service_phone VARCHAR(20);
        `);
        console.log('✅  service_phone column added');

        // Add service_city column
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS service_city VARCHAR(100);
        `);
        console.log('✅  service_city column added');

        // Add service_address column
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS service_address TEXT;
        `);
        console.log('✅  service_address column added');

        await client.query('COMMIT');
        console.log('🎉  Migration completed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌  Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
};

migrate();
