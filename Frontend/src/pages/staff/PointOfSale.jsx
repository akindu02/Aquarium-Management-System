import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, Trash2, Banknote,
    Package, User, Mail, Phone, MapPin, AlertCircle, Loader,
    ChevronRight, Fish
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getProductsAPI, createPosOrderAPI } from '../../utils/api';
import POSReceipt from '../../components/POSReceipt';

const IMG_BASE = 'http://localhost:5001';

const PointOfSale = () => {
    // ── Active tab ────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('products');

    // ── Product state ─────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productError, setProductError] = useState(null);
    const [saleCount, setSaleCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // ── Customer ──────────────────────────────────────────────────────────────
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });

    // ── Cart ──────────────────────────────────────────────────────────────────
    const [cart, setCart] = useState([]);

    // ── Payment ───────────────────────────────────────────────────────────────
    const [cashGiven, setCashGiven] = useState('');
    const [discount, setDiscount] = useState('');
    const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'fixed'
    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    // ── Fetch real products ───────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            setIsLoadingProducts(true);
            setProductError(null);
            const res = await getProductsAPI();
            const raw = Array.isArray(res.data) ? res.data : (res.products || []);
            setProducts(
                raw
                    .filter(p => p.stock_quantity > 0)
                    .map(p => ({
                        id: p.product_id,
                        name: p.name,
                        category: p.category,
                        stock: p.stock_quantity,
                        imageUrl: p.image_url ? `${IMG_BASE}${p.image_url}` : null,
                        originalPrice: parseFloat(p.price),
                        discount: parseFloat(p.discount_percent || 0),
                        price: parseFloat(
                            (p.price - (p.price * (p.discount_percent || 0)) / 100).toFixed(2)
                        ),
                    }))
            );
        } catch {
            setProductError('Failed to load products. Please retry.');
        } finally {
            setIsLoadingProducts(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts, saleCount]);

    // ── Filter / categories ───────────────────────────────────────────────────
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchSearch && matchCat;
    });

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discountValue = parseFloat(discount) || 0;
    const discountAmount = discountType === 'fixed'
        ? Math.min(discountValue, subtotal)
        : subtotal * (Math.min(discountValue, 100) / 100);
    const total = Math.max(0, subtotal - discountAmount);
    const cashAmount = parseFloat(cashGiven) || 0;
    const balance = cashAmount - total;
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    // ── Cart actions ──────────────────────────────────────────────────────────
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) {
                    Swal.fire({
                        icon: 'warning', title: 'Stock Limit',
                        text: `Only ${product.stock} units available for "${product.name}".`,
                        background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4',
                    });
                    return prev;
                }
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const updateQty = (id, change) => {
        setCart(prev => {
            const product = products.find(p => p.id === id);
            return prev.map(item => {
                if (item.id !== id) return item;
                const newQty = item.qty + change;
                if (newQty <= 0) return item;
                if (product && newQty > product.stock) {
                    Swal.fire({
                        icon: 'warning', title: 'Stock Limit',
                        text: `Only ${product.stock} units in stock.`,
                        background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4',
                    });
                    return item;
                }
                return { ...item, qty: newQty };
            });
        });
    };

    // ── Checkout ──────────────────────────────────────────────────────────────
    const handleCheckout = async () => {
        if (cart.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Empty Cart', text: 'Please add products first.', background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4' });
            return;
        }
        if (!customer.name.trim()) {
            Swal.fire({
                icon: 'warning', title: 'Customer Required',
                text: "Please fill in the customer name in the Customer tab.",
                background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4',
            }).then(() => setActiveTab('customer'));
            return;
        }
        if (!cashGiven || isNaN(cashAmount) || cashAmount < total) {
            Swal.fire({
                icon: 'warning', title: 'Cash Amount Required',
                text: `Please enter cash received. Minimum: LKR ${total.toLocaleString()}.`,
                background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4',
            });
            return;
        }
        try {
            setIsProcessing(true);
            const result = await createPosOrderAPI({
                customer: {
                    name: customer.name.trim(),
                    phone: customer.phone.trim() || null,
                    email: customer.email.trim() || null,
                    address: customer.address.trim() || null,
                },
                items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
                discount: discountValue,
                discountType,
            });
            if (result.success) {
                setReceiptData({
                    orderRef: result.orderRef,
                    receiptNumber: result.receiptNumber,
                    subtotalAmount: result.subtotalAmount,
                    discountAmount: result.discountAmount,
                    totalAmount: result.totalAmount,
                    customer: { ...customer },
                    items: cart.map(i => ({ ...i })),
                    saleDate: new Date(),
                    cashGiven: cashAmount,
                });
                setShowReceiptModal(true);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Sale Failed',
                text: err.message || 'Could not complete the sale.',
                background: '#1a1f2e', color: '#f1f5f9', confirmButtonColor: '#06b6d4',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // ── New sale reset ────────────────────────────────────────────────────────
    const handleNewSale = () => {
        setShowReceiptModal(false);
        setCart([]);
        setCustomer({ name: '', phone: '', email: '', address: '' });
        setReceiptData(null);
        setCashGiven('');
        setDiscount('');
        setDiscountType('percent');
        setSaleCount(c => c + 1);
        setActiveTab('products');
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="qpos-root">

            {/* ── TOP HEADER / NAV BAR ── */}
            <div className="qpos-header">
                <div className="qpos-brand">
                    <span className="qpos-brand-name">Methu Aquarium POS System</span>
                </div>

                <nav className="qpos-nav">
                    <button
                        className={`qpos-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customer')}
                    >
                        <User size={16} />
                        Customer
                        {customer.name && <span className="qpos-badge-dot" />}
                    </button>
                    <button
                        className={`qpos-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <ShoppingCart size={16} />
                        Products
                        {cartCount > 0 && <span className="qpos-count-badge">{cartCount}</span>}
                    </button>
                    <button
                        className={`qpos-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <Banknote size={16} />
                        Payment
                    </button>
                </nav>
            </div>

            {/* ── TAB CONTENT ── */}
            <div className="qpos-body">

                {/* ════════ CUSTOMER TAB ════════ */}
                {activeTab === 'customer' && (
                    <div className="qpos-customer-page">
                        <div className="qpos-page-title">
                            <h2>Customer Details</h2>
                            <p>Enter the customer&apos;s information for this sale.</p>
                        </div>
                        <div className="qpos-customer-card">
                            <p className="qpos-field-note">* Name is required. All other fields are optional.</p>
                            <div className="qpos-form-grid">
                                <div className="qpos-form-group">
                                    <label>Customer Name <span className="req"></span></label>
                                    <div className="qpos-input-wrap">
                                        <User size={16} className="qpos-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={customer.name}
                                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="qpos-form-group">
                                    <label>Phone Number</label>
                                    <div className="qpos-input-wrap">
                                        <Phone size={16} className="qpos-input-icon" />
                                        <input
                                            type="tel"
                                            placeholder="07x xxx xxxx"
                                            value={customer.phone}
                                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="qpos-form-group">
                                    <label>Email Address</label>
                                    <div className="qpos-input-wrap">
                                        <Mail size={16} className="qpos-input-icon" />
                                        <input
                                            type="email"
                                            placeholder="customer@email.com"
                                            value={customer.email}
                                            onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="qpos-form-group">
                                    <label>Address</label>
                                    <div className="qpos-input-wrap">
                                        <MapPin size={16} className="qpos-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Home / Office address"
                                            value={customer.address}
                                            onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="qpos-customer-actions">
                                <button
                                    className="qpos-proceed-btn"
                                    disabled={!customer.name.trim()}
                                    onClick={() => setActiveTab('products')}
                                >
                                    Proceed to Products <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════ PRODUCTS TAB ════════ */}
                {activeTab === 'products' && (
                    <div className="qpos-products-page">
                        <div className="qpos-page-title">
                            <h2>Products</h2>
                            <p>Tap the + icon to add items to the cart</p>
                        </div>

                        <div className="qpos-search-row">
                            <div className="qpos-search-box">
                                <Search size={17} className="qpos-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="qpos-cats">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`qpos-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="qpos-product-list">
                            {isLoadingProducts ? (
                                <div className="qpos-state-box">
                                    <Loader size={32} className="spin" />
                                    <p>Loading products&hellip;</p>
                                </div>
                            ) : productError ? (
                                <div className="qpos-state-box error">
                                    <AlertCircle size={32} />
                                    <p>{productError}</p>
                                    <button className="qpos-retry-btn" onClick={fetchProducts}>Retry</button>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="qpos-state-box">
                                    <Package size={32} />
                                    <p>No products found</p>
                                </div>
                            ) : (
                                filteredProducts.map(product => {
                                    const inCart = cart.find(i => i.id === product.id);
                                    return (
                                        <div key={product.id} className="qpos-product-card">
                                            <div className="qpos-product-thumb">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} />
                                                ) : (
                                                    <div className="qpos-thumb-placeholder">
                                                        <Fish size={20} color="#94a3b8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="qpos-product-info">
                                                <div className="qpos-product-name">
                                                    {product.name}
                                                    {product.discount > 0 && (
                                                        <span className="qpos-disc-badge">-{product.discount}%</span>
                                                    )}
                                                </div>
                                                <div className="qpos-product-meta">
                                                    <span className="qpos-product-cat">{product.category}</span>
                                                    <span className={`qpos-product-stock ${product.stock <= 10 ? 'low' : ''}`}>
                                                        {product.stock} in stock
                                                    </span>
                                                </div>
                                                <div className="qpos-product-price">
                                                    LKR {product.price.toLocaleString()}
                                                    {product.discount > 0 && (
                                                        <span className="qpos-orig-price">LKR {product.originalPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="qpos-product-action">
                                                {inCart ? (
                                                    <div className="qpos-qty-control">
                                                        <button className="qpos-qty-btn" onClick={() => updateQty(product.id, -1)}><Minus size={13} /></button>
                                                        <span className="qpos-qty-val">{inCart.qty}</span>
                                                        <button className="qpos-qty-btn" onClick={() => updateQty(product.id, 1)}><Plus size={13} /></button>
                                                    </div>
                                                ) : (
                                                    <button className="qpos-add-btn" onClick={() => addToCart(product)}>
                                                        <Plus size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ════════ PAYMENT TAB ════════ */}
                {activeTab === 'payment' && (
                    <div className="qpos-payment-page">

                        {/* LEFT: Order Summary */}
                        <div className="qpos-order-col">
                            <h2 className="qpos-order-title">Order Summary</h2>
                            <div className="qpos-order-card">
                                {cart.length === 0 ? (
                                    <div className="qpos-empty-cart">
                                        <div className="qpos-empty-icon"><Trash2 size={28} color="#94a3b8" /></div>
                                        <p className="qpos-empty-title">Your cart is empty</p>
                                        <p className="qpos-empty-sub">Add items from the Products tab to get started.</p>
                                        <button className="qpos-goto-btn" onClick={() => setActiveTab('products')}>
                                            <ShoppingCart size={14} /> Go to Products
                                        </button>
                                    </div>
                                ) : (
                                    <div className="qpos-cart-list">
                                        <div className="qpos-cart-hd">
                                            <span>Item</span><span>Qty</span><span>Amount</span><span></span>
                                        </div>
                                        {cart.map(item => (
                                            <div key={item.id} className="qpos-cart-row">
                                                <div className="qpos-cart-iname">
                                                    <span className="qpos-cname">{item.name}</span>
                                                    <span className="qpos-cunit">LKR {item.price.toLocaleString()} / unit</span>
                                                </div>
                                                <div className="qpos-mini-qty">
                                                    <button onClick={() => updateQty(item.id, -1)}><Minus size={11} /></button>
                                                    <span>{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)}><Plus size={11} /></button>
                                                </div>
                                                <div className="qpos-line-total">LKR {(item.price * item.qty).toLocaleString()}</div>
                                                <button className="qpos-cart-rm" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Checkout Sidebar */}
                        <div className="qpos-checkout-col">

                            {/* Customer preview */}
                            <div className="qpos-scard">
                                <div className="qpos-scard-hd"><User size={15} /><span>Customer Details</span></div>
                                {customer.name ? (
                                    <div className="qpos-cust-preview">
                                        <div className="qpos-cust-avatar">{customer.name.charAt(0).toUpperCase()}</div>
                                        <div className="qpos-cust-details">
                                            <span className="qpos-cust-name">{customer.name}</span>
                                            {customer.phone && <span className="qpos-cust-sub">{customer.phone}</span>}
                                            {customer.email && <span className="qpos-cust-sub">{customer.email}</span>}
                                        </div>
                                        <button className="qpos-cust-edit-btn" onClick={() => setActiveTab('customer')}>Edit</button>
                                    </div>
                                ) : (
                                    <p className="qpos-cust-empty">
                                        No details provided.{' '}
                                        <span className="qpos-cust-link" onClick={() => setActiveTab('customer')}>
                                            Go to Customer tab to add info.
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="qpos-scard">
                                <div className="qpos-totals-row"><span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span></div>

                                {/* Discount row */}
                                <div className="qpos-discount-row">
                                    <span className="qpos-discount-label">Discount</span>
                                    <div className="qpos-discount-control">
                                        {/* Type toggle */}
                                        <div className="qpos-disc-type-toggle">
                                            <button
                                                className={`qpos-disc-type-btn ${discountType === 'percent' ? 'active' : ''}`}
                                                onClick={() => { setDiscountType('percent'); setDiscount(''); }}
                                                title="Percentage discount"
                                            >%</button>
                                            <button
                                                className={`qpos-disc-type-btn ${discountType === 'fixed' ? 'active' : ''}`}
                                                onClick={() => { setDiscountType('fixed'); setDiscount(''); }}
                                                title="Fixed amount discount"
                                            >LKR</button>
                                        </div>
                                        {/* Value input */}
                                        <div className="qpos-disc-input-wrap">
                                            <span className="qpos-disc-prefix">
                                                {discountType === 'percent' ? '%' : 'Rs.'}
                                            </span>
                                            <input
                                                type="number"
                                                className="qpos-disc-input"
                                                min="0"
                                                max={discountType === 'percent' ? 100 : subtotal}
                                                step="0.01"
                                                value={discount}
                                                onChange={e => setDiscount(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Discount applied summary */}
                                {discountAmount > 0 && (
                                    <div className="qpos-disc-applied">
                                        <span>
                                            {discountType === 'percent'
                                                ? `${Math.min(discountValue, 100)}% off`
                                                : 'Fixed discount'}
                                        </span>
                                        <span className="qpos-disc-saving">− LKR {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                <div className="qpos-totals-sep" />
                                <div className="qpos-totals-row grand"><span>Total Balance</span><span>LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                            </div>

                            {/* Cash input */}
                            <div className="qpos-scard">
                                <div className="qpos-scard-hd"><Banknote size={15} /><span>Cash Payment</span></div>
                                <label className="qpos-cash-label">Cash Received (LKR)</label>
                                <input
                                    type="number"
                                    className="qpos-cash-input"
                                    min={total}
                                    step="0.01"
                                    value={cashGiven}
                                    onChange={e => setCashGiven(e.target.value)}
                                    placeholder={`Min. LKR ${total.toLocaleString()}`}
                                />
                                {cashGiven && cashAmount >= total && (
                                    <div className="qpos-balance-row ok">
                                        <span>Balance / Change</span>
                                        <span className="qpos-balance-val">LKR {balance.toLocaleString()}</span>
                                    </div>
                                )}
                                {cashGiven && cashAmount > 0 && cashAmount < total && (
                                    <div className="qpos-balance-row err">
                                        <span>Short by</span>
                                        <span className="qpos-short-val">LKR {(total - cashAmount).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Complete Order */}
                            <button
                                className="qpos-complete-btn"
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCheckout}
                            >
                                {isProcessing
                                    ? <><Loader size={17} className="spin" /> Processing&hellip;</>
                                    : 'Complete Order'
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── POS Receipt ── */}
            {showReceiptModal && receiptData && (
                <POSReceipt
                    orderData={{
                        orderRef: receiptData.orderRef,
                        orderId: receiptData.receiptNumber,
                        customer: {
                            name: receiptData.customer.name,
                            email: receiptData.customer.email || '',
                            phone: receiptData.customer.phone || '',
                            address: receiptData.customer.address || '',
                        },
                        cartItems: receiptData.items.map(i => ({
                            name: i.name, price: i.price, quantity: i.qty,
                        })),
                        subtotalAmount: receiptData.subtotalAmount,
                        discountAmount: receiptData.discountAmount,
                        totalAmount: receiptData.totalAmount,
                        cashGiven: receiptData.cashGiven,
                        paymentDate: receiptData.saleDate,
                    }}
                    onClose={handleNewSale}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; display: inline-block; }

                /* ── ROOT ────────────────────────────────────────── */
                .qpos-root {
                    display: flex; flex-direction: column;
                    height: calc(100vh - 80px);
                    background: #0d1117;
                    border-radius: 1.25rem;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.40);
                }

                /* ── HEADER ──────────────────────────────────────── */
                .qpos-header {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #1a1f2e; border-bottom: 1px solid rgba(255,255,255,0.08);
                    padding: 0 1.75rem; height: 66px; flex-shrink: 0;
                }
                .qpos-brand { display: flex; align-items: center; }
                .qpos-brand-name {
                    font-size: 1.05rem; font-weight: 700; color: #f1f5f9;
                    letter-spacing: 0.2px; white-space: nowrap;
                }

                .qpos-nav { display: flex; gap: 0.4rem; }
                .qpos-tab-btn {
                    display: flex; align-items: center; gap: 0.4rem;
                    padding: 0.45rem 1rem; border: none; border-radius: 2rem;
                    font-size: 0.86rem; font-weight: 500; cursor: pointer;
                    transition: all 0.16s; background: transparent; color: #94a3b8;
                    position: relative;
                }
                .qpos-tab-btn:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }
                .qpos-tab-btn.active { background: #06b6d4; color: #fff; font-weight: 600; }
                .qpos-badge-dot {
                    width: 7px; height: 7px; background: #06b6d4; border-radius: 50%;
                    display: inline-block; margin-left: 1px;
                }
                .qpos-count-badge {
                    background: #06b6d4; color: #fff; font-size: 0.66rem; font-weight: 700;
                    min-width: 17px; height: 17px; border-radius: 9px; padding: 0 4px;
                    display: inline-flex; align-items: center; justify-content: center; margin-left: 1px;
                }

                /* ── BODY ────────────────────────────────────────── */
                .qpos-body { flex: 1; overflow: hidden; }

                /* ── PAGE TITLE ──────────────────────────────────── */
                .qpos-page-title { margin-bottom: 1.1rem; flex-shrink: 0; }
                .qpos-page-title h2 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #f1f5f9; }
                .qpos-page-title p  { margin: 3px 0 0; font-size: 0.82rem; color: #64748b; }

                /* ════════ CUSTOMER PAGE ═══════════════════════════ */
                .qpos-customer-page {
                    padding: 1.5rem 1.75rem; height: 100%; box-sizing: border-box; overflow-y: auto;
                }
                .qpos-customer-card {
                    background: transparent; border-radius: 0; border: none;
                    padding: 0; width: 100%;
                }
                .qpos-field-note {
                    font-size: 0.78rem; color: #10b981;
                    margin: 0 0 1.25rem; padding: 0;
                }
                .qpos-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
                .qpos-form-group label {
                    display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8;
                    margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.4px;
                }
                .req { color: #ef4444; }
                .qpos-input-wrap {
                    display: flex; align-items: center; gap: 0.6rem;
                    background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08);
                    border-radius: 0.55rem; padding: 0.75rem 1rem; transition: border-color 0.14s;
                }
                .qpos-input-wrap:focus-within { border-color: #06b6d4; background: rgba(6,182,212,0.06); }
                .qpos-input-icon { color: #64748b; flex-shrink: 0; }
                .qpos-input-wrap input {
                    background: transparent; border: none; outline: none;
                    color: #f1f5f9; width: 100%; font-size: 0.95rem;
                }
                .qpos-input-wrap input::placeholder { color: #475569; }
                .qpos-customer-actions { margin-top: 1.25rem; display: flex; justify-content: flex-end; }
                .qpos-proceed-btn {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: #06b6d4; color: #fff; border: none;
                    border-radius: 0.6rem; padding: 0.65rem 1.3rem;
                    font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: filter 0.14s;
                }
                .qpos-proceed-btn:disabled { background: #06b6d4; opacity: 0.45; cursor: not-allowed; }
                .qpos-proceed-btn:hover:not(:disabled) { filter: brightness(1.1); }

                /* ════════ PRODUCTS PAGE ═══════════════════════════ */
                .qpos-products-page {
                    display: flex; flex-direction: column;
                    padding: 1.5rem 1.75rem; height: 100%; box-sizing: border-box; overflow: hidden;
                }
                .qpos-search-row {
                    display: flex; align-items: center; gap: 0.85rem;
                    margin-bottom: 1rem; flex-shrink: 0; flex-wrap: wrap;
                }
                .qpos-search-box {
                    display: flex; align-items: center; gap: 0.55rem;
                    background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 0.6rem;
                    padding: 0.55rem 0.9rem; min-width: 240px; flex: 1; max-width: 360px;
                    transition: border-color 0.14s;
                }
                .qpos-search-box:focus-within { border-color: #06b6d4; }
                .qpos-search-icon { color: #64748b; flex-shrink: 0; }
                .qpos-search-box input {
                    background: transparent; border: none; outline: none;
                    color: #f1f5f9; width: 100%; font-size: 0.88rem;
                }
                .qpos-search-box input::placeholder { color: #475569; }
                .qpos-cats { display: flex; gap: 0.4rem; flex-wrap: wrap; }
                .qpos-cat-pill {
                    padding: 0.38rem 0.85rem; border-radius: 2rem; border: 1.5px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.78rem; font-weight: 500;
                    cursor: pointer; transition: all 0.14s; white-space: nowrap;
                }
                .qpos-cat-pill:hover { background: rgba(255,255,255,0.09); color: #f1f5f9; }
                .qpos-cat-pill.active { background: #06b6d4; color: #fff; border-color: #06b6d4; }

                .qpos-product-list {
                    flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.55rem;
                    padding-right: 0.2rem;
                }
                .qpos-state-box {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 0.65rem; color: #94a3b8; padding: 2.5rem; text-align: center;
                }
                .qpos-state-box p { margin: 0; font-size: 0.88rem; }
                .qpos-state-box.error { color: #ef4444; }
                .qpos-retry-btn {
                    padding: 0.4rem 1rem; border-radius: 0.5rem;
                    background: #06b6d4; color: #fff; border: none; cursor: pointer; font-size: 0.82rem;
                }
                .qpos-product-card {
                    display: flex; align-items: center; gap: 0.9rem;
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem;
                    padding: 0.75rem 1rem; transition: box-shadow 0.14s, border-color 0.14s, background 0.14s;
                }
                .qpos-product-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.30); border-color: #06b6d4; background: rgba(255,255,255,0.07); }
                .qpos-product-thumb {
                    width: 54px; height: 54px; border-radius: 0.55rem; overflow: hidden;
                    flex-shrink: 0; background: rgba(255,255,255,0.06);
                    display: flex; align-items: center; justify-content: center;
                }
                .qpos-product-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .qpos-thumb-placeholder {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);
                }
                .qpos-product-info { flex: 1; min-width: 0; }
                .qpos-product-name {
                    font-size: 0.93rem; font-weight: 600; color: #f1f5f9;
                    display: flex; align-items: center; gap: 0.4rem;
                }
                .qpos-disc-badge {
                    font-size: 0.65rem; background: #dcfce7; color: #16a34a;
                    padding: 1px 5px; border-radius: 4px; font-weight: 700;
                }
                .qpos-product-meta { display: flex; align-items: center; gap: 0.6rem; margin-top: 3px; }
                .qpos-product-cat {
                    font-size: 0.7rem; color: #94a3b8; background: rgba(255,255,255,0.07);
                    padding: 1px 7px; border-radius: 8px;
                }
                .qpos-product-stock { font-size: 0.7rem; color: #10b981; font-weight: 500; }
                .qpos-product-stock.low { color: #f59e0b; }
                .qpos-product-price {
                    font-size: 0.93rem; font-weight: 700; color: #06b6d4; margin-top: 3px;
                    display: flex; align-items: center; gap: 0.35rem;
                }
                .qpos-orig-price { font-size: 0.73rem; text-decoration: line-through; color: #94a3b8; font-weight: 400; }
                .qpos-product-action { flex-shrink: 0; }
                .qpos-add-btn {
                    width: 34px; height: 34px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #94a3b8;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.14s;
                }
                .qpos-product-card:hover .qpos-add-btn { border-color: #06b6d4; color: #06b6d4; background: rgba(6,182,212,0.12); }
                .qpos-qty-control {
                    display: flex; align-items: center; gap: 0.35rem;
                    background: rgba(255,255,255,0.06); border-radius: 2rem; padding: 3px 5px;
                    border: 1.5px solid rgba(255,255,255,0.10);
                }
                .qpos-qty-btn {
                    width: 22px; height: 22px; border-radius: 50%;
                    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.12s; color: #94a3b8;
                }
                .qpos-qty-btn:hover { background: #06b6d4; color: #fff; border-color: #06b6d4; }
                .qpos-qty-val { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; min-width: 18px; text-align: center; }

                /* ════════ PAYMENT PAGE ═══════════════════════════ */
                .qpos-payment-page {
                    display: flex; gap: 1.25rem;
                    padding: 1.5rem 1.75rem; height: 100%; box-sizing: border-box; overflow: hidden;
                }
                .qpos-order-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .qpos-order-title { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.85rem; }
                .qpos-order-card {
                    flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 1rem; overflow-y: auto;
                }
                .qpos-empty-cart {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; gap: 0.4rem; padding: 2rem; text-align: center;
                }
                .qpos-empty-icon {
                    width: 60px; height: 60px; border: 2px dashed rgba(255,255,255,0.15); border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
                }
                .qpos-empty-title { font-weight: 600; color: #f1f5f9; font-size: 0.92rem; margin: 0; }
                .qpos-empty-sub { font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0; }
                .qpos-goto-btn {
                    display: flex; align-items: center; gap: 0.35rem; margin-top: 0.75rem;
                    padding: 0.45rem 1rem; background: #06b6d4; color: #fff;
                    border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; font-weight: 600;
                }
                .qpos-cart-list { padding: 0.4rem; }
                .qpos-cart-hd {
                    display: grid; grid-template-columns: 1fr auto auto auto;
                    gap: 0.6rem; padding: 0.4rem 0.65rem;
                    font-size: 0.7rem; font-weight: 700; color: #64748b;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 0.15rem;
                }
                .qpos-cart-row {
                    display: grid; grid-template-columns: 1fr auto auto auto;
                    gap: 0.6rem; align-items: center; padding: 0.65rem;
                    border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s;
                }
                .qpos-cart-row:hover { background: rgba(255,255,255,0.04); border-radius: 0.5rem; }
                .qpos-cart-iname { display: flex; flex-direction: column; gap: 1px; }
                .qpos-cname { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; }
                .qpos-cunit { font-size: 0.72rem; color: #94a3b8; }
                .qpos-mini-qty {
                    display: flex; align-items: center; gap: 0.3rem;
                    background: rgba(255,255,255,0.06); border-radius: 1rem; padding: 2px 4px;
                }
                .qpos-mini-qty button {
                    width: 19px; height: 19px; border-radius: 50%;
                    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #94a3b8;
                }
                .qpos-mini-qty span { font-size: 0.8rem; font-weight: 700; color: #f1f5f9; min-width: 16px; text-align: center; }
                .qpos-line-total { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; white-space: nowrap; }
                .qpos-cart-rm {
                    background: transparent; border: none; color: #ef4444;
                    cursor: pointer; display: flex; padding: 3px; border-radius: 4px;
                }
                .qpos-cart-rm:hover { background: rgba(239,68,68,0.15); }

                /* Checkout sidebar */
                .qpos-checkout-col {
                    width: 300px; flex-shrink: 0;
                    display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto;
                }
                .qpos-scard {
                    background: #1a1f2e; border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 0.9rem; padding: 0.9rem 1rem;
                }
                .qpos-scard-hd {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.85rem; font-weight: 600; color: #f1f5f9;
                    margin-bottom: 0.65rem;
                }
                .qpos-cust-preview { display: flex; align-items: center; gap: 0.65rem; }
                .qpos-cust-avatar {
                    width: 34px; height: 34px; border-radius: 50%;
                    background: linear-gradient(135deg, #06b6d4, #3b82f6);
                    color: #fff; font-weight: 700; font-size: 0.95rem;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .qpos-cust-details { flex: 1; min-width: 0; }
                .qpos-cust-name { display: block; font-size: 0.85rem; font-weight: 600; color: #f1f5f9; }
                .qpos-cust-sub  { display: block; font-size: 0.72rem; color: #94a3b8; }
                .qpos-cust-edit-btn {
                    font-size: 0.72rem; color: #06b6d4; background: rgba(6,182,212,0.10);
                    border: 1px solid rgba(6,182,212,0.25); border-radius: 0.35rem;
                    padding: 2px 7px; cursor: pointer; font-weight: 600;
                }
                .qpos-cust-empty { font-size: 0.8rem; color: #94a3b8; margin: 0; }
                .qpos-cust-link { color: #06b6d4; cursor: pointer; font-weight: 500; }
                .qpos-cust-link:hover { text-decoration: underline; }

                .qpos-totals-row {
                    display: flex; justify-content: space-between; align-items: center;
                    font-size: 0.85rem; color: #94a3b8; padding: 1px 0;
                }
                .qpos-totals-row.grand { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin-top: 1px; }
                .qpos-totals-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 0.5rem 0; }
                
                /* ── Discount row ── */
                .qpos-discount-row {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-top: 0.6rem; gap: 0.5rem;
                }
                .qpos-discount-label {
                    font-size: 0.85rem; color: #94a3b8; flex-shrink: 0;
                }
                .qpos-discount-control {
                    display: flex; align-items: center; gap: 0.45rem;
                }
                .qpos-disc-type-toggle {
                    display: flex;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.4rem;
                    padding: 2px;
                    gap: 2px;
                }
                .qpos-disc-type-btn {
                    padding: 3px 9px;
                    border-radius: 0.3rem;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                    white-space: nowrap;
                }
                .qpos-disc-type-btn.active {
                    background: #06b6d4;
                    color: #fff;
                }
                .qpos-disc-input-wrap {
                    display: flex; align-items: center; gap: 0;
                    background: rgba(255,255,255,0.05);
                    border: 1.5px solid rgba(255,255,255,0.1);
                    border-radius: 0.4rem;
                    overflow: hidden;
                    transition: border-color 0.14s;
                }
                .qpos-disc-input-wrap:focus-within { border-color: #06b6d4; }
                .qpos-disc-prefix {
                    padding: 4px 7px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #06b6d4;
                    background: rgba(6,182,212,0.08);
                    border-right: 1px solid rgba(255,255,255,0.08);
                    white-space: nowrap;
                    line-height: 1.6;
                }
                .qpos-disc-input {
                    width: 72px;
                    padding: 4px 8px;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #f1f5f9;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-align: right;
                }
                .qpos-disc-input[type=number]::-webkit-inner-spin-button,
                .qpos-disc-input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
                .qpos-disc-input[type=number] { -moz-appearance: textfield; }

                /* Discount applied badge */
                .qpos-disc-applied {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-top: 0.35rem;
                    padding: 0.35rem 0.6rem;
                    background: rgba(16,185,129,0.08);
                    border: 1px solid rgba(16,185,129,0.2);
                    border-radius: 0.4rem;
                    font-size: 0.75rem;
                    color: #94a3b8;
                }
                .qpos-disc-saving {
                    color: #10b981;
                    font-weight: 700;
                }

                .qpos-cash-label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem; }
                .qpos-cash-input {
                    width: 100%; box-sizing: border-box;
                    padding: 0.58rem 0.8rem;
                    background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.10);
                    border-radius: 0.55rem; color: #f1f5f9;
                    font-size: 0.98rem; font-weight: 600; outline: none;
                }
                .qpos-cash-input:focus { border-color: #06b6d4; background: rgba(6,182,212,0.06); }
                .qpos-cash-input::placeholder { color: #475569; font-weight: 400; }
                .qpos-balance-row {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0.35rem 0.5rem; border-radius: 0.4rem; margin-top: 0.4rem;
                }
                .qpos-balance-row.ok  { background: rgba(16,185,129,0.10); }
                .qpos-balance-row.err { background: rgba(239,68,68,0.10); }
                .qpos-balance-val { font-size: 0.9rem; font-weight: 700; color: #10b981; }
                .qpos-short-val   { font-size: 0.9rem; font-weight: 700; color: #ef4444; }
                .qpos-balance-row span:first-child { font-size: 0.75rem; color: #94a3b8; }

                .qpos-complete-btn {
                    width: 100%; padding: 0.9rem;
                    background: #06b6d4; color: #fff; border: none;
                    border-radius: 0.75rem; font-size: 0.97rem; font-weight: 700;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    cursor: pointer; transition: background 0.16s; flex-shrink: 0;
                }
                .qpos-complete-btn:hover:not(:disabled) { background: #0891b2; }
                .qpos-complete-btn:disabled { background: rgba(255,255,255,0.10); cursor: not-allowed; color: #64748b; }
            `}</style>
        </div>
    );
};

export default PointOfSale;
