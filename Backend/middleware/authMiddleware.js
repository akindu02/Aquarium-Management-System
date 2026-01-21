const { verifyToken, extractTokenFromHeader } = require('../utils/jwtUtils');
const authService = require('../services/authService');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Get fresh user data from database
        const user = await authService.getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.',
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid token.',
        });
    }
};

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.',
            });
        }

        next();
    };
};

/**
 * Admin Only Middleware
 * Shorthand for authorize('admin')
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.',
        });
    }

    next();
};

/**
 * Manager or Admin Middleware
 * Allows managers and admins
 */
const managerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Manager or Admin access required.',
        });
    }

    next();
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (token) {
            const decoded = verifyToken(token);
            const user = await authService.getUserById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Token is invalid, but that's okay for optional auth
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    adminOnly,
    managerOrAdmin,
    optionalAuth,
};
