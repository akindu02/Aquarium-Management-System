import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { saveAuthData, getDashboardRoute } from '../utils/auth';
import { loginAPI, loginAdminAPI } from '../utils/api';
import '../index.css';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get('type') === 'admin';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Choose API based on login type
      const apiCall = isAdminLogin ? loginAdminAPI : loginAPI;
      const response = await apiCall(formData.email, formData.password);

      if (response.success) {
        // Save authentication data (token, refresh token, and user data)
        saveAuthData(response.accessToken, response.refreshToken, response.user);

        // Check if there is a redirect location
        const state = location.state || {}; // Get the state
        const { from, ...stateData } = state; // Extract 'from' and the rest of the data

        if (from) {
          navigate(from, { replace: true, state: stateData });
        } else {
          // Get the dashboard route based on user role
          const dashboardRoute = getDashboardRoute(response.user.role);
          navigate(dashboardRoute, { replace: true });
        }
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Simplify error message for security
      const msg = isAdminLogin && err.message.includes('403')
        ? 'Access Denied: You are not an administrator.'
        : (err.message || 'An error occurred during login. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">

        <div className="signin-header">
          <h2 className="section-heading">{isAdminLogin ? 'Admin Portal' : 'Welcome Back'}</h2>
          <p className="signin-subtitle">
            {isAdminLogin ? 'Secure login for administrators' : 'Please sign in to continue'}
          </p>
        </div>

        <form className="signin-form glass" onSubmit={handleSubmit}>
          <h3 className="form-heading">
            {isAdminLogin ? 'Admin Sign In' : 'Sign In'}
          </h3>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" disabled={loading} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary signin-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>

      <style>{`
        .signin-page {
          min-height: 100vh;
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 2rem;
        }

        .signin-container {
          max-width: 420px;
          width: 100%;
        }

        .signin-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .signin-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .section-heading {
          text-align: center;
          font-size: 1.65rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.4rem;
        }

        .signin-form {
          width: 100%;
          padding: 2rem;
          border-radius: 14px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-heading {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }

        .error-message {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #FF6B6B;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          animation: slideIn 0.3s ease;
        }

        .form-group {
          margin-bottom: 1.1rem;
        }

        .form-label {
          display: block;
          color: var(--text-main);
          font-weight: 500;
          margin-bottom: 0.4rem;
          font-size: 0.875rem;
        }

        .form-input {
          width: 100%;
          padding: 0.65rem 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text-main);
          font-size: 0.925rem;
          font-family: var(--font-main);
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .password-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrap .form-input {
          padding-right: 2.5rem;
        }

        .eye-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: var(--color-primary); }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .remember-me input[type="checkbox"] {
          cursor: pointer;
          accent-color: var(--color-primary);
        }

        .forgot-password {
          color: var(--color-primary);
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-password:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }

        .signin-btn {
          width: 100%;
          padding: 0.8rem;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .signup-link {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .signup-link a {
          color: var(--color-primary);
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .signup-link a:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signin-container {
             padding: 0 1rem;
          }
          
          .signin-form {
            padding: 1.5rem;
          }

          .form-options {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
           .section-heading {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;

