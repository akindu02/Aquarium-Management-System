const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Validation rules
 */
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 200 })
        .withMessage('Name cannot exceed 200 characters'),
    body('role')
        .optional()
        .isIn(['customer', 'staff', 'supplier'])
        .withMessage('Invalid role. Must be customer, staff, or supplier'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Name must be between 1 and 200 characters'),
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long'),
];

/**
 * Public Routes (no authentication required)
 */

// POST /api/auth/register - Register a new user
router.post('/register', registerValidation, authController.register);

// POST /api/auth/login - Login user
router.post('/login', loginValidation, authController.login);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', authController.refreshToken);

/**
 * Protected Routes (authentication required)
 */

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, authController.getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);

// PUT /api/auth/change-password - Change password
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, authController.logout);

// POST /api/auth/logout-all - Logout from all devices
router.post('/logout-all', authenticate, authController.logoutAll);

module.exports = router;
