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

    // Service type popularity
    const serviceTypeQuery = `
        SELECT
            s.service_type,
            COUNT(sb.booking_id)                                    AS total_bookings,
            COUNT(*) FILTER (WHERE sb.status = 'Completed')        AS completed_bookings
        FROM service_bookings sb
        JOIN service_time_slots sts ON sb.slot_id     = sts.slot_id
        JOIN services           s   ON sts.service_id = s.service_id
        WHERE sb.booking_date::date BETWEEN $1::date AND $2::date
        GROUP BY s.service_type
        ORDER BY total_bookings DESC
    `;

    const [summary, topProducts, categoryDistribution, channelCategory, serviceTypeBreakdown] =
        await Promise.all([
            pool.query(summaryQuery,              [startDate, endDate]),
            pool.query(topProductsQuery,          [startDate, endDate]),
            pool.query(categoryDistributionQuery, [startDate, endDate]),
            pool.query(channelCategoryQuery,      [startDate, endDate]),
            pool.query(serviceTypeQuery,          [startDate, endDate]),
        ]);

    return {
        summary:                  summary.rows[0],
        topProducts:              topProducts.rows,
        categoryDistribution:     categoryDistribution.rows,
        channelCategoryPreference: channelCategory.rows,
        serviceTypeBreakdown:     serviceTypeBreakdown.rows,
    };
};

module.exports = { getCustomerInsightsReport };
