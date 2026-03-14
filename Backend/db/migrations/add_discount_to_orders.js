const { getClient } = require('../../config/db');

async function up() {
    const client = await getClient();
    try {
        console.log('Adding discount column to orders table...');
        await client.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        `);
        console.log('Successfully added discount column.');
    } catch (err) {
        console.error('Error adding discount column:', err);
    } finally {
        client.release();
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up };