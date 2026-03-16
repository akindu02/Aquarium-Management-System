const customerInsightsService = require('../services/customerInsightsService');

const getCustomerInsightsReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        // Include the full end day by setting time to 23:59:59
        const endDateTime = new Date(end_date);
        endDateTime.setHours(23, 59, 59, 999);

        const data = await customerInsightsService.getCustomerInsightsReport(start_date, endDateTime.toISOString());
        res.json({ success: true, data });
    } catch (err) {
        console.error('Customer insights report error:', err);
        res.status(500).json({ error: 'Failed to generate customer insights report' });
    }
};

module.exports = { getCustomerInsightsReport };
