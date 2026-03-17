const systemSettingsService = require('../services/systemSettingsService');

/**
 * GET /api/admin/settings
 * Returns all system settings (admin only)
 */
const getSettings = async (req, res) => {
    try {
        const settings = await systemSettingsService.getAllSettings();
        return res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error('getSettings error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
    }
};

/**
 * PUT /api/admin/settings
 * Update one or more system settings (admin only)
 * Body: { shipping_fee, online_discount_type, online_discount_value,
 *         contact_address, contact_phone, contact_email }
 */
const updateSettings = async (req, res) => {
    try {
        const {
            shipping_fee, online_discount_type, online_discount_value,
            contact_address, contact_phone, contact_email,
        } = req.body;

        const allowed = ['percentage', 'amount'];
        if (online_discount_type !== undefined && !allowed.includes(online_discount_type)) {
            return res.status(400).json({ success: false, message: 'online_discount_type must be "percentage" or "amount"' });
        }

        const updates = {};
        if (shipping_fee !== undefined)          updates.shipping_fee           = shipping_fee;
        if (online_discount_type !== undefined)  updates.online_discount_type   = online_discount_type;
        if (online_discount_value !== undefined) updates.online_discount_value  = online_discount_value;
        if (contact_address !== undefined)       updates.contact_address        = contact_address;
        if (contact_phone !== undefined)         updates.contact_phone          = contact_phone;
        if (contact_email !== undefined)         updates.contact_email          = contact_email;

        await systemSettingsService.updateSettings(updates);

        const settings = await systemSettingsService.getAllSettings();
        return res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (err) {
        console.error('updateSettings error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};

/**
 * GET /api/settings/online-sales
 * Returns online-sales settings (any authenticated user — needed by checkout)
 */
const getOnlineSalesSettings = async (req, res) => {
    try {
        const settings = await systemSettingsService.getOnlineSalesSettings();
        return res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error('getOnlineSalesSettings error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to retrieve online sales settings' });
    }
};

/**
 * GET /api/settings/contact
 * Returns contact info settings — public, no auth required (used by Footer)
 */
const getContactSettings = async (req, res) => {
    try {
        const { rows } = await require('../config/db').pool.query(
            `SELECT key, value FROM system_settings
             WHERE key IN ('contact_address', 'contact_phone', 'contact_email')`
        );
        const data = rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('getContactSettings error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to retrieve contact settings' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getOnlineSalesSettings,
    getContactSettings,
};
