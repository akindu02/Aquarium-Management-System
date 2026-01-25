
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import './Store.css';

// Initial dummy data
const PRODUCTS = [
    {
        id: 1,
        name: 'Neon Tetra School',
        category: 'Fish',
        price: 4.50,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=800',
        isNew: true
    },
    {
        id: 2,
        name: 'Premium Glass Tank 50L',
        category: 'Tanks',
        price: 129.99,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1516684669134-de6d7c47743d?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 3,
        name: 'External Canister Filter',
        category: 'Filters',
        price: 89.95,
        stock: 0,
        image: 'https://plus.unsplash.com/premium_photo-1661605333857-41ab4c88e727?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 4,
        name: 'Tropical Flakes Premium',
        category: 'Food',
        price: 12.99,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1627807490013-1b9c922579df?auto=format&fit=crop&q=80&w=800',
        isNew: true
    },
    {
        id: 5,
        name: 'Betta Fish (Show Grade)',
        category: 'Fish',
        price: 25.00,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1534575180408-b7d7c0136ee8?auto=format&fit=crop&q=80&w=800',
        isNew: true
    },
    {
        id: 6,
        name: 'Aquatic Plant Fertilizer',
        category: 'Medicine',
        price: 15.50,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1596765796791-628d3493c837?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 7,
        name: 'LED Spectrum Light',
        category: 'Tanks',
        price: 55.00,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1544979590-449e798725ee?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 8,
        name: 'Anti-Fungal Treatment',
        category: 'Medicine',
        price: 9.99,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 9,
        name: 'Goldfish Pellets',
        category: 'Food',
        price: 8.50,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c547aaea2?auto=format&fit=crop&q=80&w=800',
        isNew: false
    },
    {
        id: 10,
        name: 'Substrate Sand 5kg',
        category: 'Tanks',
        price: 18.00,
        stock: 0,
        image: 'https://images.unsplash.com/photo-1528821128474-27f963b0bdd4?auto=format&fit=crop&q=80&w=800',
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
                <h1 className="store-title">Methus Aquarium Store</h1>
                <p className="store-subtitle">Discover our premium selection of aquatic life and supplies.</p>
            </div>

            <div className="history-glass store-toolbar glass">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Fish">Fish</option>
                    <option value="Tanks">Tanks</option>
                    <option value="Filters">Filters</option>
                    <option value="Food">Food</option>
                    <option value="Medicine">Medicine</option>
                </select>

                <button className="cart-btn-header">
                    <ShoppingCart size={20} />
                    <span>Cart</span>
                    <span className="cart-badge">{cartCount}</span>
                </button>
            </div>

            <div className="sort-container">
                <span className="sort-label">Sort by:</span>
                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Mid to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
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
                            <div className="product-price">${product.price.toFixed(2)}</div>
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
