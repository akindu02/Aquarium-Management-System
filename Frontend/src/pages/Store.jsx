
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Search, X, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Store.css';

// Initial dummy data
const PRODUCTS = [
    {
        id: 1,
        name: 'Goldfish (Medium)',
        category: 'Fish',
        price: 4250,
        stock: 50,
        image: '/store/Goldfish (Medium).jpg',
        isNew: true
    },
    {
        id: 2,
        name: 'Glass Tank 30L',
        category: 'Tanks',
        price: 12000,
        stock: 5,
        image: '/store/Glass Tank 30L.jpg',
        isNew: false
    },
    {
        id: 3,
        name: 'Sponge Filter (Small)',
        category: 'Filters',
        price: 2500,
        stock: 2,
        image: '/store/Sponge Filter (Small).jpg',
        isNew: false
    },
    {
        id: 4,
        name: 'Goldfish Pellets 150g',
        category: 'Food',
        price: 600,
        stock: 100,
        image: '/store/Goldfish Pellets 150g.jpg',
        isNew: true
    },
    {
        id: 5,
        name: 'Betta Fish',
        category: 'Fish',
        price: 250,
        stock: 12,
        image: '/store/Betta Fish.jpg',
        isNew: true
    },
    {
        id: 6,
        name: 'Aquatic Plant Fertilizer',
        category: 'Medicine',
        price: 2300,
        stock: 0,
        image: '/store/Aquatic Plant Fertilizer.jpg',
        isNew: false
    },
    {
        id: 7,
        name: 'LED Spectrum Light',
        category: 'Accessories',
        price: 1250,
        stock: 15,
        image: '/store/LED Spectrum Light.jpg',
        isNew: false
    },
    {
        id: 8,
        name: 'Anti-Fungal Treatment',
        category: 'Medicine',
        price: 4500,
        stock: 45,
        image: '/store/Anti-Fungal Treatment.jpg',
        isNew: false
    }
];

const Store = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState(PRODUCTS);
    const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Filter and Sort Logic
    useEffect(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, sortBy]);

    // Cart Functions
    const addToCart = (product) => {
        if (product.stock <= 0) return;

        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
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

                    <select
                        className="toolbar-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Fish">Fish</option>
                        <option value="Tanks">Tanks</option>
                        <option value="Filters">Filters</option>
                        <option value="Food">Food</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Accessories">Accessories</option>
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
                        <span className="cart-badge">{getCartCount()}</span>
                    </button>
                </div>
            </div>

            <div className="product-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">

                        <div className="card-media">
                            <button className="btn-quick-view" title="Quick View">
                                <Eye size={18} />
                            </button>

                            <img src={product.image} alt={product.name} className="product-image" />

                            {product.stock <= 0 && (
                                <div className="stock-overlay">Out of Stock</div>
                            )}
                        </div>

                        <div className="card-info">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">LKR {product.price.toLocaleString()}</div>
                        </div>

                        <button
                            className="add-to-cart-btn"
                            disabled={product.stock <= 0}
                            onClick={() => addToCart(product)}
                        >
                            <ShoppingCart size={18} />
                            {product.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                        </button>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found matching your criteria.
                </div>
            )}

            <div className="pagination">
                <button className="btn btn-outline load-more-btn">
                    Load More Products
                </button>
            </div>

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
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-product">
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                        <img src={item.image} alt={item.name} className="cart-item-image" />
                                        <span className="cart-item-name">{item.name}</span>
                                    </div>
                                    <div className="cart-item-price">
                                        LKR {item.price.toLocaleString()}
                                    </div>
                                    <div className="cart-item-quantity">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-value">{item.quantity.toString().padStart(2, '0')}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                            <button
                                className="checkout-btn"
                                onClick={() => navigate('/checkout', {
                                    state: {
                                        cartItems: cartItems,
                                        cartTotal: getCartTotal()
                                    }
                                })}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className={`toast ${showToast ? 'show' : ''}`}>
                Added to cart successfully!
            </div>
        </div>
    );
};

export default Store;
