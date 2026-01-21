import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getDashboardRoute, getUserRole } from '../utils/auth';

/**
 * RedirectIfAuthenticated - Redirects logged-in users to their dashboard
 * Use this on public pages like SignIn/SignUp to prevent logged-in users from accessing them
 */
const RedirectIfAuthenticated = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            const role = getUserRole();
            const dashboardRoute = getDashboardRoute(role);
            navigate(dashboardRoute, { replace: true });
        }
    }, [navigate]);

    // If user is authenticated, don't render the children (they'll be redirected)
    if (isAuthenticated()) {
        return null;
    }

    // User is not authenticated, show the page
    return children;
};

export default RedirectIfAuthenticated;
