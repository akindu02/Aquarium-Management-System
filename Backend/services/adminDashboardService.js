const { pool } = require('../config/db');

/**
 * Admin Dashboard Service
 * Aggregates all key metrics for the admin overview dashboard
 */

const getAdminDashboardStats = async () => {
    try {
        // 1. Total Revenue (all completed/delivered orders)
        const totalRevenueQuery = `
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue
            FROM orders
            WHERE status NOT IN ('Cancelled', 'Returned')
        `;

        // 2. Today's Revenue
        const todayRevenueQuery = `
            SELECT COALESCE(SUM(total_amount), 0) as today_revenue
            FROM orders
            WHERE DATE(order_date) = CURRENT_DATE
            AND status NOT IN ('Cancelled', 'Returned')
        `;

        // 3. This Month's Revenue
        const monthRevenueQuery = `
            SELECT COALESCE(SUM(total_amount), 0) as month_revenue
            FROM orders
            WHERE DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND status NOT IN ('Cancelled', 'Returned')
        `;

        // 4. Total Users by Role
        const usersQuery = `
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
                SUM(CASE WHEN role = 'supplier' THEN 1 ELSE 0 END) as suppliers,
                SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_users
            FROM users
        `;

        // 5. New Users This Month
        const newUsersQuery = `
            SELECT COUNT(*) as new_users
            FROM users
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `;

        // 6. Pending Bookings (requires attention)
        const pendingBookingsQuery = `
            SELECT COUNT(booking_id) as pending_bookings
            FROM service_bookings
            WHERE status = 'Pending'
        `;

        // 7. Today's Bookings
        const todayBookingsQuery = `
            SELECT COUNT(booking_id) as today_bookings
            FROM service_bookings
            WHERE DATE(booking_date) = CURRENT_DATE
            AND status != 'Cancelled'
        `;

        // 8. Active Orders (Pending + Processing + Shipped)
        const activeOrdersQuery = `
            SELECT 
                COUNT(*) as active_orders,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) as shipped_orders
            FROM orders
            WHERE status IN ('Pending', 'Processing', 'Shipped')
        `;

        // 9. Total Orders Count
        const totalOrdersQuery = `
            SELECT COUNT(*) as total_orders
            FROM orders
        `;

        // 10. Low Stock Items (stock < 10)
        const lowStockQuery = `
            SELECT 
                product_id, name, category, stock_quantity, price, image_url
            FROM products
            WHERE stock_quantity < 10
            ORDER BY stock_quantity ASC
            LIMIT 10
        `;

        // 11. Low Stock Count
        const lowStockCountQuery = `
            SELECT COUNT(*) as low_stock_count
            FROM products
            WHERE stock_quantity < 10
        `;

        // 12. Out of Stock Count
        const outOfStockCountQuery = `
            SELECT COUNT(*) as out_of_stock_count
            FROM products
            WHERE stock_quantity = 0
        `;

        // 13. Recent Activity (last 10 activities from orders, bookings, users)
        const recentActivityQuery = `
            (
                SELECT 
                    'order' as type,
                    'New order #ORD-' || LPAD(o.order_id::text, 4, '0') || ' placed' || 
                    COALESCE(' by ' || u.name, '') as text,
                    o.order_date as created_at,
                    o.total_amount as amount
                FROM orders o
                LEFT JOIN users u ON o.customer_id = u.id
                ORDER BY o.order_date DESC
                LIMIT 5
            )
            UNION ALL
            (
                SELECT 
                    'booking' as type,
                    'Booking #BK-' || LPAD(sb.booking_id::text, 3, '0') || 
                    CASE sb.status 
                        WHEN 'Confirmed' THEN ' confirmed'
                        WHEN 'Pending' THEN ' created'
                        WHEN 'Completed' THEN ' completed'
                        WHEN 'Cancelled' THEN ' cancelled'
                        ELSE ' updated'
                    END ||
                    COALESCE(' for ' || u.name, '') as text,
                    sb.created_at as created_at,
                    NULL as amount
                FROM service_bookings sb
                LEFT JOIN users u ON sb.customer_id = u.id
                ORDER BY sb.created_at DESC
                LIMIT 5
            )
            UNION ALL
            (
                SELECT 
                    'user' as type,
                    'New user "' || u.name || '" registered as ' || u.role as text,
                    u.created_at as created_at,
                    NULL as amount
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT 3
            )
            ORDER BY created_at DESC
            LIMIT 10
        `;

        // 14. Pending Restock Requests
        const pendingRestocksQuery = `
            SELECT COUNT(*) as pending_restocks
            FROM restock_requests
            WHERE status = 'Pending'
        `;

        // 15. Pending Refunds
        const pendingRefundsQuery = `
            SELECT 
                COUNT(*) as pending_refunds,
                COALESCE(SUM(amount), 0) as pending_refund_amount
            FROM refund_requests
            WHERE status = 'Pending'
        `;

        // 16. Top Selling Products
        const topProductsQuery = `
            SELECT 
                p.product_id, p.name, p.category, p.price, p.image_url,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.subtotal), 0) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON oi.product_id = p.product_id
            LEFT JOIN orders o ON o.order_id = oi.order_id AND o.status NOT IN ('Cancelled', 'Returned')
            GROUP BY p.product_id, p.name, p.category, p.price, p.image_url
            ORDER BY total_sold DESC
            LIMIT 5
        `;

        // 17. Monthly Revenue for last 6 months (for chart)
        const monthlyRevenueQuery = `
            SELECT 
                TO_CHAR(DATE_TRUNC('month', order_date), 'Mon') as month,
                EXTRACT(MONTH FROM order_date) as month_num,
                COALESCE(SUM(total_amount), 0) as revenue,
                COUNT(*) as orders_count
            FROM orders
            WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
            AND status NOT IN ('Cancelled', 'Returned')
            GROUP BY DATE_TRUNC('month', order_date), TO_CHAR(DATE_TRUNC('month', order_date), 'Mon'), EXTRACT(MONTH FROM order_date)
            ORDER BY DATE_TRUNC('month', order_date) ASC
        `;

        // 18. Order Status Distribution
        const orderStatusQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM orders
            GROUP BY status
            ORDER BY count DESC
        `;

        // 19. Booking Status Distribution
        const bookingStatusQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM service_bookings
            GROUP BY status
            ORDER BY count DESC
        `;

        // Execute all queries in parallel
        const [
            totalRevenue, todayRevenue, monthRevenue,
            users, newUsers,
            pendingBookings, todayBookings,
            activeOrders, totalOrders,
            lowStockItems, lowStockCount, outOfStockCount,
            recentActivity,
            pendingRestocks, pendingRefunds,
            topProducts, monthlyRevenue,
            orderStatus, bookingStatus
        ] = await Promise.all([
            pool.query(totalRevenueQuery),
            pool.query(todayRevenueQuery),
            pool.query(monthRevenueQuery),
            pool.query(usersQuery),
            pool.query(newUsersQuery),
            pool.query(pendingBookingsQuery),
            pool.query(todayBookingsQuery),
            pool.query(activeOrdersQuery),
            pool.query(totalOrdersQuery),
            pool.query(lowStockQuery),
            pool.query(lowStockCountQuery),
            pool.query(outOfStockCountQuery),
            pool.query(recentActivityQuery),
            pool.query(pendingRestocksQuery),
            pool.query(pendingRefundsQuery),
            pool.query(topProductsQuery),
            pool.query(monthlyRevenueQuery),
            pool.query(orderStatusQuery),
            pool.query(bookingStatusQuery)
        ]);

        return {
            revenue: {
                total: parseFloat(totalRevenue.rows[0].total_revenue),
                today: parseFloat(todayRevenue.rows[0].today_revenue),
                thisMonth: parseFloat(monthRevenue.rows[0].month_revenue),
            },
            users: {
                total: parseInt(users.rows[0].total_users),
                customers: parseInt(users.rows[0].customers),
                suppliers: parseInt(users.rows[0].suppliers),
                staff: parseInt(users.rows[0].staff),
                admins: parseInt(users.rows[0].admins),
                active: parseInt(users.rows[0].active_users),
                inactive: parseInt(users.rows[0].inactive_users),
                newThisMonth: parseInt(newUsers.rows[0].new_users),
            },
            bookings: {
                pending: parseInt(pendingBookings.rows[0].pending_bookings),
                today: parseInt(todayBookings.rows[0].today_bookings),
            },
            orders: {
                active: parseInt(activeOrders.rows[0].active_orders),
                pending: parseInt(activeOrders.rows[0].pending_orders),
                processing: parseInt(activeOrders.rows[0].processing_orders),
                shipped: parseInt(activeOrders.rows[0].shipped_orders),
                total: parseInt(totalOrders.rows[0].total_orders),
                statusDistribution: orderStatus.rows.map(r => ({
                    status: r.status,
                    count: parseInt(r.count),
                })),
            },
            inventory: {
                lowStockCount: parseInt(lowStockCount.rows[0].low_stock_count),
                outOfStockCount: parseInt(outOfStockCount.rows[0].out_of_stock_count),
                lowStockItems: lowStockItems.rows.map(item => ({
                    id: item.product_id,
                    name: item.name,
                    category: item.category,
                    stock: item.stock_quantity,
                    price: parseFloat(item.price),
                    image: item.image_url,
                })),
            },
            recentActivity: recentActivity.rows.map(a => ({
                type: a.type,
                text: a.text,
                time: a.created_at,
                amount: a.amount ? parseFloat(a.amount) : null,
            })),
            pendingRestocks: parseInt(pendingRestocks.rows[0].pending_restocks),
            refunds: {
                pending: parseInt(pendingRefunds.rows[0].pending_refunds),
                pendingAmount: parseFloat(pendingRefunds.rows[0].pending_refund_amount),
            },
            topProducts: topProducts.rows.map(p => ({
                id: p.product_id,
                name: p.name,
                category: p.category,
                price: parseFloat(p.price),
                image: p.image_url,
                totalSold: parseInt(p.total_sold),
                totalRevenue: parseFloat(p.total_revenue),
            })),
            monthlyRevenue: monthlyRevenue.rows.map(m => ({
                month: m.month,
                revenue: parseFloat(m.revenue),
                orders: parseInt(m.orders_count),
            })),
            bookingStatusDistribution: bookingStatus.rows.map(r => ({
                status: r.status,
                count: parseInt(r.count),
            })),
        };
    } catch (err) {
        console.error('Error in adminDashboardService.getAdminDashboardStats:', err);
        throw err;
    }
};

module.exports = {
    getAdminDashboardStats,
};
