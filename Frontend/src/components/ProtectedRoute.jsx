import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

/**
 * ProtectedRoute component - Protects routes based on authentication and role
 * @param {Object} props
 * @param {React.Component} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Single role or array of roles allowed to access
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/signin" replace />;
    }

    // If allowedRoles is specified, check user's role
    if (allowedRoles) {
        const userRole = getUserRole();
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            // User doesn't have the required role
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-bg)',
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '3rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            fontSize: '4rem',
                            marginBottom: '1rem',
                            color: 'var(--color-primary)'
                        }}>403</h1>
                        <h2 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            color: 'var(--text-main)'
                        }}>Access Denied</h2>
                        <p style={{
                            color: 'var(--text-muted)',
                            marginBottom: '2rem'
                        }}>
                            You don't have permission to access this area.
                            <br />
                            Required role: {roles.join(', ')}
                        </p>
                        <a
                            href="/signin"
                            style={{
                                display: 'inline-block',
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Back to Sign In
                        </a>
                    </div>
                </div>
            );
        }
    }

    // User is authenticated and has the required role
    return children;
};

export default ProtectedRoute;
