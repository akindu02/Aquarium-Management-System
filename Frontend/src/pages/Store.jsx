
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Search } from 'lucide-react';
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
        stock: 0,
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
        stock: 30,
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
    const [products, setProducts] = useState(PRODUCTS);
    const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [cartCount, setCartCount] = useState(0);
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
            // For demo, we prioritize isNew, then id
            result.sort((a, b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, sortBy]);

    const addToCart = (product) => {
        if (product.stock <= 0) return;
        setCartCount(prev => prev + 1);

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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

                    <button className="cart-btn">
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        <span className="cart-badge">{cartCount}</span>
                    </button>
                </div>
            </div>

            <div className="product-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">

                        <div className="card-media">
                            {/* Badges and Actions */}
                            <button className="btn-quick-view" title="Quick View">
                                <Eye size={18} />
                            </button>

                            <img src={product.image} alt={product.name} className="product-image" />

                            {/* Out of stock overlay */}
                            {product.stock <= 0 && (
                                <div className="stock-overlay">Out of Stock</div>
                            )}
                        </div>

                        <div className="card-info">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">LKR {product.price.toFixed(2)}</div>
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

            <div className={`toast ${showToast ? 'show' : ''}`}>
                Added to cart successfully!
            </div>
        </div>
    );
};

export default Store;
