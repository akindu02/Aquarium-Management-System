const { pool } = require('../config/db');

/**
 * Get unified dashboard stats for staff
 */
const getStaffDashboardStats = async () => {
    try {
        // Today's POS/Staff Revenue & Transaction Count
        const dailySalesQuery = `
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COUNT(order_id) as transactions_count
            FROM orders
            WHERE staff_id IS NOT NULL 
            AND DATE(order_date) = CURRENT_DATE
        `;

        // Action Required: Pending/Processing Orders
        const pendingOrdersQuery = `
            SELECT COUNT(order_id) as pending_count
            FROM orders
            WHERE status IN ('Pending', 'Processing')
        `;

        // Service Bookings Today
        const todayBookingsQuery = `
            SELECT COUNT(booking_id) as bookings_count
            FROM service_bookings
            WHERE DATE(booking_date) = CURRENT_DATE
            AND status != 'Cancelled'
        `;

        // Low Stock Count (threshold 10)
        const lowStockQuery = `
            SELECT COUNT(product_id) as low_stock_count
            FROM products
            WHERE stock_quantity < 10
        `;

        // Online Sales Revenue (Total lifetime revenue from customer orders)
        const onlineSalesQuery = `
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COUNT(order_id) as orders_count
            FROM orders
            WHERE staff_id IS NULL 
            AND status != 'Cancelled'
        `;

        // Pending Restock Requests
        const pendingRestocksQuery = `
            SELECT COUNT(request_id) as pending_restocks_count
            FROM restock_requests
            WHERE status = 'Pending'
        `;

        const [dailySales, pendingOrders, todayBookings, lowStock, onlineSales, pendingRestocks] = await Promise.all([
            pool.query(dailySalesQuery),
            pool.query(pendingOrdersQuery),
            pool.query(todayBookingsQuery),
            pool.query(lowStockQuery),
            pool.query(onlineSalesQuery),
            pool.query(pendingRestocksQuery)
        ]);

        return {
            totalDailySales: parseFloat(dailySales.rows[0].total_revenue),
            todayTransactionsCount: parseInt(dailySales.rows[0].transactions_count),
            pendingOrdersCount: parseInt(pendingOrders.rows[0].pending_count),
            todayBookingsCount: parseInt(todayBookings.rows[0].bookings_count),
            lowStockCount: parseInt(lowStock.rows[0].low_stock_count),
            onlineSalesRevenue: parseFloat(onlineSales.rows[0].total_revenue),
            onlineOrdersCount: parseInt(onlineSales.rows[0].orders_count),
            pendingRestocksCount: parseInt(pendingRestocks.rows[0].pending_restocks_count)
        };
    } catch (err) {
        console.error('Error in staffService.getStaffDashboardStats:', err);
        throw err;
    }
};

module.exports = {
    getStaffDashboardStats
};
