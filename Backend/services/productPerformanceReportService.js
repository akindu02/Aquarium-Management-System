const pool = require('../config/db');

const getProductPerformanceReport = async (startDate, endDate) => {
    // Summary KPIs
    const summaryQuery = `
        SELECT
            COUNT(DISTINCT oi.product_id)                                       AS products_sold,
            COALESCE(SUM(oi.quantity), 0)                                       AS total_units_sold,
            (SELECT COALESCE(SUM(o2.total_amount), 0) FROM orders o2
             WHERE o2.order_date >= $1 AND o2.order_date <= $2
               AND o2.status NOT IN ('Cancelled', 'Returned'))               AS total_revenue,
            COALESCE(AVG(oi.subtotal / NULLIF(oi.quantity, 0)), 0)              AS avg_unit_price,
            COUNT(DISTINCT o.order_id)                                          AS total_orders
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
    `;

    // Returns summary in the same period
    const returnsSummaryQuery = `
        SELECT
            COUNT(*)                            AS total_returns,
            COALESCE(SUM(orr.refund_amount), 0) AS total_refund_amount
        FROM order_returns orr
        JOIN orders o ON o.order_id = orr.order_id
        WHERE orr.created_at >= $1
          AND orr.created_at <= $2
          AND orr.status IN ('Approved', 'Refunded')
    `;

    // Top 15 products by revenue
    const topProductsQuery = `
        SELECT
            p.name          AS product_name,
            p.category,
            p.price         AS current_price,
            SUM(oi.quantity) AS units_sold,
            COALESCE(SUM(oi.subtotal), 0) AS revenue
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders o   ON o.order_id   = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.product_id, p.name, p.category, p.price
        ORDER BY revenue DESC
        LIMIT 15
    `;

    // Category performance
    const categoryPerformanceQuery = `
        SELECT
            p.category,
            COUNT(DISTINCT p.product_id)          AS products_count,
            SUM(oi.quantity)                       AS units_sold,
            COALESCE(SUM(oi.subtotal), 0)          AS revenue
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders o   ON o.order_id   = oi.order_id
        WHERE o.order_date >= $1
          AND o.order_date <= $2
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY p.category
        ORDER BY revenue DESC
    `;

    // Returns breakdown by reason
    const returnsByReasonQuery = `
        SELECT
            orr.reason,
            COUNT(*)                            AS return_count,
            COALESCE(SUM(orr.refund_amount), 0) AS total_refund
        FROM order_returns orr
        JOIN orders o ON o.order_id = orr.order_id
        WHERE orr.created_at >= $1
          AND orr.created_at <= $2
        GROUP BY orr.reason
        ORDER BY return_count DESC
    `;

    // Recent returns with order info
    const recentReturnsQuery = `
        SELECT
            orr.return_id,
            o.order_id,
            orr.reason,
            orr.status,
            orr.refund_amount,
            orr.created_at
        FROM order_returns orr
        JOIN orders o ON o.order_id = orr.order_id
        WHERE orr.created_at >= $1
          AND orr.created_at <= $2
        ORDER BY orr.created_at DESC
        LIMIT 10
    `;

    // Slow movers: products in catalogue but with 0 sales in the period
    const slowMoversQuery = `
        SELECT
            p.name,
            p.category,
            p.price,
            p.stock_quantity,
            COALESCE(sold.units_sold, 0) AS units_sold
        FROM products p
        LEFT JOIN (
            SELECT oi.product_id, SUM(oi.quantity) AS units_sold
            FROM order_items oi
            JOIN orders o ON o.order_id = oi.order_id
            WHERE o.order_date >= $1
              AND o.order_date <= $2
              AND o.status NOT IN ('Cancelled', 'Returned')
            GROUP BY oi.product_id
        ) sold ON sold.product_id = p.product_id
        WHERE COALESCE(sold.units_sold, 0) = 0
          AND p.stock_quantity > 0
        ORDER BY p.category, p.name
        LIMIT 20
    `;

    const [summary, returnsSummary, topProducts, categoryPerformance, returnsByReason, recentReturns, slowMovers] =
        await Promise.all([
            pool.query(summaryQuery,           [startDate, endDate]),
            pool.query(returnsSummaryQuery,    [startDate, endDate]),
            pool.query(topProductsQuery,       [startDate, endDate]),
            pool.query(categoryPerformanceQuery,[startDate, endDate]),
            pool.query(returnsByReasonQuery,   [startDate, endDate]),
            pool.query(recentReturnsQuery,     [startDate, endDate]),
            pool.query(slowMoversQuery,        [startDate, endDate]),
        ]);

    return {
        summary:             summary.rows[0],
        returnsSummary:      returnsSummary.rows[0],
        topProducts:         topProducts.rows,
        categoryPerformance: categoryPerformance.rows,
        returnsByReason:     returnsByReason.rows,
        recentReturns:       recentReturns.rows,
        slowMovers:          slowMovers.rows,
    };
};

module.exports = { getProductPerformanceReport };
