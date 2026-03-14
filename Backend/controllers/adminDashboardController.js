const adminDashboardService = require('../services/adminDashboardService');

/**
 * GET /api/admin/dashboard-stats
 * Returns comprehensive admin dashboard statistics
 */
const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminDashboardService.getAdminDashboardStats();
        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (err) {
        console.error('Admin getDashboardStats error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin dashboard stats',
        });
    }
};

module.exports = {
    getDashboardStats,
};
