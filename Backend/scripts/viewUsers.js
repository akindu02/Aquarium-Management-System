/**
 * Script to view all users in the database
 * Usage: node scripts/viewUsers.js
 */

const { pool } = require('../config/db');

async function viewUsers() {
    try {
        const result = await pool.query(
            'SELECT id, first_name, last_name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
        );

        console.log(`\nFound ${result.rows.length} users:\n`);
        console.table(result.rows);

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await pool.end();
    }
}

viewUsers();
