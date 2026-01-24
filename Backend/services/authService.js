const { query } = require('../config/db');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordUtils');
const { generateToken, generateRefreshToken } = require('../utils/jwtUtils');

/**
 * Auth Service - Contains all authentication business logic
 */
class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} { success, user, token, message }
     */
    async register(userData) {
        const { email, password, name, role } = userData;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                message: passwordValidation.errors.join(', '),
            };
        }

        // Validate role - only allow customer, staff, supplier (NOT admin)
        const allowedRoles = ['customer', 'staff', 'supplier'];
        const userRole = role && allowedRoles.includes(role) ? role : 'customer';

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return {
                success: false,
                message: 'A user with this email already exists',
            };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new user with selected role
        const result = await query(
            `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_active, email_verified, created_at`,
            [email.toLowerCase(), hashedPassword, name, userRole]
        );

        const user = result.rows[0];

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                createdAt: user.created_at,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} { success, user, token, message }
     */
    async login(email, password) {
        // Find user by email
        const result = await query(
            `SELECT id, email, password, name, role, is_active, email_verified, created_at
       FROM users WHERE email = $1`,
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: 'Invalid email or password',
            };
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return {
                success: false,
                message: 'Your account has been deactivated. Please contact support.',
            };
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid email or password',
            };
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                createdAt: user.created_at,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Admin Login - Strict role check
     * @param {string} email
     * @param {string} password
     */
    async adminLogin(email, password) {
        // Reuse standard login logic
        const result = await this.login(email, password);

        if (!result.success) {
            return result;
        }

        // STRICT CHECK: Is this user an admin?
        if (result.user.role !== 'admin') {
            return {
                success: false,
                message: 'Access Denied: You do not have administrator privileges.',
            };
        }

        return result;
    }

    /**
     * Refresh access token using refresh token
     * @param {string} refreshToken - Refresh token
     * @returns {Object} { success, accessToken, message }
     */
    async refreshAccessToken(refreshToken) {
        // Find the refresh token in database
        const tokenResult = await query(
            `SELECT rt.*, u.id as user_id, u.email, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
            [refreshToken]
        );

        if (tokenResult.rows.length === 0) {
            return {
                success: false,
                message: 'Invalid or expired refresh token',
            };
        }

        const tokenData = tokenResult.rows[0];

        if (!tokenData.is_active) {
            return {
                success: false,
                message: 'User account is deactivated',
            };
        }

        // Generate new access token
        const tokenPayload = {
            userId: tokenData.user_id,
            email: tokenData.email,
            role: tokenData.role,
        };

        const newAccessToken = generateToken(tokenPayload);

        return {
            success: true,
            accessToken: newAccessToken,
        };
    }

    /**
     * Logout user - invalidate refresh token
     * @param {string} refreshToken - Refresh token to invalidate
     * @param {number} userId - User ID
     * @returns {Object} { success, message }
     */
    async logout(refreshToken, userId) {
        await query(
            'DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2',
            [refreshToken, userId]
        );

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }

    /**
     * Logout from all devices - invalidate all refresh tokens
     * @param {number} userId - User ID
     * @returns {Object} { success, message }
     */
    async logoutAll(userId) {
        await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

        return {
            success: true,
            message: 'Logged out from all devices successfully',
        };
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Object|null} User object or null
     */
    async getUserById(userId) {
        const result = await query(
            `SELECT id, email, name, role, is_active, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.is_active,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Object} { success, user, message }
     */
    async updateProfile(userId, updates) {
        const { name } = updates;

        const result = await query(
            `UPDATE users 
       SET name = COALESCE($1, name)
       WHERE id = $2
       RETURNING id, email, name, role, is_active, email_verified, created_at, updated_at`,
            [name, userId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        const user = result.rows[0];
        return {
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
        };
    }

    /**
     * Change user password
     * @param {number} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Object} { success, message }
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Get current password hash
        const userResult = await query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(
            currentPassword,
            userResult.rows[0].password
        );

        if (!isCurrentPasswordValid) {
            return {
                success: false,
                message: 'Current password is incorrect',
            };
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                message: passwordValidation.errors.join(', '),
            };
        }

        // Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        await query('UPDATE users SET password = $1 WHERE id = $2', [
            hashedPassword,
            userId,
        ]);

        // Invalidate all refresh tokens (force re-login)
        await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

        return {
            success: true,
            message: 'Password changed successfully. Please login again.',
        };
    }
}

module.exports = new AuthService();
