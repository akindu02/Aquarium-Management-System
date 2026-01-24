import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../utils/api';
import { saveAuthData, getDashboardRoute } from '../utils/auth';
import '../index.css';

const SignUp = () => {
  const navigate = useNavigate();

  // State matches database columns exactly
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Send data to backend
      const response = await registerAPI({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });

      if (response.success) {
        // Registration successful
        // 1. Save the token and user data
        saveAuthData(response.accessToken, response.refreshToken, response.user);

        // 2. Determine where to send the user based on role
        const dashboardRoute = getDashboardRoute(response.user.role);

        // 3. Redirect to dashboard
        navigate(dashboardRoute, { replace: true });
      } else {
        // Backend validation failed (e.g., email exists)
        if (response.errors && Array.isArray(response.errors)) {
          setError(response.errors.map(err => err.msg).join('. '));
        } else {
          setError(response.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Network or server errors
      setError(err.message || 'An error occurred during sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h2 className="section-heading">Create Account</h2>
          <p className="signup-subtitle">Join our community today</p>
        </div>

        <form className="signup-form glass" onSubmit={handleSubmit}>
          <h3 className="form-heading">Sign Up</h3>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">I am a *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input form-select"
              required
              disabled={loading}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Min 8 characters"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Re-enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 2rem 2rem;
        }

        .signup-container {
          max-width: 500px;
          width: 100%;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signup-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .section-heading {
          text-align: center;
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .signup-form {
          width: 100%;
          padding: 2.5rem;
          border-radius: 16px;
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
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2rem;
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
          margin-bottom: 1.25rem;
        }
        
        .form-row {
            display: flex;
            gap: 1rem;
        }
        
        .form-group.half {
            flex: 1;
        }

        .form-label {
          display: block;
          color: var(--text-main);
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--text-main);
          font-size: 1rem;
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

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        .form-select option {
          background: #1a1a2e;
          color: var(--text-main);
          padding: 0.5rem;
        }

        .signup-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-top: 1rem;
        }
        
        .signup-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signin-link {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .signin-link a {
          color: var(--color-primary);
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .signin-link a:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-container {
             padding: 0 1rem;
          }
          
          .signup-form {
            padding: 1.5rem;
          }

          .section-heading {
            font-size: 1.75rem;
          }
          
          .form-row {
              flex-direction: column;
              gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUp;
