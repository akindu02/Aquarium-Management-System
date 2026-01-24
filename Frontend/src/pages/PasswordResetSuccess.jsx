import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const PasswordResetSuccess = () => {
    return (
        <div className="auth-page">
            <div className="auth-container">

                <div className="auth-form glass success-content">
                    <div className="icon-circle success-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>

                    <h2 className="section-heading">Password Reset</h2>

                    <p className="auth-subtitle">
                        Your password has been successfully reset. <br />
                        Click below to login magically.
                    </p>

                    <Link to="/signin" className="btn btn-primary auth-btn" style={{ textDecoration: 'none' }}>
                        Continue
                    </Link>

                    <div className="back-to-login">
                        <Link to="/signin" className="back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
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
        
        .success-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .icon-circle {
            width: 80px;
            height: 80px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--color-secondary);
        }
        
        .success-icon {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
        
        .success-icon svg {
             width: 40px;
             height: 40px;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-top: 0.5rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .section-heading {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .auth-form {
          width: 100%;
          padding: 3rem 2rem;
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

        .auth-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
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

        @media (max-width: 480px) {
          .auth-container {
             padding: 0 1rem;
          }
          .auth-form {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
        </div>
    );
};

export default PasswordResetSuccess;
