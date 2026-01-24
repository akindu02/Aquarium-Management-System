import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // TODO: Integrate with backend API
        // await apiRequest('/auth/forgot-password', { email });

        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            // Navigate to OTP verification page
            navigate('/verify-otp', { state: { email } });
        }, 1000);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    {/* Key Icon Circle */}
                    <div className="icon-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                    </div>
                    <h2 className="section-heading">Forgot Password</h2>
                    <p className="auth-subtitle">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form className="auth-form glass" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Enter your email address"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>

                    <div className="back-to-login">
                        <Link to="/signin" className="back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>

            <style>{`
        .auth-page {
          min-height: 100vh;
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .auth-container {
          max-width: 450px;
          width: 100%;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .icon-circle {
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.2); /* Blue tint */
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--color-secondary);
        }
        
        .icon-circle svg {
            width: 30px;
            height: 30px;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .section-heading {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .auth-form {
          width: 100%;
          padding: 2.5rem;
          border-radius: 20px;
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
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
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-main);
          font-size: 1rem;
          font-family: var(--font-main);
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
        }

        .auth-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-top: 0.5rem;
        }
        
        .back-to-login {
            text-align: center;
            margin-top: 1.5rem;
        }
        
        .back-link {
            color: var(--text-muted);
            font-size: 0.95rem;
            transition: color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .back-link:hover {
            color: var(--text-main);
        }
        
        .error-message {
            background: rgba(255, 107, 107, 0.15);
            color: #ff6b6b;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
            font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .auth-container {
             padding: 0 1rem;
          }
          .auth-form {
            padding: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
};

export default ForgotPassword;
