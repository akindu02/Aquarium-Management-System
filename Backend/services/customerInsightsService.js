const pool = require('../config/db');

const getCustomerInsightsReport = async (startDate, endDate) => {
    // Summary: online customers, walk-in customers, orders, service bookings
    const summaryQuery = `
        SELECT
            COUNT(DISTINCT CASE WHEN o.customer_id     IS NOT NULL THEN o.customer_id     END) AS total_online_customers,
            COUNT(DISTINCT CASE WHEN o.pos_customer_id IS NOT NULL THEN o.pos_customer_id END) AS total_walkin_customers,
            COUNT(CASE WHEN o.customer_id     IS NOT NULL THEN 1 END)                          AS total_online_orders,
            COUNT(CASE WHEN o.pos_customer_id IS NOT NULL THEN 1 END)                          AS total_walkin_orders,
            (
                SELECT COUNT(*)
                FROM service_bookings
                WHERE booking_date::date BETWEEN $1::date AND $2::date
            )                                                                                  AS total_service_bookings
        FROM orders o
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
    `;

    // Top 5 products by units sold (online + POS combined)
    const topProductsQuery = `
        SELECT
            p.name           AS product_name,
            p.category,
            SUM(oi.quantity) AS total_quantity
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders   o ON o.order_id   = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.product_id, p.name, p.category
        ORDER BY total_quantity DESC
        LIMIT 5
    `;

    // Category distribution — all channels combined
    const categoryDistributionQuery = `
        SELECT
            p.category,
            SUM(oi.quantity)            AS total_quantity,
            COUNT(DISTINCT o.order_id)  AS total_orders
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders   o ON o.order_id   = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.category
        ORDER BY total_quantity DESC
    `;

    // Online vs Walk-in units per category
    const channelCategoryQuery = `
        SELECT
            p.category,
            SUM(CASE WHEN o.customer_id     IS NOT NULL THEN oi.quantity ELSE 0 END) AS online_quantity,
            SUM(CASE WHEN o.pos_customer_id IS NOT NULL THEN oi.quantity ELSE 0 END) AS walkin_quantity
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders   o ON o.order_id   = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.category
        ORDER BY SUM(oi.quantity) DESC
    `;

    // Service type popularity with online vs walk-in channel breakdown
    const serviceTypeQuery = `
        SELECT
            s.service_type,
            COUNT(sb.booking_id)                                              AS total_bookings,
            COUNT(*) FILTER (WHERE sb.status = 'Completed')                  AS completed_bookings,
            COUNT(*) FILTER (WHERE sb.customer_id IS NOT NULL)               AS online_bookings,
            COUNT(*) FILTER (WHERE sb.pos_customer_id IS NOT NULL)           AS walkin_bookings
        FROM service_bookings sb
        JOIN service_time_slots sts ON sb.slot_id     = sts.slot_id
        JOIN services           s   ON sts.service_id = s.service_id
        WHERE sb.booking_date::date BETWEEN $1::date AND $2::date
        GROUP BY s.service_type
        ORDER BY total_bookings DESC
    `;

    // Top 10 registered customers by total purchase amount
    const topCustomersByPurchaseQuery = `
        SELECT
            u.name                     AS customer_name,
            u.email,
            COUNT(DISTINCT o.order_id) AS total_orders,
            SUM(oi.quantity)           AS total_units,
            SUM(o.total_amount)        AS total_spent
        FROM orders o
        JOIN users u        ON u.id          = o.customer_id
        JOIN order_items oi ON oi.order_id   = o.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.customer_id IS NOT NULL
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY u.id, u.name, u.email
        ORDER BY total_spent DESC
        LIMIT 10
    `;

    // Top 10 registered customers by number of service bookings
    const topCustomersByBookingsQuery = `
        SELECT
            u.name                                                  AS customer_name,
            u.email,
            COUNT(sb.booking_id)                                    AS total_bookings,
            COUNT(*) FILTER (WHERE sb.status = 'Completed')        AS completed_bookings
        FROM service_bookings sb
        JOIN users u ON u.id = sb.customer_id
        WHERE sb.booking_date::date BETWEEN $1::date AND $2::date
          AND sb.customer_id IS NOT NULL
        GROUP BY u.id, u.name, u.email
        ORDER BY total_bookings DESC
        LIMIT 10
    `;

    const [summary, topProducts, categoryDistribution, channelCategory, serviceTypeBreakdown,
           topCustomersByPurchase, topCustomersByBookings] =
        await Promise.all([
            pool.query(summaryQuery,                [startDate, endDate]),
            pool.query(topProductsQuery,            [startDate, endDate]),
            pool.query(categoryDistributionQuery,   [startDate, endDate]),
            pool.query(channelCategoryQuery,        [startDate, endDate]),
            pool.query(serviceTypeQuery,            [startDate, endDate]),
            pool.query(topCustomersByPurchaseQuery, [startDate, endDate]),
            pool.query(topCustomersByBookingsQuery, [startDate, endDate]),
        ]);

    return {
        summary:                   summary.rows[0],
        topProducts:               topProducts.rows,
        categoryDistribution:      categoryDistribution.rows,
        channelCategoryPreference: channelCategory.rows,
        serviceTypeBreakdown:      serviceTypeBreakdown.rows,
        topCustomersByPurchase:    topCustomersByPurchase.rows,
        topCustomersByBookings:    topCustomersByBookings.rows,
    };
};

module.exports = { getCustomerInsightsReport };
