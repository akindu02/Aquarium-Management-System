/**
 * Migration Script: Update user roles
 * Migrates from old roles (user, manager, admin) to new roles (customer, supplier, staff, admin)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../../config/db');

const runMigration = async () => {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting role migration...');

        await client.query('BEGIN');

        // Step 1: Check if new enum already exists
        const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role_new'
      );
    `);

        if (!enumCheck.rows[0].exists) {
            console.log('📌 Creating new enum type...');
            await client.query(`
        CREATE TYPE user_role_new AS ENUM ('customer', 'supplier', 'staff', 'admin');
      `);
        }

        // Step 2: Check current enum values
        const currentEnum = await client.query(`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
      ORDER BY enumsortorder;
    `);

        const currentValues = currentEnum.rows.map(r => r.enumlabel);
        console.log('📋 Current enum values:', currentValues);

        // Check if already migrated
        if (currentValues.includes('customer')) {
            console.log('✅ Database already has new role structure. Skipping migration.');
            await client.query('COMMIT');
            return;
        }

        // Step 3: Drop default
        console.log('📌 Removing column default...');
        await client.query('ALTER TABLE users ALTER COLUMN role DROP DEFAULT;');

        // Step 4: Convert column to new enum
        console.log('📌 Converting roles (user→customer, manager→staff)...');
        await client.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE user_role_new 
      USING (
        CASE role::text
          WHEN 'user' THEN 'customer'::user_role_new
          WHEN 'manager' THEN 'staff'::user_role_new
          WHEN 'admin' THEN 'admin'::user_role_new
          ELSE 'customer'::user_role_new
        END
      );
    `);

        // Step 5: Set new default
        console.log('📌 Setting new default...');
        await client.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer'::user_role_new;`);

        // Step 6: Drop old enum and rename new
        console.log('📌 Finalizing enum types...');
        await client.query('DROP TYPE IF EXISTS user_role;');
        await client.query('ALTER TYPE user_role_new RENAME TO user_role;');

        await client.query('COMMIT');

        // Verify
        const result = await client.query('SELECT DISTINCT role FROM users;');
        console.log('✅ Migration complete! Current roles in database:', result.rows.map(r => r.role));

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

// Run migration
runMigration()
    .then(() => {
        console.log('🎉 Migration finished successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration error:', error);
        process.exit(1);
    });
