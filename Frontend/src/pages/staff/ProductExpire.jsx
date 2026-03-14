import React, { useState, useEffect } from 'react';
import { Package, Search, Calendar, AlertTriangle, Info } from 'lucide-react';
import { getExpiringProductsAPI } from '../../utils/api';
// Optionally you could add sweetalert if you want actions, but for now just display

const getExpiryStyle = (expiryDate) => {
    if (!expiryDate) return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'N/A', days: null };
    
    // Normalize today to start of day for accurate full-day counting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Expired', days: diffDays };
    if (diffDays <= 7) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Critical', days: diffDays };
    if (diffDays <= 30) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Expiring Soon', days: diffDays };
    return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Valid', days: diffDays };
};

const ProductExpire = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchExpiringProducts = async () => {
        try {
            setLoading(true);
            const response = await getExpiringProductsAPI();
            if (response.success) {
                setProducts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch expiring products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiringProducts();
    }, []);

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="product-restock-container">
            <style>{`
                .product-restock-container {
                    background: transparent;
                    color: var(--text-main);
                    padding-bottom: 2rem;
                }
                .pg-header {
                    margin-bottom: 2rem;
                }
                .pg-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .pg-subtitle {
                    color: var(--text-muted);
                }
                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.6rem 1rem;
                    width: 300px;
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    margin-left: 0.5rem;
                    width: 100%;
                    outline: none;
                }
                .restock-table-wrapper {
                    background: rgba(20, 30, 48, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .restock-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .restock-table th {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1rem;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .restock-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    vertical-align: middle;
                }
                .restock-table tr:hover td {
                    background: rgba(255, 255, 255, 0.02);
                }
                .prod-cell {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .prod-img {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: cover;
                    background: rgba(255, 255, 255, 0.05);
                }
                .prod-info h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1rem;
                    color: var(--text-main);
                }
                .prod-category {
                    font-size: 0.8rem;
                    color: var(--color-primary);
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .empty-state {
                    padding: 4rem 2rem;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>

            <div className="pg-header">
                <h1 className="pg-title"><Calendar size={32} color="var(--color-primary)" /> Product Expiry</h1>
                <p className="pg-subtitle">Monitor products that are expiring soon or have already expired.</p>
            </div>

            <div className="controls-row">
                <div className="search-box">
                    <Search size={18} color="var(--text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search expiring products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="restock-table-wrapper">
                <table className="restock-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Expiry Date</th>
                            <th>Days Remaining</th>
                            <th>Stock / Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="empty-state">Loading...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="empty-state">
                                    <AlertTriangle size={48} opacity={0.5} style={{ margin: '0 auto 1rem auto' }} />
                                    <p>No expiring products found.</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(p => {
                                const style = getExpiryStyle(p.expiry_date);
                                const dateObj = p.expiry_date ? new Date(p.expiry_date) : null;
                                const dateStr = dateObj ? dateObj.toLocaleDateString() : 'N/A';
                                return (
                                    <tr key={p.product_id}>
                                        <td>
                                            <div className="prod-cell">
                                                {p.image_url ? (
                                                    <img src={'http://localhost:5001' + p.image_url} alt={p.name} className="prod-img" />
                                                ) : (
                                                    <div className="prod-img" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                        <Package size={24} color="var(--text-muted)"/>
                                                    </div>
                                                )}
                                                <div className="prod-info">
                                                    <h4>{p.name}</h4>
                                                    <span className="prod-category">{p.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '500', color: style.color }}>{dateStr}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Supplier: {p.supplier_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: style.color }}>
                                                {style.days !== null ? (style.days === 0 ? 'Today' : style.days > 0 ? `${style.days} days` : 'Expired') : 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{p.stock_quantity} units</div>
                                            <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>LKR {p.price}</div>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: style.bg, color: style.color }}>
                                                <Info size={14} />
                                                {style.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductExpire;