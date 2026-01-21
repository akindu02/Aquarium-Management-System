/**
 * Create Test Users Script
 * Run this to create test users for each role
 * Usage: node scripts/createTestUsers.js
 */

const { query } = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');

const testUsers = [
    {
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '1234567890',
    },
    {
        email: 'staff@test.com',
        password: 'password123',
        firstName: 'Staff',
        lastName: 'Member',
        role: 'staff',
        phone: '1234567891',
    },
    {
        email: 'supplier@test.com',
        password: 'password123',
        firstName: 'Supplier',
        lastName: 'Company',
        role: 'supplier',
        phone: '1234567892',
    },
    {
        email: 'customer@test.com',
        password: 'password123',
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        phone: '1234567893',
    },
];

async function createTestUsers() {
    console.log('🚀 Creating test users...\n');

    for (const user of testUsers) {
        try {
            // Check if user already exists
            const existingUser = await query(
                'SELECT id FROM users WHERE email = $1',
                [user.email.toLowerCase()]
            );

            if (existingUser.rows.length > 0) {
                console.log(`⚠️  User ${user.email} already exists. Skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await hashPassword(user.password);

            // Insert user
            await query(
                `INSERT INTO users (email, password, first_name, last_name, role, phone, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
                [
                    user.email.toLowerCase(),
                    hashedPassword,
                    user.firstName,
                    user.lastName,
                    user.role,
                    user.phone,
                ]
            );

            console.log(`✅ Created ${user.role} user: ${user.email}`);
        } catch (error) {
            console.error(`❌ Error creating ${user.email}:`, error.message);
        }
    }

    console.log('\n✨ Test users creation complete!');
    console.log('\nYou can now login with:');
    console.log('- admin@test.com / password123 (Admin)');
    console.log('- staff@test.com / password123 (Staff)');
    console.log('- supplier@test.com / password123 (Supplier)');
    console.log('- customer@test.com / password123 (Customer)');

    process.exit(0);
}

// Run the script
createTestUsers().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
