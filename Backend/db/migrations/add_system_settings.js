const { getClient } = require('../../config/db');

async function up() {
    const client = await getClient();
    try {
        console.log('Creating system_settings table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Seeding default online sales settings...');
        await client.query(`
            INSERT INTO system_settings (key, value) VALUES
                ('shipping_fee', '0.00'),
                ('online_discount_type', 'percentage'),
                ('online_discount_value', '0.00')
            ON CONFLICT (key) DO NOTHING;
        `);

        console.log('Successfully created system_settings table and seeded defaults.');
    } catch (err) {
        console.error('Error creating system_settings table:', err);
    } finally {
        client.release();
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up };
