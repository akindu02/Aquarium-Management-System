/**
 * Reseed Script: Add sample users with new roles
 * Clears existing sample users and adds new ones with customer/supplier/staff/admin roles
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');

const reseedUsers = async () => {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting user reseed...');

        await client.query('BEGIN');

        // Hash the sample password
        const password = await hashPassword('Password123!');
        console.log('📌 Password hash generated');

        // Delete existing sample users (be careful!)
        console.log('📌 Removing old sample users...');
        await client.query(`
      DELETE FROM users 
      WHERE email IN (
        'admin@aquarium.com', 
        'manager@aquarium.com', 
        'user@aquarium.com',
        'staff@aquarium.com',
        'supplier@aquarium.com',
        'customer@aquarium.com'
      )
    `);

        // Insert new sample users with new roles
        console.log('📌 Inserting new sample users...');
        await client.query(`
      INSERT INTO users (email, password, first_name, last_name, role, phone, is_active, email_verified)
      VALUES 
        ('admin@aquarium.com', $1, 'Admin', 'User', 'admin', '+1234567890', true, true),
        ('staff@aquarium.com', $1, 'John', 'Staff', 'staff', '+1234567891', true, true),
        ('supplier@aquarium.com', $1, 'Fish', 'Supplier', 'supplier', '+1234567892', true, true),
        ('customer@aquarium.com', $1, 'Jane', 'Customer', 'customer', '+1234567893', true, false)
    `, [password]);

        await client.query('COMMIT');

        // Verify
        const result = await client.query('SELECT email, role FROM users ORDER BY role;');
        console.log('✅ Sample users created:');
        result.rows.forEach(row => {
            console.log(`   - ${row.email} (${row.role})`);
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Reseed failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

// Run reseed
reseedUsers()
    .then(() => {
        console.log('🎉 Reseed finished successfully!');
        console.log('');
        console.log('📋 Sample login credentials (password: Password123!):');
        console.log('   - admin@aquarium.com (admin)');
        console.log('   - staff@aquarium.com (staff)');
        console.log('   - supplier@aquarium.com (supplier)');
        console.log('   - customer@aquarium.com (customer)');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Reseed error:', error);
        process.exit(1);
    });
