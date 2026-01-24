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
