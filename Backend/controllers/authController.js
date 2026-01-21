const authService = require('../services/authService');
const { validationResult } = require('express-validator');

/**
 * Auth Controller - Handles HTTP requests and responses
 * Thin layer that delegates business logic to authService
 */
class AuthController {
    /**
     * Register a new user
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { email, password, firstName, lastName, phone } = req.body;

            const result = await authService.register({
                email,
                password,
                firstName,
                lastName,
                phone,
            });

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during registration',
            });
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            const result = await authService.login(email, password);

            if (!result.success) {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during login',
            });
        }
    }

    /**
     * Refresh access token
     * POST /api/auth/refresh-token
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }

            const result = await authService.refreshAccessToken(refreshToken);

            if (!result.success) {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while refreshing token',
            });
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     */
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const userId = req.user.id;

            const result = await authService.logout(refreshToken, userId);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during logout',
            });
        }
    }

    /**
     * Logout from all devices
     * POST /api/auth/logout-all
     */
    async logoutAll(req, res) {
        try {
            const userId = req.user.id;

            const result = await authService.logoutAll(userId);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Logout all error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during logout',
            });
        }
    }

    /**
     * Get current user profile
     * GET /api/auth/me
     */
    async getProfile(req, res) {
        try {
            const user = await authService.getUserById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            return res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching profile',
            });
        }
    }

    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { firstName, lastName, phone } = req.body;

            const result = await authService.updateProfile(req.user.id, {
                firstName,
                lastName,
                phone,
            });

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating profile',
            });
        }
    }

    /**
     * Change password
     * PUT /api/auth/change-password
     */
    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { currentPassword, newPassword } = req.body;

            const result = await authService.changePassword(
                req.user.id,
                currentPassword,
                newPassword
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Change password error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while changing password',
            });
        }
    }
}

module.exports = new AuthController();
