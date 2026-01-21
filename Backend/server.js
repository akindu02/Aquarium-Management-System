require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
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

// Auth routes
app.use('/api/auth', authRoutes);

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
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🐠 Aquarium Management System Backend                    ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(10)}                            ║
║                                                            ║
║   API Endpoints:                                           ║
║   • Health Check:    GET  /api/health                      ║
║   • DB Health:       GET  /api/health/db                   ║
║   • Register:        POST /api/auth/register               ║
║   • Login:           POST /api/auth/login                  ║
║   • Refresh Token:   POST /api/auth/refresh-token          ║
║   • Get Profile:     GET  /api/auth/me                     ║
║   • Update Profile:  PUT  /api/auth/profile                ║
║   • Change Password: PUT  /api/auth/change-password        ║
║   • Logout:          POST /api/auth/logout                 ║
║   • Logout All:      POST /api/auth/logout-all             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
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
