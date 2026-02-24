const { query } = require('../config/db');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordUtils');
const { generateToken, generateRefreshToken } = require('../utils/jwtUtils');
const emailService = require('../utils/emailService');

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

    /**
     * Request password reset - Generate OTP and send email
     * @param {string} email - User email
     * @returns {Object} { success, message }
     */
    async requestPasswordReset(email) {
        // Find user by email
        const result = await query(
            'SELECT id, email, name, is_active FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        // Always return success to prevent email enumeration
        if (result.rows.length === 0) {
            return {
                success: true,
                message: 'If the email exists, a password reset code has been sent.',
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

        // Generate 6-digit OTP
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration to 15 minutes from now
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Delete any existing unused password reset tokens for this user
        await query(
            'DELETE FROM password_reset_tokens WHERE user_id = $1',
            [user.id]
        );

        // Store reset token in database
        await query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES ($1, $2, $3, false)',
            [user.id, resetToken, expiresAt]
        );

        // Send email with OTP
        try {
            await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return {
                success: false,
                message: 'Failed to send password reset email. Please try again later.',
            };
        }

        return {
            success: true,
            message: 'If the email exists, a password reset code has been sent.',
        };
    }

    /**
     * Verify reset token (OTP)
     * @param {string} email - User email
     * @param {string} token - Reset token (OTP)
     * @returns {Object} { success, message, userId }
     */
    async verifyResetToken(email, token) {
        // Find user and token
        const result = await query(
            `SELECT u.id, u.email, u.name, prt.token, prt.expires_at, prt.used
             FROM users u
             JOIN password_reset_tokens prt ON u.id = prt.user_id
             WHERE u.email = $1 AND prt.token = $2`,
            [email.toLowerCase(), token]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: 'Invalid or expired reset code.',
            };
        }

        const data = result.rows[0];

        // Check if token is already used
        if (data.used) {
            return {
                success: false,
                message: 'This reset code has already been used.',
            };
        }

        // Check if token is expired
        const now = new Date();
        const expiresAt = new Date(data.expires_at);

        if (now > expiresAt) {
            return {
                success: false,
                message: 'This reset code has expired. Please request a new one.',
            };
        }

        return {
            success: true,
            message: 'Reset code verified successfully.',
            userId: data.id,
        };
    }

    /**
     * Reset password using verified token
     * @param {string} email - User email
     * @param {string} token - Reset token (OTP)
     * @param {string} newPassword - New password
     * @returns {Object} { success, message }
     */
    async resetPassword(email, token, newPassword) {
        // First verify the token
        const verification = await this.verifyResetToken(email, token);

        if (!verification.success) {
            return verification;
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                message: passwordValidation.errors.join(', '),
            };
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, verification.userId]
        );

        // Mark token as used
        await query(
            'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND token = $2',
            [verification.userId, token]
        );

        // Invalidate all refresh tokens (force re-login on all devices)
        await query('DELETE FROM refresh_tokens WHERE user_id = $1', [verification.userId]);

        // Get user info for confirmation email
        const userResult = await query(
            'SELECT email, name FROM users WHERE id = $1',
            [verification.userId]
        );

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            // Send confirmation email (don't wait for it)
            emailService.sendPasswordResetConfirmation(user.email, user.name).catch(err => {
                console.error('Error sending confirmation email:', err);
            });
        }

        return {
            success: true,
            message: 'Password has been reset successfully. Please login with your new password.',
        };
    }

    // =============================================
    // ADMIN USER MANAGEMENT METHODS
    // =============================================

    /**
     * Admin creates a new user (allows ALL roles including admin)
     * @param {Object} userData - User data from admin
     * @returns {Object} { success, user, message }
     */
    async adminCreateUser(userData) {
        const { email, password, name, role } = userData;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                message: passwordValidation.errors.join(', '),
            };
        }

        // Admin can assign ANY role including admin
        const allowedRoles = ['customer', 'staff', 'supplier', 'admin'];
        if (!allowedRoles.includes(role)) {
            return {
                success: false,
                message: 'Invalid role. Must be one of: customer, staff, supplier, admin',
            };
        }

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

        // Insert new user
        const result = await query(
            `INSERT INTO users (email, password, name, role, is_active, email_verified)
             VALUES ($1, $2, $3, $4, true, false)
             RETURNING id, email, name, role, is_active, email_verified, created_at`,
            [email.toLowerCase(), hashedPassword, name, role]
        );

        const user = result.rows[0];

        return {
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                createdAt: user.created_at,
            },
        };
    }

    /**
     * Get all users (for admin dashboard)
     * @param {Object} filters - Optional filters { role, search }
     * @returns {Object} { success, users }
     */
    async getAllUsers(filters = {}) {
        let queryText = `
            SELECT id, email, name, role, is_active, email_verified, created_at, updated_at
            FROM users
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by role
        if (filters.role && filters.role !== 'all') {
            queryText += ` AND role = $${paramIndex}`;
            params.push(filters.role);
            paramIndex++;
        }

        // Search by name or email
        if (filters.search) {
            queryText += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`;
            params.push(`%${filters.search.toLowerCase()}%`);
            paramIndex++;
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await query(queryText, params);

        const users = result.rows.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.is_active ? 'Active' : 'Inactive',
            isActive: user.is_active,
            emailVerified: user.email_verified,
            date: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : null,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));

        return {
            success: true,
            users,
            total: users.length,
        };
    }

    /**
     * Update a user (admin only)
     * @param {number} userId - User ID to update
     * @param {Object} updateData - Fields to update
     * @returns {Object} { success, user, message }
     */
    async updateUser(userId, { name, email, role }) {
        // Check if user exists
        const userResult = await query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return { success: false, message: 'User not found' };
        }

        // If email changed, ensure it's not taken by another user
        if (email) {
            const emailCheck = await query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email.toLowerCase(), userId]
            );
            if (emailCheck.rows.length > 0) {
                return { success: false, message: 'Email is already in use by another account' };
            }
        }

        const updated = await query(
            `UPDATE users
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 role = COALESCE($3, role),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING id, name, email, role`,
            [name || null, email ? email.toLowerCase() : null, role || null, userId]
        );

        return {
            success: true,
            message: 'User updated successfully',
            user: updated.rows[0],
        };
    }

    /**
     * Delete a user (admin only)
     * @param {number} userId - User ID to delete
     * @param {number} adminId - ID of the admin performing the deletion
     * @returns {Object} { success, message }
     */
    async deleteUser(userId, adminId) {
        // Prevent admin from deleting themselves
        if (parseInt(userId) === parseInt(adminId)) {
            return {
                success: false,
                message: 'You cannot delete your own account',
            };
        }

        // Check if user exists
        const userResult = await query(
            'SELECT id, name, role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        // Delete refresh tokens first
        await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

        // Delete password reset tokens
        await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);

        // Delete the user
        await query('DELETE FROM users WHERE id = $1', [userId]);

        return {
            success: true,
            message: `User "${userResult.rows[0].name}" has been deleted successfully`,
        };
    }
}

module.exports = new AuthService();
