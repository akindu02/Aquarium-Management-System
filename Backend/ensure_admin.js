const { pool } = require('./config/db');
const { hashPassword } = require('./utils/passwordUtils');

async function ensureAdmin() {
    try {
        const res = await pool.query("SELECT * FROM users WHERE role = 'admin'");

        if (res.rows.length > 0) {
            console.log('✅ Super Admin already exists:', res.rows[0].email);
        } else {
            console.log('⚠️ No Admin found. Creating Super Admin...');
            const hash = await hashPassword('Admin123!');
            await pool.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                ['Super Admin', 'admin@aquarium.com', hash, 'admin']
            );
            console.log('✅ Super Admin created successfully');
            console.log('📧 Email: admin@aquarium.com');
            console.log('🔑 Password: Admin123!');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

ensureAdmin();
