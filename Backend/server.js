require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const returnRoutes = require('./routes/returnRoutes');
const posRoutes = require('./routes/posRoutes');
const restockRoutes = require('./routes/restockRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const staffRoutes = require('./routes/staffRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

/**
 * Middleware
 */

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Aquarium Management System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({
            success: true,
            message: 'Database connection is healthy',
            serverTime: result.rows[0].now,
        });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
        });
    }
});

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Return routes
app.use('/api/returns', returnRoutes);

// POS routes (cash-only)
app.use('/api/pos', posRoutes);

// Restock request routes
app.use('/api/restock', restockRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Staff routes
app.use('/api/staff', staffRoutes);

// Admin dashboard routes
app.use('/api/admin', adminDashboardRoutes);

// Booking/Time slot routes
app.use('/api/bookings', bookingRoutes);

// Suppliers list (for dropdowns)
app.get('/api/suppliers', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT s.user_id AS id, u.name, s.company_name
             FROM suppliers s
             JOIN users u ON u.id = s.user_id
             WHERE u.is_active = true
             ORDER BY s.company_name`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('GET /api/suppliers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch suppliers.' });
    }
});

/**
 * Error Handling
 */

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

/**
 * Server Startup
 */
const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        console.log('✅ Database connection verified');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

module.exports = app;
