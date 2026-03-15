const pool = require('../config/db');

const getInventoryReport = async () => {
    // Summary KPIs
    const summaryQuery = `
        SELECT
            COUNT(*)                                                                              AS total_products,
            COUNT(DISTINCT category)                                                              AS total_categories,
            COALESCE(SUM(stock_quantity), 0)                                                      AS total_stock_units,
            COALESCE(SUM(stock_quantity * price), 0)                                              AS total_stock_value,
            COUNT(CASE WHEN stock_quantity = 0 THEN 1 END)                                        AS out_of_stock,
            COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END)               AS low_stock,
            COUNT(CASE WHEN stock_quantity > 10 THEN 1 END)                                       AS in_stock,
            COUNT(CASE WHEN expiry_date IS NOT NULL
                        AND expiry_date >= CURRENT_DATE
                        AND expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END)          AS expiring_soon
        FROM products
    `;

    // Stock breakdown by category
    const categoryStockQuery = `
        SELECT
            category,
            COUNT(*)                                                         AS product_count,
            COALESCE(SUM(stock_quantity), 0)                                 AS total_units,
            COALESCE(SUM(stock_quantity * price), 0)                         AS total_value,
            COUNT(CASE WHEN stock_quantity = 0 THEN 1 END)                   AS out_of_stock_count,
            COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END) AS low_stock_count
        FROM products
        GROUP BY category
        ORDER BY total_value DESC
    `;

    // Products with zero stock
    const outOfStockQuery = `
        SELECT name, category, price, discount_percent
        FROM products
        WHERE stock_quantity = 0
        ORDER BY category, name
    `;

    // Products with 1–10 units (low stock)
    const lowStockQuery = `
        SELECT name, category, price, stock_quantity
        FROM products
        WHERE stock_quantity > 0 AND stock_quantity <= 10
        ORDER BY stock_quantity ASC, category, name
    `;

    // Products expiring within the next 30 days
    const expiringSoonQuery = `
        SELECT name, category, stock_quantity, expiry_date
        FROM products
        WHERE expiry_date IS NOT NULL
          AND expiry_date >= CURRENT_DATE
          AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY expiry_date ASC
    `;

    const [summary, categoryStock, outOfStock, lowStock, expiringSoon] = await Promise.all([
        pool.query(summaryQuery),
        pool.query(categoryStockQuery),
        pool.query(outOfStockQuery),
        pool.query(lowStockQuery),
        pool.query(expiringSoonQuery),
    ]);

    return {
        summary:       summary.rows[0],
        categoryStock: categoryStock.rows,
        outOfStock:    outOfStock.rows,
        lowStock:      lowStock.rows,
        expiringSoon:  expiringSoon.rows,
    };
};

module.exports = { getInventoryReport };
