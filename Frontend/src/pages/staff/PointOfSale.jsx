import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, RotateCcw, CheckCircle, Package } from 'lucide-react';

const PointOfSale = () => {
    // Dummy Product Data
    const initialProducts = [
        { id: 1, name: 'Goldfish Food Flakes', price: 450, category: 'Food', stock: 50, image: 'https://images.unsplash.com/photo-1598516088219-c68e738e4a05?auto=format&fit=crop&q=80&w=200' },
        { id: 2, name: 'Neon Tetra', price: 120, category: 'Live Fish', stock: 200, image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=200' },
        { id: 3, name: 'Glass Tank 30L', price: 8500, category: 'Tanks', stock: 15, image: 'https://images.unsplash.com/photo-1516684669134-de6d7c47343b?auto=format&fit=crop&q=80&w=200' },
        { id: 4, name: 'Water Filter Pump', price: 3200, category: 'Equipment', stock: 8, image: 'https://images.unsplash.com/photo-1596464716127-f9a862557988?auto=format&fit=crop&q=80&w=200' },
        { id: 5, name: 'Decor Stones (1kg)', price: 350, category: 'Decor', stock: 100, image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=200' },
        { id: 6, name: 'Anti-Chlorine', price: 600, category: 'Medicine', stock: 40, image: 'https://images.unsplash.com/photo-1628156173748-18e420a3aaee?auto=format&fit=crop&q=80&w=200' },
        { id: 7, name: 'Guppy Fish', price: 80, category: 'Live Fish', stock: 300, image: 'https://images.unsplash.com/photo-1533633634024-d2e4682390a4?auto=format&fit=crop&q=80&w=200' },
        { id: 8, name: 'LED Aquarium Light', price: 4500, category: 'Equipment', stock: 20, image: 'https://images.unsplash.com/photo-1615147342761-9238e1548b20?auto=format&fit=crop&q=80&w=200' },
    ];

    const [products, setProducts] = useState(initialProducts);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(products.map(p => p.category))];

    // Cart Actions
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + change;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0; // Assuming tax included, or add rate here
    const total = subtotal + tax;

    return (
        <div className="pos-container">
            {/* Left Side - Product Catalog */}
            <div className="pos-catalog">
                {/* Header / Search */}
                <div className="pos-header">
                    <div className="search-bar">
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* Product Grid */}
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                            <div className="product-info-compact">
                                <div className="p-header">
                                    <h4 title={product.name}>{product.name}</h4>
                                    <span className="stock-pill">{product.stock} in stock</span>
                                </div>
                                <div className="p-footer">
                                    <span className="category-pill">{product.category}</span>
                                    <div className="price-action">
                                        <span className="price">LKR {product.price}</span>
                                        <button className="add-btn-sm"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Cart */}
            <div className="pos-cart">
                <div className="cart-header">
                    <h3>Current Order</h3>
                    <button className="clear-btn" onClick={clearCart} disabled={cart.length === 0}>
                        <RotateCcw size={16} /> Clear
                    </button>
                </div>

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
                                    <p>LKR {item.price}</p>
                                </div>
                                <div className="item-controls">
                                    <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                                </div>
                                <div className="item-total">
                                    LKR {item.price * item.qty}
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

                    <button
                        className="checkout-btn"
                        disabled={cart.length === 0}
                        onClick={() => setShowPaymentModal(true)}
                    >
                        <CreditCard size={20} />
                        Proceed to Payment
                    </button>
                </div>
            </div>

            {/* Receipt Modal */}
            {showPaymentModal && (
                <div className="modal-overlay">
                    <div className="receipt-modal">
                        <div className="receipt-header">
                            <h2>Methu Aquarium</h2>
                            <p>123 Marine Drive, Columbo 03</p>
                            <p>Tel: +94 11 234 5678</p>
                            <div className="receipt-meta">
                                <span>Date: {new Date().toLocaleDateString()}</span>
                                <span>Time: {new Date().toLocaleTimeString()}</span>
                            </div>
                            <div className="receipt-id">Receipt #: {Math.floor(Math.random() * 100000)}</div>
                        </div>

                        <div className="receipt-divider"></div>

                        <div className="receipt-body">
                            <table className="receipt-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.id}>
                                            <td className="r-item-name">{item.name}</td>
                                            <td>{item.qty}</td>
                                            <td>{item.price}</td>
                                            <td>{(item.price * item.qty).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="receipt-divider"></div>

                        <div className="receipt-summary">
                            <div className="r-row">
                                <span>Subtotal</span>
                                <span>LKR {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="r-row total">
                                <span>Total</span>
                                <span>LKR {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="receipt-footer">
                            <p>Thank you for shopping with us!</p>
                            <p>Software by MethuTech</p>
                        </div>

                        <div className="receipt-actions">
                            <button className="print-btn" onClick={() => window.print()}>
                                <Package size={16} /> Print Receipt
                            </button>
                            <button
                                className="close-btn"
                                onClick={() => { setShowPaymentModal(false); setCart([]); }}
                            >
                                New Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .pos-container {
                    display: flex;
                    height: calc(100vh - 100px); /* Adjust based on header/layout */
                    gap: 1.5rem;
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

                .product-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem; overflow-y: auto; padding-right: 0.5rem;
                }

                .product-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.75rem; overflow: hidden; cursor: pointer;
                    transition: all 0.2s; border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .product-card:hover { transform: translateY(-2px); border-color: var(--color-primary); background: rgba(255, 255, 255, 0.08); }

                .product-info-compact { padding: 1rem; display: flex; flex-direction: column; height: 100%; justify-content: space-between; gap: 1rem; }
                
                .p-header h4 { 
                    margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; line-height: 1.4;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .stock-pill {
                    font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);
                }

                .p-footer { display: flex; justify-content: space-between; align-items: flex-end; }
                .category-pill { font-size: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px; }
                
                .price-action { display: flex; align-items: center; gap: 0.5rem; }
                .price { font-weight: 700; color: var(--color-primary); font-size: 1.1rem; }
                
                .add-btn-sm {
                    width: 24px; height: 24px; border-radius: 50%;
                    background: var(--color-primary); color: white;
                    display: flex; align-items: center; justify-content: center;
                    border: none;
                }

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

                @media print {
                    body * { visibility: hidden; }
                    .receipt-modal, .receipt-modal * { visibility: visible; }
                    .modal-overlay { background: white; position: absolute; inset: 0; }
                    .receipt-modal {
                        position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border-radius: 0; padding: 0;
                        margin: 0;
                    }
                    .receipt-actions { display: none; } /* Hide buttons on print */
                }
            `}</style>
        </div>
    );
};

export default PointOfSale;
