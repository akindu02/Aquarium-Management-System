import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'your email';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace to go back
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            e.target.previousSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            setLoading(false);
            return;
        }

        // TODO: Integrate with backend API
        // await apiRequest('/auth/verify-otp', { email, otp: otpValue });

        setTimeout(() => {
            setLoading(false);
            navigate('/reset-password', { state: { email, otp: otpValue } });
        }, 1000);
    };

    const handleResend = () => {
        // TODO: Resend logic
        alert("Resent OTP!");
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="icon-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h2 className="section-heading">Check your email</h2>
                    <p className="auth-subtitle">
                        We sent a verification code to <br /> <strong className="email-highlight">{email}</strong>
                    </p>
                </div>

                <form className="auth-form glass" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label className="form-label center-text">Enter the 6-digit code</label>
                        <div className="otp-container">
                            {otp.map((data, index) => (
                                <input
                                    className="otp-input"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onFocus={e => e.target.select()}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <div className="resend-container">
                        Didn't receive the email? <button type="button" onClick={handleResend} className="resend-btn">Click to resend</button>
                    </div>

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
          line-height: 1.5;
        }
        
        .email-highlight {
            color: var(--text-main);
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
          margin-bottom: 2rem;
        }

        .form-label {
          display: block;
          color: var(--text-main);
          font-weight: 500;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        
        .center-text {
            text-align: center;
        }
        
        .otp-container {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
        }
        
        .otp-input {
            width: 3rem;
            height: 3.5rem;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: var(--text-main);
            transition: all 0.3s ease;
        }
        
        .otp-input:focus {
             outline: none;
             border-color: var(--color-primary);
             background: rgba(255, 255, 255, 0.1);
             transform: translateY(-2px);
             box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        .auth-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .resend-container {
            text-align: center;
            margin-top: 1.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        
        .resend-btn {
            background: none;
            color: var(--color-primary);
            font-weight: 600;
            padding: 0;
            margin-left: 0.25rem;
        }
        
        .resend-btn:hover {
            color: var(--color-accent);
            text-decoration: underline;
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
      `}</style>
        </div>
    );
};

export default VerifyOtp;
