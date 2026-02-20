const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

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

const adminCreateUserValidation = [
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
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['customer', 'staff', 'supplier', 'admin'])
        .withMessage('Invalid role. Must be customer, staff, supplier, or admin'),
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

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
];

const verifyResetTokenValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('token')
        .isLength({ min: 6, max: 6 })
        .withMessage('Reset code must be 6 digits')
        .isNumeric()
        .withMessage('Reset code must be numeric'),
];

const resetPasswordValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('token')
        .isLength({ min: 6, max: 6 })
        .withMessage('Reset code must be 6 digits')
        .isNumeric()
        .withMessage('Reset code must be numeric'),
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

// POST /api/auth/admin/login - Admin Login (Strict)
router.post('/admin/login', loginValidation, authController.adminLogin);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', authController.refreshToken);

// POST /api/auth/forgot-password - Request password reset (Send OTP)
router.post('/forgot-password', forgotPasswordValidation, authController.requestPasswordReset);

// POST /api/auth/verify-reset-token - Verify password reset OTP
router.post('/verify-reset-token', verifyResetTokenValidation, authController.verifyResetToken);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

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

/**
 * Admin User Management Routes (admin only)
 */

// POST /api/auth/admin/create-user - Admin creates a new user (any role)
router.post('/admin/create-user', authenticate, adminOnly, adminCreateUserValidation, authController.createUser);

// GET /api/auth/admin/users - Get all users
router.get('/admin/users', authenticate, adminOnly, authController.getAllUsers);

// DELETE /api/auth/admin/users/:id - Delete a user
router.delete('/admin/users/:id', authenticate, adminOnly, authController.deleteUser);

module.exports = router;
