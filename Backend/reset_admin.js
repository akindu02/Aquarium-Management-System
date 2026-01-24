const { pool } = require('./config/db');
const { hashPassword } = require('./utils/passwordUtils');

async function resetAdminPassword() {
    try {
        console.log('🔄 Resetting Admin Password...');

        // 1. Hash the new password
        const newPassword = 'Admin123!';
        const hashedPassword = await hashPassword(newPassword);

        // 2. Update the password for the admin user
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE email = 'admin@aquarium.com' RETURNING email",
            [hashedPassword]
        );

        if (result.rowCount > 0) {
            console.log('✅ Success! Password for admin@aquarium.com has been reset.');
            console.log('📧 Email:', result.rows[0].email);
            console.log('🔑 New Password:', newPassword);
        } else {
            console.log('❌ Error: Admin user "admin@aquarium.com" not found in database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetAdminPassword();
