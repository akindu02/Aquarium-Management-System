const salesReportService = require('../services/salesReportService');

const getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        // Include the full end day by setting time to 23:59:59
        const endDateTime = new Date(end_date);
        endDateTime.setHours(23, 59, 59, 999);

        const data = await salesReportService.getSalesReport(start_date, endDateTime.toISOString());
        res.json({ success: true, data });
    } catch (err) {
        console.error('Sales report error:', err);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
};

module.exports = { getSalesReport };
