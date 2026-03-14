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

/**
 * Staff Dashboard Stats
 */
export const getStaffDashboardStatsAPI = async () => {
    return apiRequest('/staff/dashboard-stats', {
        method: 'GET',
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

/**
 * Admin - Update a user (name, email, role)
 */
export const adminUpdateUserAPI = async (userId, userData) => {
    return apiRequest(`/auth/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

/**
 * Admin - Toggle a user's active/inactive status
 */
export const adminToggleUserStatusAPI = async (userId) => {
    return apiRequest(`/auth/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
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
 * Customer - Cancel a Pending or Processing order before it is shipped
 */
export const cancelOrderAPI = async (orderId) => {
    return apiRequest(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
    });
};

/**
 * Admin / Staff - Get all refund requests (optionally filtered by status)
 * @param {string} [status]  'Pending' | 'Processing' | 'Completed' | 'All'
 */
export const getRefundRequestsAPI = async (status = 'All') => {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/orders/refunds${qs}`, { method: 'GET' });
};

/**
 * Admin / Staff - Advance a refund request to Processing or Completed
 * @param {number} refundId
 * @param {{ status: string, adminNote?: string, refundRef?: string }} payload
 */
export const processRefundAPI = async (refundId, payload) => {
    return apiRequest(`/orders/refunds/${refundId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
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

// =============================================
// RETURN APIs
// =============================================

/**
 * Customer - Submit a full-order return request
 * @param {{ orderId: number, reason: string, description: string }} data
 */
export const createReturnAPI = async (data) => {
    return apiRequest('/returns', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * Customer - Get their own return requests
 */
export const getMyReturnsAPI = async () => {
    return apiRequest('/returns/my', { method: 'GET' });
};

/**
 * Admin / Staff - Get all return requests (with optional filters)
 */
export const getAllReturnsAPI = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return apiRequest(`/returns${qs ? `?${qs}` : ''}`, { method: 'GET' });
};

/**
 * Admin / Staff - Update return status and admin note
 */
export const updateReturnStatusAPI = async (returnId, status, adminNote = '') => {
    return apiRequest(`/returns/${returnId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
    });
};

// =============================================
// PRODUCT APIs
// =============================================

/**
 * Get all products (public — no auth required)
 */
export const getProductsAPI = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { method: 'GET' });
};

/**
 * Get expiring soon products (Staff / Admin)
 */
export const getExpiringProductsAPI = async () => {
    return apiRequest(`/products/expiring`, { method: 'GET' });
};

// =============================================
// POS APIs (Cash-only)
// =============================================

/**
 * Staff / Admin - Create a cash-only POS order for a walk-in customer
 * @param {{ customer: {name:string, phone?:string, email?:string, address?:string}, items: {productId:number, quantity:number}[] }} data
 */
export const createPosOrderAPI = async (data) => {
    return apiRequest('/pos/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// =============================================
// PROFILE APIs
// =============================================

/**
 * Update current user profile (name)
 */
export const updateProfileAPI = async (data) => {
    return apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

/**
 * Change current user password
 */
export const changePasswordAPI = async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
};

/**
 * Get supplier-specific details (company_name, phone, address)
 */
export const getSupplierDetailsAPI = async () => {
    return apiRequest('/auth/supplier-details', {
        method: 'GET',
    });
};

/**
 * Update supplier-specific details (company_name, phone, address)
 */
export const updateSupplierDetailsAPI = async (details) => {
    return apiRequest('/auth/supplier-details', {
        method: 'PUT',
        body: JSON.stringify(details),
    });
};

// =============================================
// NOTIFICATION APIs
// =============================================

/**
 * Get all notifications for the logged-in user
 */
export const getNotificationsAPI = async () => {
    return apiRequest('/notifications', { method: 'GET' });
};

/**
 * Get unread notification count
 */
export const getUnreadCountAPI = async () => {
    return apiRequest('/notifications/unread-count', { method: 'GET' });
};

/**
 * Mark a single notification as read
 */
export const markNotificationReadAPI = async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsReadAPI = async () => {
    return apiRequest('/notifications/read-all', { method: 'PATCH' });
};

/**
 * Delete a single notification
 */
export const deleteNotificationAPI = async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' });
};

/**
 * Clear all notifications
 */
export const clearAllNotificationsAPI = async () => {
    return apiRequest('/notifications/clear-all', { method: 'DELETE' });
};

// =============================================
// ADMIN DASHBOARD APIs
// =============================================

/**
 * Admin - Get comprehensive dashboard statistics
 */
export const getAdminDashboardStatsAPI = async () => {
    return apiRequest('/admin/dashboard-stats', { method: 'GET' });
};

