const { pool } = require('../config/db');

/**
 * Fetch all system settings as a plain key→value object
 */
const getAllSettings = async () => {
    const { rows } = await pool.query('SELECT key, value FROM system_settings ORDER BY key');
    return rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
    }, {});
};

/**
 * Fetch only the online-sales settings (shipping_fee, discount type & value)
 */
const getOnlineSalesSettings = async () => {
    const { rows } = await pool.query(
        `SELECT key, value FROM system_settings
         WHERE key IN ('shipping_fee', 'online_discount_type', 'online_discount_value')`
    );
    return rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
    }, {});
};

/**
 * Update one or more settings.
 * @param {Record<string, string>} updates  e.g. { shipping_fee: '5.99', online_discount_type: 'percentage', online_discount_value: '10' }
 */
const updateSettings = async (updates) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const promises = keys.map((key) =>
        pool.query(
            `INSERT INTO system_settings (key, value, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            [key, String(updates[key])]
        )
    );
    await Promise.all(promises);
};

module.exports = {
    getAllSettings,
    getOnlineSalesSettings,
    updateSettings,
};
