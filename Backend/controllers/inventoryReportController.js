const inventoryReportService = require('../services/inventoryReportService');

const getInventoryReport = async (req, res) => {
    try {
        const data = await inventoryReportService.getInventoryReport();
        res.json({ success: true, data });
    } catch (err) {
        console.error('Inventory report error:', err);
        res.status(500).json({ error: 'Failed to generate inventory report' });
    }
};

module.exports = { getInventoryReport };
