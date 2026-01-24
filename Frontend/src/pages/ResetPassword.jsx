import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const otp = location.state?.otp;

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        // TODO: Integrate with backend API
        // await apiRequest('/auth/reset-password', { email, otp, newPassword: formData.password });

        setTimeout(() => {
            setLoading(false);
            navigate('/password-reset-success');
        }, 1000);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="icon-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h2 className="section-heading">Set New Password</h2>
                    <p className="auth-subtitle">
                        Your new password must be different from previous used passwords.
                    </p>
                </div>

                <form className="auth-form glass" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
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
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Reset Password'}
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
            background: rgba(59, 130, 246, 0.2);
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

        .password-input-wrapper {
            position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          padding-right: 3rem; 
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
        
        .toggle-password {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toggle-password:hover {
            color: var(--color-primary);
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

export default ResetPassword;
