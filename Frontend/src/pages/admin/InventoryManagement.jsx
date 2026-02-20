import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Package, Tag, AlertTriangle, CheckCircle, XCircle, MoreVertical, ChevronDown, X } from 'lucide-react';
import Swal from 'sweetalert2';

const InventoryManagement = () => {
    // Dummy Data
    const initialProducts = [
        { id: 'P-1001', name: 'Goldfish (Medium)', category: 'Live Fish', price: 250, stock: 45, status: 'In Stock', image: '/store/Goldfish (Medium).jpg' },
        { id: 'P-1002', name: 'Neon Tetra', category: 'Live Fish', price: 120, stock: 12, status: 'Low Stock', image: '/store/Betta Fish.jpg' }, // Placeholder image
        { id: 'P-1003', name: 'Glass Tank 30L', category: 'Tanks', price: 8500, stock: 5, status: 'Low Stock', image: '/store/Glass Tank 30L.jpg' },
        { id: 'P-1004', name: 'Canister Filter', category: 'Equipment', price: 15000, stock: 0, status: 'Out of Stock', image: '/store/Sponge Filter (Small).jpg' },
        { id: 'P-1005', name: 'Fish Food Flakes 100g', category: 'Food', price: 450, stock: 100, status: 'In Stock', image: '/store/Goldfish Pellets 150g.jpg' },
        { id: 'P-1006', name: 'LED Aquarium Light', category: 'Equipment', price: 3200, stock: 20, status: 'In Stock', image: '/store/LED Spectrum Light.jpg' },
        { id: 'P-1007', name: 'Anti-Fungal Treatment', category: 'Medicine', price: 800, stock: 35, status: 'In Stock', image: '/store/Anti-Fungal Treatment.jpg' },
        { id: 'P-1008', name: 'Aquatic Plant Fertilizer', category: 'Plants', price: 1200, stock: 8, status: 'Low Stock', image: '/store/Aquatic Plant Fertilizer.jpg' },
    ];

    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle Delete
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Remove Product?',
            text: 'This product will be permanently removed from inventory.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel',
            background: '#1a1f2e',
            color: '#fff',
        }).then((result) => {
            if (result.isConfirmed) {
                setProducts(products.filter(p => p.id !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'Product has been deleted.',
                    background: '#1a1f2e',
                    color: '#fff',
                    confirmButtonColor: '#4ecdc4',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    // Stock Badge Style
    const getStockStyle = (status) => {
        switch (status) {
            case 'In Stock': return { color: '#10b981', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' };
            case 'Low Stock': return { color: '#f59e0b', icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.1)' };
            case 'Out of Stock': return { color: '#ef4444', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: '#6b7280', icon: Package, bg: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    return (
        <div className="inventory-management">
            <div className="im-header">
                <div>
                    <h2 className="im-title">Inventory & Products</h2>
                    <p className="im-subtitle">Manage stock levels, prices, and product details</p>
                </div>
                <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Toolbar */}
            <div className="im-toolbar">
                <div className="im-filter-group">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="im-table-container">
                <table className="im-table">
                    <thead>
                        <tr>
                            <th>Product Info</th>
                            <th>Price (LKR)</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const stockStyle = getStockStyle(product.status);
                            const StatusIcon = stockStyle.icon;
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-img">
                                                {/* Use placeholder if image load fails (simulated by using product name first char) */}
                                                <img src={product.image} alt={product.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                                <div className="img-placeholder" style={{ display: 'none' }}>{product.name[0]}</div>
                                            </div>
                                            <div>
                                                <div className="product-name">{product.name}</div>
                                                <div className="product-id">{product.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono">
                                        {product.price.toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="stock-level">
                                            <span style={{ fontWeight: 600 }}>{product.stock}</span>
                                            <span className="stock-unit">units</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: stockStyle.bg, color: stockStyle.color }}>
                                            <StatusIcon size={14} style={{ marginRight: '4px' }} />
                                            {product.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(product.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Product Modal (Simulated) */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Product</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input type="text" placeholder="e.g. Goldfish Food" />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Price (LKR)</label>
                                    <input type="number" placeholder="0.00" />
                                </div>
                                <div className="form-group half">
                                    <label>Initial Stock</label>
                                    <input type="number" placeholder="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" placeholder="Product details..."></textarea>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="btn-save" onClick={() => { setShowAddModal(false); Swal.fire({ icon: 'success', title: 'Product Added!', text: 'New product has been added to inventory.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4' }); }}>Save Product</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .im-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .im-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); }
                .im-subtitle { color: var(--text-muted); }

                .btn-add-product {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-add-product:hover { filter: brightness(1.1); transform: translateY(-1px); }

                .im-toolbar {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1rem;
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                }

                .im-filter-group { display: flex; gap: 1rem; }

                .search-box {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0 0.75rem;
                    color: var(--text-muted);
                    width: 300px;
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    padding: 0.6rem;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                }

                .select-wrapper { position: relative; }
                .select-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .select-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }
                .select-wrapper select {
                    appearance: none;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0.6rem 2rem 0.6rem 2.25rem;
                    color: var(--text-main);
                    cursor: pointer;
                    outline: none;
                    min-width: 180px;
                }

                .im-table-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    overflow: hidden;
                }
                .im-table { width: 100%; border-collapse: collapse; }
                .im-table th {
                    text-align: left; padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .im-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    vertical-align: middle;
                    color: var(--text-main);
                }

                .product-cell { display: flex; align-items: center; gap: 1rem; }
                .product-img {
                    width: 48px; height: 48px; border-radius: 8px; overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .product-img img { width: 100%; height: 100%; object-fit: cover; }
                .product-name { font-weight: 600; color: var(--text-main); }
                .product-id { font-size: 0.8rem; color: var(--color-primary); font-family: monospace; }
                
                .category-badge {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .font-mono { font-family: monospace; font-size: 0.95rem; }
                .stock-level { font-size: 0.95rem; }
                .stock-unit { font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem; }

                .status-badge {
                    display: inline-flex; align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .action-buttons { display: flex; gap: 0.5rem; }
                .btn-icon {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; transition: all 0.2s;
                }
                .btn-icon.edit { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .btn-icon.delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .btn-icon:hover { transform: scale(1.1); }

                /* Modal */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center; z-index: 200;
                }
                .modal-content {
                    background: #1a1f2e; width: 500px;
                    border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 2rem;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .modal-header h3 { margin: 0; color: var(--text-main); }
                .modal-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }

                .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .form-group { width: 100%; margin-bottom: 1rem; }
                .form-group.half { width: 50%; }
                
                label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
                input, select, textarea {
                    width: 100%; padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem; color: var(--text-main); outline: none;
                }
                input:focus, select:focus, textarea:focus { border-color: var(--color-primary); }

                .modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
                .btn-cancel { flex: 1; padding: 0.75rem; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-muted); border-radius: 0.5rem; cursor: pointer; }
                .btn-save { flex: 1; padding: 0.75rem; background: var(--color-primary); border: none; color: white; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
            `}</style>
        </div >
    );
};

export default InventoryManagement;
