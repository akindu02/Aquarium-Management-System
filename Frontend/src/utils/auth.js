// Authentication utility functions

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (accessToken, refreshToken, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
};

/**
 * Get user role from localStorage
 */
export const getUserRole = () => {
    const user = getUserData();
    return user?.role || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getAccessToken() && !!getUserData();
};

/**
 * Clear all authentication data (logout)
 */
export const clearAuthData = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Get dashboard route based on user role
 */
export const getDashboardRoute = (role) => {
    const routes = {
        admin: '/admin',
        staff: '/staff',
        supplier: '/supplier',
        customer: '/customer',
    };
    return routes[role] || '/';
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRole) => {
    const userRole = getUserRole();
    return userRole === requiredRole;
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (requiredRoles) => {
    const userRole = getUserRole();
    return requiredRoles.includes(userRole);
};
