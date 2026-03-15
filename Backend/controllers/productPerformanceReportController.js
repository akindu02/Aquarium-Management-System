const productPerformanceReportService = require('../services/productPerformanceReportService');

const getProductPerformanceReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        const endDateTime = new Date(end_date);
        endDateTime.setHours(23, 59, 59, 999);

        const data = await productPerformanceReportService.getProductPerformanceReport(
            start_date,
            endDateTime.toISOString()
        );
        res.json({ success: true, data });
    } catch (err) {
        console.error('Product performance report error:', err);
        res.status(500).json({ error: 'Failed to generate product performance report' });
    }
};

module.exports = { getProductPerformanceReport };
