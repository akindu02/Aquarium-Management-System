import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    alert(`Login successful! (This is a demo)`);
  };

  return (
    <div className="signin-page">
      <div className="signin-container">

        <div className="signin-header">
          <h2 className="section-heading">Welcome Back</h2>
          <p className="signin-subtitle">Please sign in to continue</p>
        </div>

        <form className="signin-form glass" onSubmit={handleSubmit}>
          <h3 className="form-heading">
            Sign In
          </h3>

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary signin-btn">
            Sign In
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
          padding: 8rem 2rem 2rem;
        }

        .signin-container {
          max-width: 500px;
          width: 100%;
        }

        .signin-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signin-subtitle {
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

        .signin-form {
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

        .form-group {
          margin-bottom: 1.5rem;
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

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.9rem;
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
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .signup-link {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-muted);
          font-size: 0.95rem;
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

