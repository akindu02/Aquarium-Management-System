import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Lock } from 'lucide-react';
import '../index.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        cartItems = [],
        cartTotal = 0,
        shippingData = {}
    } = location.state || {}; // Expecting shipping data from previous step

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        cardType: 'visa' // Default to visa
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const currentTotal = cartTotal || calculateTotal();

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        // Simple input formatting
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 3);
        } else if (name === 'cardHolder') {
            value = value.toUpperCase();
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate Payment Processing API call
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="payment-container container">
                <div className="success-message white-theme-panel">
                    <CheckCircle size={64} className="text-success" />
                    <h1>Payment Successful!</h1>
                    <p>Your order has been placed successfully.</p>
                    <p>A confirmation has been sent to {shippingData.email || 'your email'}.</p>
                    <div className="order-id-badge">Order ID: #ORD-{Math.floor(Math.random() * 100000)}</div>
                    <Link to="/store" className="btn btn-primary mt-4">
                        Continue Shopping
                    </Link>
                </div>
                <style>{`
          .payment-container {
            padding-top: 8rem;
            min-height: 80vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .white-theme-panel {
            background: #ffffff;
            text-align: center;
            padding: 3rem;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .text-success { color: #10b981; }
          .mt-4 { margin-top: 2rem; }
          .order-id-badge {
              background: #f3f4f6;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              font-family: monospace;
              color: #374151;
          }
          h1 { color: #111827; }
          p { color: #4b5563; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="header-bg"></div>
            <div className="container">
                <div className="payment-header">
                    <button onClick={() => navigate(-1)} className="back-link btn-reset">
                        <ArrowLeft size={20} /> Back to Shipping
                    </button>
                    <h1 className="page-title">Payment Details</h1>
                </div>

                <div className="payment-grid">
                    {/* Left Column - Payment Form */}
                    <div className="payment-form-section white-theme">
                        <h2 className="section-title">
                            <CreditCard size={24} className="icon-primary" />
                            Card Information
                        </h2>

                        <div className="card-type-selector">
                            <p className="selector-label">We accept</p>
                            <div className="card-icons">
                                <div className={`card-icon ${cardData.cardType === 'visa' ? 'active' : ''}`} onClick={() => setCardData({ ...cardData, cardType: 'visa' })}>
                                    {/* Simple CSS Visa Icon representation */}
                                    <span className="visa-text">VISA</span>
                                </div>
                                <div className={`card-icon ${cardData.cardType === 'master' ? 'active' : ''}`} onClick={() => setCardData({ ...cardData, cardType: 'master' })}>
                                    <span className="master-circles">
                                        <span></span><span></span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form id="payment-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Card Number</label>
                                <div className="input-with-icon">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        required
                                        value={cardData.cardNumber}
                                        onChange={handleInputChange}
                                        placeholder="0000 0000 0000 0000"
                                        maxLength="19"
                                    />
                                    <CreditCard size={18} className="input-icon" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Card Holder Name</label>
                                <input
                                    type="text"
                                    name="cardHolder"
                                    required
                                    value={cardData.cardHolder}
                                    onChange={handleInputChange}
                                    placeholder="YOUR NAME"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        required
                                        value={cardData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <div className="input-with-icon">
                                        <input
                                            name="cvv"
                                            required
                                            value={cardData.cvv}
                                            onChange={handleInputChange}
                                            placeholder="123"
                                            maxLength="3"
                                            type="password"
                                        />
                                        <Lock size={16} className="input-icon" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="order-summary-section">
                        <div className="order-card white-theme">
                            <h3>Order Summary</h3>
                            <div className="order-items">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x {item.quantity}</span>
                                        </div>
                                        <span className="item-price">LKR {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>LKR {currentTotal.toLocaleString()}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="total-row final-total">
                                    <span>Total Pay</span>
                                    <span>LKR {currentTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="shipping-preview">
                                <h4>Ship To:</h4>
                                <p>{shippingData.name}</p>
                                <p>{shippingData.address}, {shippingData.city}</p>
                                <p>{shippingData.phone}</p>
                            </div>

                            <button
                                type="submit"
                                form="payment-form"
                                className="btn btn-primary pay-now-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing Payment...' : `Pay LKR ${currentTotal.toLocaleString()}`}
                            </button>

                            <p className="secure-notice">
                                <Lock size={14} /> 256-bit SSL Encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .payment-page {
          padding-top: 8rem;
          padding-bottom: 4rem;
          min-height: 100vh;
          position: relative;
        }

        .header-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 300px;
            background: linear-gradient(180deg, rgba(6, 182, 212, 0.15), transparent);
            z-index: -1;
            pointer-events: none;
        }

        .payment-header {
            margin-bottom: 3rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
            transition: color 0.3s;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            font-size: 1rem;
        }

        .back-link:hover {
            color: var(--color-primary);
        }

        .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #fff, var(--text-muted));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .payment-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
        }

        /* White Theme Styles (Reused & Expanded) */
        .white-theme {
            background: #ffffff;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .white-theme .section-title {
            color: #111827;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .white-theme h3 {
             color: #111827;
             font-size: 1.25rem;
             margin-bottom: 1.5rem;
             padding-bottom: 1rem;
             border-bottom: 1px solid #e5e7eb;
        }

        .white-theme label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #4b5563;
        }

        .white-theme input {
            width: 100%;
            padding: 0.75rem;
            background: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            color: #1f2937;
            transition: all 0.3s ease;
        }
        
        .white-theme input:focus {
            outline: none;
            background: #ffffff;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .input-with-icon {
            position: relative;
        }

        .input-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            pointer-events: none;
        }

        .card-type-selector {
            margin-bottom: 2rem;
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 12px;
        }
        
        .selector-label {
            color: #6b7280;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .card-icons {
            display: flex;
            gap: 1rem;
        }
        
        .card-icon {
            height: 40px;
            width: 60px;
            border: 2px solid #d1d5db;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }
        
        .card-icon.active {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
        
        .visa-text {
            font-weight: 800;
            font-style: italic;
            color: #1a1f71;
            font-size: 1.2rem;
        }
        
        .master-circles {
            display: flex;
            position: relative;
        }
        
        .master-circles span {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: block;
        }
        
        .master-circles span:first-child {
            background: #eb001b;
            opacity: 0.8;
        }
        
        .master-circles span:last-child {
            background: #f79e1b;
            opacity: 0.8;
            margin-left: -8px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 1.25rem;
        }
        
        .icon-primary { color: var(--color-primary); }
        .text-muted { color: var(--text-muted); }

        /* Order Summary Items */
        .order-items {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 1.5rem;
            padding-right: 0.5rem;
        }
        
        .white-theme .order-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
        }
        
        .white-theme .item-name { color: #1f2937; font-weight: 500; font-size: 0.9rem; }
        .white-theme .item-qty { color: #6b7280; font-size: 0.8rem; display: block; }
        .white-theme .item-price { color: #1f2937; font-weight: 600; font-size: 0.9rem; }
        
        .white-theme .total-row {
             display: flex;
             justify-content: space-between;
             margin-bottom: 0.5rem;
             color: #4b5563;
             font-size: 0.95rem;
        }
        
        .white-theme .final-total {
             margin-top: 1rem;
             padding-top: 1rem;
             border-top: 1px dashed #e5e7eb;
             color: #111827;
             font-weight: 700;
             font-size: 1.2rem;
        }

        .shipping-preview {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1.5rem;
            border: 1px solid #e5e7eb;
        }
        
        .shipping-preview h4 {
            color: #374151;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .shipping-preview p {
            color: #6b7280;
            font-size: 0.85rem;
            line-height: 1.4;
            margin: 0;
        }

        .pay-now-btn {
            width: 100%;
            margin-top: 1.5rem;
            padding: 1rem;
            font-size: 1rem;
        }

        .secure-notice {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            font-size: 0.8rem;
            color: #6b7280;
        }

        @media (max-width: 968px) {
            .payment-grid {
                grid-template-columns: 1fr;
            }
            .order-summary-section {
                order: -1;
            }
        }
      `}</style>
        </div>
    );
};

export default Payment;
