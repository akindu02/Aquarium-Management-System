import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { createOrderAPI, getOnlineSalesSettingsAPI } from '../utils/api';
import '../index.css';

const CART_KEY = 'aquarium_cart';
const loadCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
};

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Accept cart from navigation state OR fall back to localStorage
    const { cartItems: stateItems, cartTotal: stateTotal } = location.state || {};
    const cartItems = (stateItems && stateItems.length > 0) ? stateItems : loadCart();
    const cartTotal = stateTotal || cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState(0);

    useEffect(() => {
        getOnlineSalesSettingsAPI()
            .then((res) => {
                const d = res.data || {};
                setShippingFee(parseFloat(d.shipping_fee) || 0);
                setDiscountType(d.online_discount_type || 'percentage');
                setDiscountValue(parseFloat(d.online_discount_value) || 0);
            })
            .catch(() => {
                // If fetch fails, fall back to 0 (free shipping, no discount)
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = cartTotal || cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const discountAmount = discountType === 'percentage'
        ? subtotal * (discountValue / 100)
        : discountValue;

    const grandTotal = subtotal - discountAmount + shippingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Empty Cart', text: 'Your cart is empty.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4' });
            return;
        }

        setIsProcessing(true);
        try {
            const shippingAddress = `${formData.address}, ${formData.city} ${formData.zipCode}`.trim();
            const items = cartItems.map(item => ({
                productId: item.product_id,
                quantity: item.quantity,
            }));

            const result = await createOrderAPI({
                items,
                shippingAddress,
                phone: formData.phone,
                totalAmount: grandTotal,
            });

            if (result.success) {
                // Clear cart from localStorage
                localStorage.removeItem(CART_KEY);
                navigate('/payment', {
                    state: {
                        orderId: result.orderId,
                        orderRef: result.orderRef,
                        totalAmount: result.totalAmount,
                        subtotal,
                        shippingFee: result.shippingFee,
                        discountAmount: result.discountAmount,
                        shippingData: { ...formData, shippingAddress },
                        cartItems,
                    }
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Order Failed',
                text: err.message || 'Could not place your order. Please try again.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-container container">
                <div className="empty-cart glass">
                    <h2>Your cart is empty</h2>
                    <p>Add some items from the store to proceed to checkout.</p>
                    <Link to="/store" className="btn btn-primary mt-4">
                        <ArrowLeft size={18} /> Back to Store
                    </Link>
                </div>
                <style>{`
            .checkout-container { padding-top: 8rem; min-height: 60vh; }
            .empty-cart { text-align: center; padding: 3rem; border-radius: 16px; }
            .mt-4 { margin-top: 1.5rem; display: inline-flex; align-items: center; gap: 0.5rem; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="header-bg"></div>
            <div className="container">
                <div className="checkout-header">
                    <Link to="/store" className="back-link">
                        <ArrowLeft size={20} /> Back to Store
                    </Link>
                    <h1 className="page-title">Checkout</h1>
                </div>

                <div className="checkout-grid">
                    {/* Left Column - Billing Details */}
                    <div className="checkout-form-section white-theme">
                        <h2 className="section-title">
                            <Truck size={24} className="icon-primary" />
                            Shipping Information
                        </h2>
                        <form id="checkout-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+94 77 123 4567"
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Colombo"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="10100"
                                    />
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
                                    <span>LKR {subtotal.toLocaleString()}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="total-row" style={{ color: '#4ECDC4' }}>
                                        <span>
                                            Discount{discountType === 'percentage' ? ` (${discountValue}%)` : ''}
                                        </span>
                                        <span>- LKR {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>{shippingFee === 0 ? 'Free' : `LKR ${shippingFee.toLocaleString()}`}</span>
                                </div>
                                <div className="total-row final-total">
                                    <span>Total</span>
                                    <span>LKR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="btn btn-primary place-order-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing
                                    ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />Placing Order…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></>
                                    : 'Proceed to Payment'
                                }
                            </button>

                            <p className="secure-notice">
                                <CheckCircle size={14} /> Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .checkout-page {
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

        .checkout-header {
            margin-bottom: 3rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
            transition: color 0.3s;
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

        .checkout-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
        }

        /* White Theme Styles */
        .white-theme {
            background: #ffffff;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .white-theme .section-title {
            color: #111827;
        }

        .white-theme label {
            color: #4b5563;
        }

        .white-theme input {
            background: #f9fafb;
            border: 1px solid #d1d5db;
            color: #1f2937;
        }
        
        .white-theme input:focus {
            background: #ffffff;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .white-theme .payment-option {
            background: #f9fafb;
            border-color: #d1d5db;
            color: #1f2937;
        }
        
        .white-theme .payment-option.active {
             background: #eff6ff;
             border-color: var(--color-primary);
        }
        
        .white-theme .radio-dot {
             border-color: #9ca3af;
        }
        
        .white-theme .payment-option.active .radio-dot {
            border-color: var(--color-primary);
        }

        /* White Theme Order Summary Overrides */
        .white-theme h3 {
            color: #111827;
            border-bottom-color: #e5e7eb;
        }
        
        .white-theme .item-name, 
        .white-theme .item-price,
        .white-theme .final-total {
            color: #1f2937;
        }
        
        .white-theme .item-qty,
        .white-theme .total-row,
        .white-theme .secure-notice {
            color: #4b5563;
        }
        
        .white-theme .order-totals {
             border-top-color: #e5e7eb;
        }
        
        .white-theme .final-total {
             border-top-color: #e5e7eb;
        }
        
        /* Glass Style for Summary */
        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-main);
        }

        .icon-primary {
            color: var(--color-primary);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.25rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        input {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            transition: all 0.3s ease;
        }

        input:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }

        .mt-6 { margin-top: 2.5rem; }

        .payment-options {
            display: grid;
            gap: 1rem;
        }

        .payment-option {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .payment-option.active {
            border-color: var(--color-primary);
            background: rgba(6, 182, 212, 0.05);
        }

        .payment-option input {
            display: none;
        }

        .radio-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid var(--text-muted);
            position: relative;
        }

        .payment-option.active .radio-dot {
            border-color: var(--color-primary);
        }

        .payment-option.active .radio-dot::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            background: var(--color-primary);
            border-radius: 50%;
        }

        .order-summary-section {
            position: sticky;
            top: 8rem;
            height: max-content;
        }

        .order-card h3 {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .order-items {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 1.5rem;
            padding-right: 0.5rem;
        }

        /* Custom Scrollbar */
        .order-items::-webkit-scrollbar {
            width: 6px;
        }
        .order-items::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.1);
            border-radius: 3px;
        }

        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .item-info {
            display: flex;
            flex-direction: column;
        }

        .item-name {
            font-weight: 500;
            color: var(--text-main);
        }

        .item-qty {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }

        .item-price {
            font-weight: 600;
            color: var(--text-main);
        }

        .order-totals {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            color: var(--text-muted);
        }

        .final-total {
            color: var(--text-main);
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .place-order-btn {
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
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        @media (max-width: 968px) {
            .checkout-grid {
                grid-template-columns: 1fr;
            }
            .order-summary-section {
                position: static;
                order: -1; /* Show summary first on mobile */
            }
        }
      `}</style>
        </div>
    );
};

export default Checkout;
