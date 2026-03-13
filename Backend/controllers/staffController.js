const staffService = require('../services/staffService');

/**
 * GET /api/staff/dashboard-stats
 * Returns summary of key metrics for the staff dashboard.
 */
const getStats = async (req, res) => {
    try {
        const stats = await staffService.getStaffDashboardStats();
        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('getStats controller error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard stats'
        });
    }
};

module.exports = {
    getStats
};
