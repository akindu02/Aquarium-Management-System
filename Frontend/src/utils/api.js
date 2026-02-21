// API utility functions
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Make an authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
    const token = getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }

    return data;
};

/**
 * Login API call
 */
export const loginAPI = async (email, password) => {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Admin Login API call
 */
export const loginAdminAPI = async (email, password) => {
    return apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Register API call
 */
export const registerAPI = async (userData) => {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

/**
 * Logout API call
 */
export const logoutAPI = async (refreshToken) => {
    return apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
};

/**
 * Get current user profile
 */
export const getProfileAPI = async () => {
    return apiRequest('/auth/me', {
        method: 'GET',
    });
};

/**
 * Refresh access token
 */
export const refreshTokenAPI = async (refreshToken) => {
    return apiRequest('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
};

/**
 * Forgot password - Request OTP
 */
export const forgotPasswordAPI = async (email) => {
    return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

/**
 * Verify password reset OTP
 */
export const verifyResetTokenAPI = async (email, token) => {
    return apiRequest('/auth/verify-reset-token', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
    });
};

/**
 * Reset password with OTP
 */
export const resetPasswordAPI = async (email, token, newPassword) => {
    return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword }),
    });
};

// =============================================
// ADMIN USER MANAGEMENT APIs
// =============================================

/**
 * Admin - Get all users
 */
export const adminGetUsersAPI = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString();
    return apiRequest(`/auth/admin/users${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
    });
};

/**
 * Admin - Create a new user (any role including admin)
 */
export const adminCreateUserAPI = async (userData) => {
    return apiRequest('/auth/admin/create-user', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

/**
 * Admin - Delete a user
 */
export const adminDeleteUserAPI = async (userId) => {
    return apiRequest(`/auth/admin/users/${userId}`, {
        method: 'DELETE',
    });
};

// =============================================
// ORDER APIs
// =============================================

/**
 * Customer - Place a new order
 * @param {{ items: {productId,quantity}[], shippingAddress:string, phone:string, totalAmount:number }} orderData
 */
export const createOrderAPI = async (orderData) => {
    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
};

/**
 * Customer / Admin / Staff - Get orders list
 *  - Customer gets only their own
 *  - Admin / Staff get all (with optional filters)
 */
export const getOrdersAPI = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return apiRequest(`/orders${qs ? `?${qs}` : ''}`, { method: 'GET' });
};

/**
 * Get a single order by ID
 */
export const getOrderByIdAPI = async (orderId) => {
    return apiRequest(`/orders/${orderId}`, { method: 'GET' });
};

/**
 * Customer - Mark an order as paid (calls the mock payment handler)
 */
export const markOrderPaidAPI = async (orderId, paymentMethod = 'Card') => {
    return apiRequest(`/orders/${orderId}/pay`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethod }),
    });
};

/**
 * Admin / Staff - Update order workflow status
 */
export const updateOrderStatusAPI = async (orderId, status) => {
    return apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
};

/**
 * Admin / Staff - Get order statistics summary
 */
export const getOrderStatsAPI = async () => {
    return apiRequest('/orders/stats', { method: 'GET' });
};

