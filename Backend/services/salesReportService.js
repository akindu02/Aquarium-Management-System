const pool = require('../config/db');

const getSalesReport = async (startDate, endDate) => {
    // Summary: total revenue, orders, avg order value, online vs POS split
    const summaryQuery = `
        SELECT
            COUNT(DISTINCT o.order_id)                                                                  AS total_orders,
            COALESCE(SUM(o.total_amount), 0)                                                            AS total_revenue,
            COALESCE(AVG(o.total_amount), 0)                                                            AS avg_order_value,
            COUNT(CASE WHEN o.customer_id IS NOT NULL THEN 1 END)                                       AS online_orders,
            COUNT(CASE WHEN o.pos_customer_id IS NOT NULL THEN 1 END)                                   AS pos_orders,
            COUNT(DISTINCT CASE WHEN o.customer_id IS NOT NULL THEN o.customer_id END)                  AS online_customers,
            COUNT(DISTINCT CASE WHEN o.pos_customer_id IS NOT NULL THEN o.pos_customer_id END)          AS pos_customers,
            COALESCE(SUM(CASE WHEN o.customer_id IS NOT NULL THEN o.total_amount ELSE 0 END), 0)        AS online_revenue,
            COALESCE(SUM(CASE WHEN o.pos_customer_id IS NOT NULL THEN o.total_amount ELSE 0 END), 0)    AS pos_revenue
        FROM orders o
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
    `;

    // Daily revenue breakdown for the line chart
    const dailyRevenueQuery = `
        SELECT
            DATE(order_date AT TIME ZONE 'UTC')  AS date,
            COUNT(*)                              AS orders,
            COALESCE(SUM(total_amount), 0)        AS revenue
        FROM orders
        WHERE order_date >= $1
          AND order_date <= $2
          AND status NOT IN ('Cancelled', 'Returned')
        GROUP BY DATE(order_date AT TIME ZONE 'UTC')
        ORDER BY DATE(order_date AT TIME ZONE 'UTC')
    `;

    // Top 10 products by revenue
    const topProductsQuery = `
        SELECT
            p.name                          AS product_name,
            p.category,
            SUM(oi.quantity)                AS total_quantity,
            COALESCE(SUM(oi.subtotal), 0)   AS total_revenue
        FROM order_items oi
        JOIN products p  ON p.product_id  = oi.product_id
        JOIN orders  o   ON o.order_id    = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.product_id, p.name, p.category
        ORDER BY total_revenue DESC
        LIMIT 10
    `;

    // Revenue by product category
    const categoryRevenueQuery = `
        SELECT
            p.category,
            COALESCE(SUM(oi.subtotal), 0)   AS revenue,
            SUM(oi.quantity)                AS units_sold
        FROM order_items oi
        JOIN products p  ON p.product_id  = oi.product_id
        JOIN orders  o   ON o.order_id    = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.category
        ORDER BY revenue DESC
    `;

    // Order status distribution (all statuses including cancelled)
    const orderStatusQuery = `
        SELECT
            status,
            COUNT(*) AS count
        FROM orders
        WHERE order_date >= $1
          AND order_date <= $2
        GROUP BY status
        ORDER BY count DESC
    `;

    // Daily online vs POS revenue breakdown for comparison chart
    const dailyChannelRevenueQuery = `
        SELECT
            DATE(order_date AT TIME ZONE 'UTC')                                                                 AS date,
            COALESCE(SUM(CASE WHEN customer_id IS NOT NULL THEN total_amount ELSE 0 END), 0)                    AS online_revenue,
            COALESCE(SUM(CASE WHEN pos_customer_id IS NOT NULL THEN total_amount ELSE 0 END), 0)                AS pos_revenue
        FROM orders
        WHERE order_date >= $1
          AND order_date <= $2
          AND status NOT IN ('Cancelled', 'Returned')
        GROUP BY DATE(order_date AT TIME ZONE 'UTC')
        ORDER BY DATE(order_date AT TIME ZONE 'UTC')
    `;

    // Completed payment methods
    const paymentMethodQuery = `
        SELECT
            p.method,
            COUNT(*)            AS count,
            COALESCE(SUM(p.amount), 0) AS total_amount
        FROM payments p
        JOIN orders o ON o.order_id = p.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND p.status = 'Completed'
        GROUP BY p.method
        ORDER BY total_amount DESC
    `;

    const [summary, dailyRevenue, topProducts, categoryRevenue, orderStatus, paymentMethods, dailyChannelRevenue] =
        await Promise.all([
            pool.query(summaryQuery,             [startDate, endDate]),
            pool.query(dailyRevenueQuery,        [startDate, endDate]),
            pool.query(topProductsQuery,         [startDate, endDate]),
            pool.query(categoryRevenueQuery,     [startDate, endDate]),
            pool.query(orderStatusQuery,         [startDate, endDate]),
            pool.query(paymentMethodQuery,       [startDate, endDate]),
            pool.query(dailyChannelRevenueQuery, [startDate, endDate]),
        ]);

    return {
        summary:              summary.rows[0],
        dailyRevenue:         dailyRevenue.rows,
        topProducts:          topProducts.rows,
        categoryRevenue:      categoryRevenue.rows,
        orderStatus:          orderStatus.rows,
        paymentMethods:       paymentMethods.rows,
        dailyChannelRevenue:  dailyChannelRevenue.rows,
    };
};

module.exports = { getSalesReport };
