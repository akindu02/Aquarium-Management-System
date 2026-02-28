import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, Trash2, Banknote, RotateCcw,
    Package, User, Mail, Phone, MapPin, AlertCircle, Loader
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getProductsAPI, createPosOrderAPI } from '../../utils/api';
import OrderReceipt from '../../components/OrderReceipt';

const PointOfSale = () => {
    // ── Product state ─────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productError, setProductError] = useState(null);
    const [saleCount, setSaleCount] = useState(0);

    // ── Cart / UI state ───────────────────────────────────────────────────────
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // ── Customer form state ───────────────────────────────────────────────────
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });

    // ── Checkout / receipt state ──────────────────────────────────────────────
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
                        originalPrice: parseFloat(p.price),
                        discount: parseFloat(p.discount_percent || 0),
                        price: parseFloat(
                            (p.price - (p.price * (p.discount_percent || 0)) / 100).toFixed(2)
                        ),
                    }))
            );
        } catch (err) {
            setProductError('Failed to load products. Please retry.');
        } finally {
            setIsLoadingProducts(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts, saleCount]);

    // ── Filter / categories ───────────────────────────────────────────────────
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchSearch && matchCat;
    });
    const categories = ['All', ...new Set(products.map(p => p.category))];

    // ── Cart actions ──────────────────────────────────────────────────────────
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) {
                    Swal.fire({
                        icon: 'warning', title: 'Stock Limit',
                        text: `Only ${product.stock} units available for "${product.name}".`,
                        background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4',
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
                        background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4',
                    });
                    return item;
                }
                return { ...item, qty: newQty };
            });
        });
    };

    const clearCart = () => setCart([]);

    // ── Totals ────────────────────────────────────────────────────────────────
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = subtotal;

    // ── Checkout ──────────────────────────────────────────────────────────────
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!customer.name.trim()) {
            Swal.fire({
                icon: 'warning', title: 'Customer Required',
                text: "Please add the customer's name before completing the sale.",
                background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4',
            }).then(() => setShowCustomerModal(true));
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
            });
            if (result.success) {
                setReceiptData({
                    orderRef: result.orderRef,
                    receiptNumber: result.receiptNumber,
                    totalAmount: result.totalAmount,
                    customer: { ...customer },
                    items: cart.map(i => ({ ...i })),
                    saleDate: new Date(),
                });
                setShowReceiptModal(true);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Sale Failed',
                text: err.message || 'Could not complete the sale. Please try again.',
                background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4',
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
        setSaleCount(c => c + 1);
    };

    return (
        <div className="pos-container">
            {/* ─── Left: Product Catalogue ─────────────────────────────────── */}
            <div className="pos-catalog">
                <div className="pos-header">
                    <div className="search-bar">
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="product-list">
                    <div className="product-list-header">
                        <span>Product Name</span>
                        <span>Category</span>
                        <span>Stock</span>
                        <span>Price</span>
                        <span>Action</span>
                    </div>

                    {isLoadingProducts ? (
                        <div className="empty-catalog">
                            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Loading products...</p>
                        </div>
                    ) : productError ? (
                        <div className="empty-catalog" style={{ color: '#ef4444' }}>
                            <AlertCircle size={32} />
                            <p>{productError}</p>
                            <button className="cat-btn active" onClick={fetchProducts}>Retry</button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-catalog">
                            <Package size={32} />
                            <p>No products found</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} className="product-row" onClick={() => addToCart(product)}>
                                <div className="p-name">
                                    {product.name}
                                    {product.discount > 0 && (
                                        <span className="discount-tag">-{product.discount}%</span>
                                    )}
                                </div>
                                <div className="p-cat"><span className="category-pill">{product.category}</span></div>
                                <div className={`p-stock ${product.stock <= 10 ? 'low' : ''}`}>
                                    {product.stock} left
                                </div>
                                <div className="p-price">
                                    LKR {product.price.toLocaleString()}
                                    {product.discount > 0 && (
                                        <span className="original-price">LKR {product.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="p-action">
                                    <button className="add-btn-sm"><Plus size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ─── Right: Cart ─────────────────────────────────────────────── */}
            <div className="pos-cart">
                <div className="cart-header">
                    <h3>Current Order</h3>
                    <div className="cart-actions">
                        <button className="customer-trigger-btn" onClick={() => setShowCustomerModal(true)} title="Add Customer Details">
                            <User size={18} />
                            {customer.name && <span className="active-dot"></span>}
                        </button>
                        <button className="clear-btn" onClick={clearCart} disabled={cart.length === 0}>
                            <RotateCcw size={16} /> Clear
                        </button>
                    </div>
                </div>

                {customer.name && (
                    <div className="selected-customer-preview">
                        <div className="sc-info">
                            <span className="sc-name">{customer.name}</span>
                            <span className="sc-phone">{customer.phone || 'No phone'}</span>
                        </div>
                        <button className="sc-remove" onClick={() => setCustomer({ name: '', phone: '', email: '', address: '' })}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={48} />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p>LKR {item.price.toLocaleString()}</p>
                                </div>
                                <div className="item-controls">
                                    <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                                </div>
                                <div className="item-total">
                                    LKR {(item.price * item.qty).toLocaleString()}
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Amount</span>
                        <span>LKR {total.toLocaleString()}</span>
                    </div>
                    <div className="payment-method-tag">
                        <Banknote size={16} /> Cash Payment Only
                    </div>
                    <button
                        className="checkout-btn"
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? (
                            <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing&hellip;</>
                        ) : (
                            <><Banknote size={20} /> Complete Cash Sale</>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Customer Details Modal ───────────────────────────────────── */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="customer-modal">
                        <div className="modal-header">
                            <h3>Customer Details</h3>
                            <button className="close-modal-btn" onClick={() => setShowCustomerModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-note">
                                <AlertCircle size={14} /> Name is required. Phone, email &amp; address are optional.
                            </div>
                            <div className="customer-form">
                                <div className="form-group-full">
                                    <label>Customer Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div className="input-icon-wrapper">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={customer.name}
                                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-full">
                                    <label>Phone Number</label>
                                    <div className="input-icon-wrapper">
                                        <Phone size={18} />
                                        <input
                                            type="tel"
                                            placeholder="07xxxxxxxx"
                                            value={customer.phone}
                                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-full">
                                    <label>Email Address</label>
                                    <div className="input-icon-wrapper">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            placeholder="customer@example.com"
                                            value={customer.email}
                                            onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-full">
                                    <label>Address</label>
                                    <div className="input-icon-wrapper">
                                        <MapPin size={18} />
                                        <input
                                            type="text"
                                            placeholder="Home / Office Address"
                                            value={customer.address}
                                            onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                            <button
                                className="save-btn"
                                disabled={!customer.name.trim()}
                                onClick={() => setShowCustomerModal(false)}
                            >
                                Save Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Receipt Auto-Download ───────────────────────────────── */}
            {showReceiptModal && receiptData && (
                <OrderReceipt
                    orderData={{
                        orderRef: receiptData.orderRef,
                        orderId: receiptData.receiptNumber,
                        shippingData: {
                            name: receiptData.customer.name,
                            email: receiptData.customer.email || '',
                            phone: receiptData.customer.phone || '',
                            address: receiptData.customer.address || '',
                        },
                        cartItems: receiptData.items.map(i => ({
                            name: i.name,
                            price: i.price,
                            quantity: i.qty,
                        })),
                        currentTotal: receiptData.totalAmount,
                        cardType: 'Cash',
                        paymentDate: receiptData.saleDate,
                    }}
                    onClose={handleNewSale}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .pos-container {
                    display: flex; height: calc(100vh - 100px);
                    gap: 1.5rem;
                }

                .empty-catalog {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 1rem; color: var(--text-muted); padding: 3rem; opacity: 0.7;
                }
                .discount-tag { font-size: 0.7rem; background: rgba(16,185,129,0.15); color: #10b981; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 0.4rem; }
                .original-price { font-size: 0.75rem; text-decoration: line-through; color: var(--text-muted); font-weight: 400; }
                .payment-method-tag {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(16,185,129,0.1); color: #10b981; font-size: 0.85rem;
                    padding: 0.5rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem;
                    border: 1px solid rgba(16,185,129,0.2);
                }
                .form-note {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.8rem; color: var(--text-muted);
                    background: rgba(255,255,255,0.04); padding: 0.6rem 0.75rem;
                    border-radius: 0.4rem; margin-bottom: 1.25rem;
                }

                /* Customer Modal Styles */
                .customer-modal {
                    background: #1a1f2e;
                    width: 450px;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h3 { margin: 0; font-size: 1.25rem; color: white; }
                .close-modal-btn {
                    background: transparent; border: none; color: var(--text-muted);
                    font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;
                }
                .modal-body { padding: 1.5rem; }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex; justify-content: flex-end; gap: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                }

                .form-group-full { margin-bottom: 1.25rem; }
                .form-group-full label {
                    display: block; color: var(--text-muted); font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .input-icon-wrapper {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.75rem 1rem; border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .input-icon-wrapper:focus-within { border-color: var(--color-primary); background: rgba(255, 255, 255, 0.08); }
                .input-icon-wrapper input {
                    background: transparent; border: none; outline: none;
                    color: white; width: 100%; font-size: 1rem;
                }
                .input-icon-wrapper svg { color: var(--text-muted); }

                .save-btn {
                    background: var(--color-primary); color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
                    cursor: pointer;
                }
                .cancel-btn {
                    background: transparent; color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
                    cursor: pointer;
                }

                /* Cart Header Updates */
                .cart-actions { display: flex; gap: 0.75rem; align-items: center; }
                .customer-trigger-btn {
                    width: 36px; height: 36px; border-radius: 8px;
                    background: rgba(255, 255, 255, 0.1); color: white;
                    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    position: relative; transition: all 0.2s;
                }
                .customer-trigger-btn:hover { background: rgba(255, 255, 255, 0.2); }
                .active-dot {
                    width: 8px; height: 8px; background: #10b981; border-radius: 50%;
                    position: absolute; top: -2px; right: -2px; border: 2px solid #1a1f2e;
                }

                .selected-customer-preview {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;
                }
                .sc-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .sc-name { color: #10b981; font-weight: 600; font-size: 0.9rem; }
                .sc-phone { color: var(--text-muted); font-size: 0.8rem; }
                .sc-remove {
                    background: transparent; border: none; color: #ef4444;
                    cursor: pointer; padding: 0.25rem; display: flex;
                }

                /* Left Side */
                .pos-catalog {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    overflow: hidden;
                }

                .pos-header { margin-bottom: 1.5rem; }
                
                .search-bar {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 1rem;
                }
                .search-bar input {
                    background: transparent; border: none; outline: none;
                    color: white; width: 100%; font-size: 1rem;
                }

                .category-filters { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
                .cat-btn {
                    padding: 0.5rem 1rem; border-radius: 2rem;
                    background: rgba(255, 255, 255, 0.05); color: var(--text-muted);
                    border: 1px solid transparent; cursor: pointer; white-space: nowrap;
                    transition: all 0.2s;
                }
                .cat-btn.active {
                    background: var(--color-primary); color: white;
                }
                .cat-btn:hover:not(.active) { background: rgba(255, 255, 255, 0.1); }

                .product-list {
                    display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; padding-right: 0.5rem;
                }

                .product-list-header {
                    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1rem;
                    padding: 0.5rem 1rem; margin-bottom: 0.5rem;
                    color: var(--text-muted); font-size: 0.85rem; font-weight: 600;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .product-row {
                    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; align-items: center; gap: 1rem;
                    background: rgba(255, 255, 255, 0.03); padding: 0.75rem 1rem;
                    border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .product-row:hover {
                    background: rgba(255, 255, 255, 0.06); border-color: var(--color-primary);
                    transform: translateX(4px);
                }

                .p-name { font-weight: 600; font-size: 0.95rem; color: var(--text-main); }
                .p-cat { display: flex; align-items: center; }
                .category-pill { font-size: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px; }
                
                .p-stock { font-size: 0.85rem; color: #10b981; }
                .p-stock.low { color: #f59e0b; }

                .p-price { font-weight: 700; color: var(--color-primary); font-size: 1rem; }
                
                .add-btn-sm {
                    width: 28px; height: 28px; border-radius: 50%;
                    background: rgba(255,255,255,0.1); color: white;
                    display: flex; align-items: center; justify-content: center;
                    border: none; transition: background 0.2s;
                }
                .product-row:hover .add-btn-sm { background: var(--color-primary); }

                /* Right Side - Cart */
                .pos-cart {
                    width: 380px;
                    background: #1a1f2e;
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex; flex-direction: column;
                    border-radius: 1rem;
                    padding: 1.5rem;
                }

                .cart-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.5rem; padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .clear-btn {
                    display: flex; align-items: center; gap: 0.25rem;
                    background: transparent; color: #ef4444; border: none;
                    cursor: pointer; font-size: 0.85rem;
                }
                .clear-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .cart-items { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
                .empty-cart {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; color: var(--text-muted); opacity: 0.5; gap: 1rem;
                }

                .cart-item {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 0.75rem;
                }
                .item-info { flex: 1; }
                .item-info h4 { margin: 0; font-size: 0.9rem; }
                .item-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }

                .item-controls {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(0, 0, 0, 0.2); padding: 0.25rem; border-radius: 1rem;
                    margin: 0 1rem;
                }
                .item-controls button {
                    width: 24px; height: 24px; border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1); color: white;
                    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
                }
                .item-controls span { font-weight: 600; font-size: 0.9rem; min-width: 20px; text-align: center; }

                .item-total {
                    display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;
                    font-weight: 600; font-size: 0.9rem;
                }
                .remove-btn { background: transparent; color: #ef4444; border: none; cursor: pointer; padding: 0; }

                .customer-section {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                .customer-section h4 {
                    margin: 0 0 0.75rem 0;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .customer-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .form-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .form-group:hover, .form-group:focus-within {
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .form-group input {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: white;
                    width: 100%;
                    font-size: 0.85rem;
                }
                .form-group svg {
                    color: var(--text-muted);
                    min-width: 16px;
                }

                .cart-footer {
                    margin-top: 1.5rem; padding-top: 1rem;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
                .summary-row.total { color: var(--text-main); font-size: 1.25rem; font-weight: 700; margin-top: 1rem; margin-bottom: 1.5rem; }

                .checkout-btn {
                    width: 100%; padding: 1rem; border-radius: 0.75rem;
                    background: var(--color-primary); color: white;
                    border: none; font-weight: 700; font-size: 1rem;
                    display: flex; align-items: center; justify-content: center; gap: 0.75rem;
                    cursor: pointer; transition: all 0.2s;
                }
                .checkout-btn:disabled { opacity: 0.5; background: gray; cursor: not-allowed; }
                .checkout-btn:hover:not(:disabled) { filter: brightness(1.1); }

                /* Receipt Modal */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                    backdrop-filter: blur(5px);
                }

                .receipt-modal {
                    background: white; color: black; padding: 2rem; width: 380px;
                    border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    font-family: 'Courier New', Courier, monospace; /* Receipt font */
                }

                .receipt-header { text-align: center; margin-bottom: 1rem; }
                .receipt-header h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700; color: black; }
                .receipt-header p { margin: 0; font-size: 0.85rem; color: #555; }
                
                .receipt-meta { margin-top: 1rem; display: flex; justify-content: space-between; font-size: 0.8rem; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; }
                .receipt-id { text-align: left; font-size: 0.8rem; margin-top: 0.5rem; }
                
                .receipt-customer { text-align: left; margin: 1rem 0; font-size: 0.85rem; }
                .receipt-customer p { margin: 0.2rem 0; color: #333; }

                .receipt-divider { border-bottom: 1px dashed #000; margin: 1rem 0; }

                .receipt-table { width: 100%; font-size: 0.9rem; text-align: left; }
                .receipt-table th { border-bottom: 1px solid #000; padding-bottom: 0.5rem; }
                .receipt-table td { padding: 0.5rem 0; }
                .r-item-name { max-width: 140px; }

                .receipt-summary { margin-top: 1rem; }
                .r-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .r-row.total { font-weight: 700; font-size: 1.1rem; border-top: 1px dashed #000; padding-top: 0.5rem; }

                .receipt-footer { text-align: center; margin-top: 2rem; font-size: 0.8rem; color: #666; }

                .receipt-actions { display: flex; gap: 1rem; margin-top: 2rem; }
                .print-btn, .close-btn {
                    flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem;
                    font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                }
                .print-btn { background: #000; color: white; }
                .print-btn:hover { background: #333; }
                .close-btn { background: #f3f4f6; color: #333; }
                .close-btn:hover { background: #e5e7eb; }
            `}</style>
        </div>
    );
};

export default PointOfSale;
