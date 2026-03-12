/**
 * Migration: Add walk-in booking support to service_bookings
 * - pos_customer_id: links to pos_customers for walk-in customers
 * - booked_by_staff_id: tracks which staff member created the booking
 * - unique constraint on slot_id: prevents double-booking the same slot
 *
 * Run once:  node Backend/db/migrations/add_walkin_booking_fields.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Running add_walkin_booking_fields migration...');
        await client.query('BEGIN');

        // 1. Add pos_customer_id — walk-in customer reference
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS pos_customer_id INTEGER
            REFERENCES pos_customers(pos_customer_id) ON DELETE SET NULL;
        `);
        console.log('✅  pos_customer_id column added');

        // 2. Add booked_by_staff_id — which staff member created the booking
        await client.query(`
            ALTER TABLE service_bookings
            ADD COLUMN IF NOT EXISTS booked_by_staff_id INTEGER
            REFERENCES users(id) ON DELETE SET NULL;
        `);
        console.log('✅  booked_by_staff_id column added');

        // 3. Add partial unique index on slot_id to prevent double-bookings
        //    Only enforces uniqueness for non-cancelled bookings (so cancelled slots can be rebooked)
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uq_service_bookings_active_slot
            ON service_bookings (slot_id)
            WHERE status != 'Cancelled';
        `);
        console.log('✅  partial unique index on slot_id added');

        // 4. Make customer_id nullable (walk-in bookings have no registered customer)
        await client.query(`
            ALTER TABLE service_bookings
            ALTER COLUMN customer_id DROP NOT NULL;
        `);
        console.log('✅  customer_id made nullable');

        // 5. Index for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_service_bookings_pos_customer
            ON service_bookings(pos_customer_id);
        `);
        console.log('✅  index on pos_customer_id added');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_service_bookings_staff
            ON service_bookings(booked_by_staff_id);
        `);
        console.log('✅  index on booked_by_staff_id added');

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
