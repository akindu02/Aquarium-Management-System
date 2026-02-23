
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Search, X, Plus, Minus, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import './Store.css';

const BACKEND_URL = 'http://localhost:5001';
const CART_KEY = 'aquarium_cart';

/** Prefix relative image paths with the backend origin */
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
};

/** Load persisted cart from localStorage */
const loadCart = () => {
    try {
        const saved = localStorage.getItem(CART_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

const Store = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [cartItems, setCartItems] = useState(loadCart);
    const [showCart, setShowCart] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Fetch real products from backend on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`${BACKEND_URL}/api/products`);
                const data = await res.json();
                if (data.success) setProducts(data.data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    // Derive category list from fetched products
    const categories = ['All', ...new Set(products.map(p => p.category))].filter(Boolean);

    // Filter and Sort Logic
    useEffect(() => {
        let result = [...products];

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (sortBy === 'price-low') {
            result.sort((a, b) => parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price));
        } else {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, sortBy]);

    // ── Cart helpers ────────────────────────────────────────────────────────
    const addToCart = (product) => {
        if (product.stock_quantity <= 0) return;
        const unitPrice = parseFloat(product.sale_price || product.price);

        setCartItems(prev => {
            const existing = prev.find(item => item.product_id === product.product_id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) return prev;
                return prev.map(item =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.product_id,
                name: product.name,
                price: unitPrice,
                image_url: product.image_url,
                stock_quantity: product.stock_quantity,
                quantity: 1,
            }];
        });

        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) { removeFromCart(productId); return; }
        setCartItems(prev =>
            prev.map(item =>
                item.product_id === productId
                    ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) }
                    : item
            )
        );
    };

    const getCartTotal = () =>
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const getCartCount = () =>
        cartItems.reduce((count, item) => count + item.quantity, 0);

    const handleCheckout = () => {
        setShowCart(false);
        if (!isAuthenticated()) {
            navigate('/signin', { state: { from: '/store' } });
            return;
        }
        navigate('/checkout', { state: { cartItems, cartTotal: getCartTotal() } });
    };

    return (
        <div className="store-page container">
            <div className="store-header">
                <h1 className="store-title">Methu Aquarium Store</h1>
                <p className="store-subtitle">Discover our premium selection of aquatic life and supplies.</p>
            </div>

            <div className="store-toolbar">
                {/* Left Side */}
                <div className="toolbar-left">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Dynamic categories derived from real products */}
                    <select
                        className="toolbar-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                        ))}
                    </select>
                </div>

                {/* Right Side */}
                <div className="toolbar-right">
                    <select
                        className="toolbar-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low → High</option>
                        <option value="price-high">Price: High → Low</option>
                    </select>

                    <button className="cart-btn" onClick={() => setShowCart(true)}>
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                    </button>
                </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '1rem', fontSize: '1.1rem' }}>Loading products…</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    <div className="product-grid">
                        {filteredProducts.map(product => {
                            const displayPrice = parseFloat(product.sale_price || product.price);
                            const hasDiscount = parseFloat(product.discount_percent) > 0;
                            const outOfStock = product.stock_quantity <= 0;

                            return (
                                <div key={product.product_id} className="product-card">
                                    <div className="card-media">
                                        <button
                                            className="btn-quick-view"
                                            title="Quick View"
                                            onClick={() => setQuickViewProduct(product)}
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {getImageUrl(product.image_url) ? (
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="product-image" style={{
                                                background: 'rgba(78,205,196,0.1)',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '3rem'
                                            }}>🐠</div>
                                        )}

                                        {outOfStock && (
                                            <div className="stock-overlay">Out of Stock</div>
                                        )}
                                    </div>

                                    <div className="card-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <div className="product-price">
                                            LKR {displayPrice.toLocaleString()}
                                            {hasDiscount && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    textDecoration: 'line-through',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '0.85em',
                                                }}>
                                                    LKR {parseFloat(product.price).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="add-to-cart-btn"
                                        disabled={outOfStock}
                                        onClick={() => addToCart(product)}
                                    >
                                        <ShoppingCart size={18} />
                                        {outOfStock ? 'Out of Stock' : 'Add To Cart'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No products found matching your criteria.
                        </div>
                    )}
                </>
            )}

            {/* Cart Overlay */}
            <div className={`cart-overlay ${showCart ? 'active' : ''}`} onClick={() => setShowCart(false)}></div>

            {/* Cart Panel */}
            <div className={`cart-panel ${showCart ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button className="cart-close-btn" onClick={() => setShowCart(false)}>
                        <X size={24} />
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="cart-empty">
                        <ShoppingCart size={48} />
                        <p>Your cart is empty</p>
                        <button className="btn btn-primary" onClick={() => setShowCart(false)}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            <div className="cart-table-header">
                                <span>Product</span>
                                <span>Price</span>
                                <span>Quantity</span>
                                <span>Subtotal</span>
                            </div>

                            {cartItems.map(item => (
                                <div key={item.product_id} className="cart-item">
                                    <div className="cart-item-product">
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.product_id)}
                                        >
                                            <X size={16} />
                                        </button>
                                        {getImageUrl(item.image_url) ? (
                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name}
                                                className="cart-item-image"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="cart-item-image" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐠</div>
                                        )}
                                        <span className="cart-item-name">{item.name}</span>
                                    </div>
                                    <div className="cart-item-price">
                                        LKR {item.price.toLocaleString()}
                                    </div>
                                    <div className="cart-item-quantity">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-value">{item.quantity.toString().padStart(2, '0')}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-actions">
                            <button className="btn btn-outline" onClick={() => setShowCart(false)}>
                                <ArrowLeft size={18} />
                                Return To Shop
                            </button>
                        </div>

                        <div className="cart-summary">
                            <h3>Cart Total</h3>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>LKR {getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>LKR {getCartTotal().toLocaleString()}</span>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className={`toast ${showToast ? 'show' : ''}`}>
                Added to cart successfully!
            </div>

            {/* ── Quick View Modal ── */}
            {quickViewProduct && (
                <div className="qv-overlay" onClick={() => setQuickViewProduct(null)}>
                    <div className="qv-modal" onClick={e => e.stopPropagation()}>
                        <button className="qv-close" onClick={() => setQuickViewProduct(null)}>
                            <X size={22} />
                        </button>

                        <div className="qv-body">
                            {/* Left – Image */}
                            <div className="qv-image-wrap">
                                {getImageUrl(quickViewProduct.image_url) ? (
                                    <img
                                        src={getImageUrl(quickViewProduct.image_url)}
                                        alt={quickViewProduct.name}
                                        className="qv-image"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="qv-image-placeholder">🐠</div>
                                )}
                            </div>

                            {/* Right – Details */}
                            <div className="qv-details">
                                {quickViewProduct.category && (
                                    <span className="qv-category">{quickViewProduct.category}</span>
                                )}
                                <h2 className="qv-name">{quickViewProduct.name}</h2>

                                <div className="qv-price-row">
                                    <span className="qv-price">
                                        LKR {parseFloat(quickViewProduct.sale_price || quickViewProduct.price).toLocaleString()}
                                    </span>
                                    {parseFloat(quickViewProduct.discount_percent) > 0 && (
                                        <>
                                            <span className="qv-original-price">
                                                LKR {parseFloat(quickViewProduct.price).toLocaleString()}
                                            </span>
                                            <span className="qv-discount-badge">
                                                -{quickViewProduct.discount_percent}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                <p className="qv-description">
                                    {quickViewProduct.description
                                        ? quickViewProduct.description
                                        : 'No description available for this product.'}
                                </p>

                                <div className="qv-stock-row">
                                    <span className={`qv-stock-badge ${quickViewProduct.stock_quantity <= 0 ? 'out' : quickViewProduct.stock_quantity <= 10 ? 'low' : 'in'}`}>
                                        {quickViewProduct.stock_quantity <= 0
                                            ? 'Out of Stock'
                                            : quickViewProduct.stock_quantity <= 10
                                                ? `Low Stock — ${quickViewProduct.stock_quantity} left`
                                                : 'In Stock'}
                                    </span>
                                </div>

                                <button
                                    className="qv-add-btn"
                                    disabled={quickViewProduct.stock_quantity <= 0}
                                    onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}
                                >
                                    <ShoppingCart size={18} />
                                    {quickViewProduct.stock_quantity <= 0 ? 'Out of Stock' : 'Add To Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Store;
