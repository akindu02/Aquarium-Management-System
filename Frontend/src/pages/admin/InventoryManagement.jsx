import React, { useState } from 'react';
import {
    Search, Plus, Edit, Trash2, Package, AlertTriangle,
    CheckCircle, XCircle, ChevronDown, X, Tag, DollarSign,
    Layers, Image, FileText, Percent, User
} from 'lucide-react';
import Swal from 'sweetalert2';

const CATEGORIES = ['Live Fish', 'Tanks', 'Equipment', 'Food', 'Plants', 'Decor', 'Medicine', 'Water Treatment', 'Lighting', 'Filters'];

// Mock supplier list — will come from backend later
const SUPPLIERS = [
    { id: 1, name: 'AquaWorld Suppliers' },
    { id: 2, name: 'FishMart Lanka' },
    { id: 3, name: 'TropicalAqua Co.' },
];

const EMPTY_FORM = {
    name: '',
    category: '',
    description: '',
    price: '',
    discount_percent: '0',
    stock_quantity: '',
    supplier_id: '',
    image: null,
    imagePreview: null,
};

const InventoryManagement = () => {
    const initialProducts = [
        { id: 'P-1001', name: 'Goldfish (Medium)', category: 'Live Fish', price: 250, discount_percent: 0, stock: 45, status: 'In Stock', image: '/store/Goldfish (Medium).jpg' },
        { id: 'P-1002', name: 'Neon Tetra', category: 'Live Fish', price: 120, discount_percent: 10, stock: 12, status: 'Low Stock', image: '/store/Betta Fish.jpg' },
        { id: 'P-1003', name: 'Glass Tank 30L', category: 'Tanks', price: 8500, discount_percent: 0, stock: 5, status: 'Low Stock', image: '/store/Glass Tank 30L.jpg' },
        { id: 'P-1004', name: 'Canister Filter', category: 'Equipment', price: 15000, discount_percent: 5, stock: 0, status: 'Out of Stock', image: '/store/Sponge Filter (Small).jpg' },
        { id: 'P-1005', name: 'Fish Food Flakes 100g', category: 'Food', price: 450, discount_percent: 0, stock: 100, status: 'In Stock', image: '/store/Goldfish Pellets 150g.jpg' },
        { id: 'P-1006', name: 'LED Aquarium Light', category: 'Equipment', price: 3200, discount_percent: 15, stock: 20, status: 'In Stock', image: '/store/LED Spectrum Light.jpg' },
        { id: 'P-1007', name: 'Anti-Fungal Treatment', category: 'Medicine', price: 800, discount_percent: 0, stock: 35, status: 'In Stock', image: '/store/Anti-Fungal Treatment.jpg' },
        { id: 'P-1008', name: 'Aquatic Plant Fertilizer', category: 'Plants', price: 1200, discount_percent: 0, stock: 8, status: 'Low Stock', image: '/store/Aquatic Plant Fertilizer.jpg' },
    ];

    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Filter ────────────────────────────────────────────────────
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCat;
    });

    // ── Helpers ───────────────────────────────────────────────────
    const getStockStyle = (status) => {
        switch (status) {
            case 'In Stock': return { color: '#10b981', Icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' };
            case 'Low Stock': return { color: '#f59e0b', Icon: AlertTriangle, bg: 'rgba(245,158,11,0.1)' };
            case 'Out of Stock': return { color: '#ef4444', Icon: XCircle, bg: 'rgba(239,68,68,0.1)' };
            default: return { color: '#6b7280', Icon: Package, bg: 'rgba(107,114,128,0.1)' };
        }
    };

    const getSalePrice = (price, discount) => {
        if (!discount || discount === 0) return null;
        return (price - (price * discount / 100)).toFixed(2);
    };

    // ── Form handlers ─────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(prev => ({
            ...prev,
            image: file,
            imagePreview: URL.createObjectURL(file),
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required.';
        if (!formData.category) newErrors.category = 'Please select a category.';
        if (!formData.price || Number(formData.price) < 0)
            newErrors.price = 'Enter a valid price.';
        if (formData.discount_percent < 0 || formData.discount_percent > 100)
            newErrors.discount_percent = 'Discount must be 0–100%.';
        if (formData.stock_quantity === '' || Number(formData.stock_quantity) < 0)
            newErrors.stock_quantity = 'Enter a valid stock quantity.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        // Simulate API call delay
        await new Promise(r => setTimeout(r, 800));

        const stock = Number(formData.stock_quantity);
        const status = stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

        const newProduct = {
            id: `P-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            discount_percent: Number(formData.discount_percent),
            stock,
            status,
            image: formData.imagePreview || '',
        };

        setProducts(prev => [newProduct, ...prev]);
        setIsSubmitting(false);
        handleCloseModal();

        Swal.fire({
            icon: 'success',
            title: 'Product Added!',
            text: `"${formData.name}" has been added to inventory.`,
            background: '#1a1f2e',
            color: '#fff',
            confirmButtonColor: '#4ecdc4',
            timer: 2500,
            showConfirmButton: false,
        });
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setFormData(EMPTY_FORM);
        setErrors({});
    };

    // ── Delete ────────────────────────────────────────────────────
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Remove Product?',
            text: 'This product will be permanently removed from inventory.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove',
            background: '#1a1f2e',
            color: '#fff',
        }).then((result) => {
            if (result.isConfirmed) {
                setProducts(prev => prev.filter(p => p.id !== id));
                Swal.fire({ icon: 'success', title: 'Removed!', text: 'Product deleted.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4', timer: 2000, showConfirmButton: false });
            }
        });
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="inventory-management">

            {/* Header */}
            <div className="im-header">
                <div>
                    <h2 className="im-title">Inventory &amp; Products</h2>
                    <p className="im-subtitle">Manage stock levels, prices, and product details</p>
                </div>
                <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Toolbar */}
            <div className="im-toolbar">
                <div className="im-filter-group">
                    <div className="search-box">
                        <Search size={16} />
                        <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="select-wrapper">
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-arrow" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="im-table-container">
                <table className="im-table">
                    <thead>
                        <tr>
                            <th>Product Info</th>
                            <th>Category</th>
                            <th>Price (LKR)</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const { color, Icon, bg } = getStockStyle(product.status);
                            const salePrice = getSalePrice(product.price, product.discount_percent);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-img">
                                                <img src={product.image} alt={product.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                <div className="img-placeholder" style={{ display: 'none' }}>{product.name[0]}</div>
                                            </div>
                                            <div>
                                                <div className="product-name">{product.name}</div>
                                                <div className="product-id">{product.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{product.category}</span>
                                    </td>
                                    <td>
                                        <div className="price-cell">
                                            {salePrice ? (
                                                <>
                                                    <span className="price-original">{product.price.toLocaleString()}</span>
                                                    <span className="price-sale">{Number(salePrice).toLocaleString()}</span>
                                                    <span className="discount-tag">-{product.discount_percent}%</span>
                                                </>
                                            ) : (
                                                <span className="price-normal">{product.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{product.stock}</span>
                                        <span className="stock-unit"> units</span>
                                    </td>
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: bg, color }}>
                                            <Icon size={13} style={{ marginRight: 4 }} /> {product.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" title="Edit"><Edit size={15} /></button>
                                            <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(product.id)}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* ADD PRODUCT MODAL                                  */}
            {/* ══════════════════════════════════════════════════ */}
            {showAddModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="ap-modal-header">
                            <div>
                                <h3>Add New Product</h3>
                                <p>Fill in the details to add a product to inventory</p>
                            </div>
                            <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
                        </div>

                        <div className="ap-modal-body">

                            {/* Image Upload */}
                            <div className="image-upload-section">
                                <div className="image-preview-box" onClick={() => document.getElementById('product-image-input').click()}>
                                    {formData.imagePreview ? (
                                        <img src={formData.imagePreview} alt="Preview" className="image-preview-img" />
                                    ) : (
                                        <div className="image-placeholder">
                                            <Image size={32} color="var(--text-muted)" />
                                            <span>Click to upload image</span>
                                            <span className="image-hint">PNG, JPG up to 5MB</span>
                                        </div>
                                    )}
                                </div>
                                <input id="product-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            </div>

                            {/* Product Name */}
                            <div className="ap-form-group">
                                <label><FileText size={13} /> Product Name <span className="required"></span></label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Goldfish (Medium)"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'input-error' : ''}
                                    maxLength={100}
                                />
                                {errors.name && <span className="error-msg">{errors.name}</span>}
                            </div>

                            {/* Category */}
                            <div className="ap-form-group">
                                <label><Tag size={13} /> Category <span className="required"></span></label>
                                <div className="select-wrap-full">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={errors.category ? 'input-error' : ''}
                                    >
                                        <option value="">-- Select a Category --</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="sel-arrow" />
                                </div>
                                {errors.category && <span className="error-msg">{errors.category}</span>}
                            </div>

                            {/* Description */}
                            <div className="ap-form-group">
                                <label><FileText size={13} /> Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Describe the product (species, care instructions, specifications...)"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Price + Discount */}
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label><DollarSign size={13} /> Price (LKR) <span className="required"></span></label>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={errors.price ? 'input-error' : ''}
                                    />
                                    {errors.price && <span className="error-msg">{errors.price}</span>}
                                </div>
                                <div className="ap-form-group">
                                    <label><Percent size={13} /> Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount_percent"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.discount_percent}
                                        onChange={handleChange}
                                        className={errors.discount_percent ? 'input-error' : ''}
                                    />
                                    {errors.discount_percent && <span className="error-msg">{errors.discount_percent}</span>}
                                </div>
                            </div>

                            {/* Sale Price Preview */}
                            {formData.price && Number(formData.discount_percent) > 0 && (
                                <div className="sale-preview">
                                    <span>Sale Price:</span>
                                    <strong>LKR {(Number(formData.price) - (Number(formData.price) * Number(formData.discount_percent) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    <span className="sale-badge">-{formData.discount_percent}% OFF</span>
                                </div>
                            )}

                            {/* Stock Quantity + Supplier */}
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label><Layers size={13} /> Stock Quantity <span className="required"></span></label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        placeholder="0"
                                        min="0"
                                        step="1"
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        className={errors.stock_quantity ? 'input-error' : ''}
                                    />
                                    {errors.stock_quantity && <span className="error-msg">{errors.stock_quantity}</span>}
                                </div>
                                <div className="ap-form-group">
                                    <label><User size={13} /> Supplier</label>
                                    <div className="select-wrap-full">
                                        <select name="supplier_id" value={formData.supplier_id} onChange={handleChange}>
                                            <option value="">-- No Supplier --</option>
                                            {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="sel-arrow" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="ap-modal-footer">
                            <button className="btn-cancel-modal" onClick={handleCloseModal} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button className="btn-save-product" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><span className="spinner" /> Saving...</>
                                ) : (
                                    <><Plus size={16} /> Add Product</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .inventory-management { display: flex; flex-direction: column; gap: 0; }

                /* Header */
                .im-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .im-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.25rem; }
                .im-subtitle { color: var(--text-muted); font-size: 0.95rem; }

                .btn-add-product {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: var(--color-primary); color: #000;
                    border: none; padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-add-product:hover { transform: translateY(-1px); opacity: 0.9; box-shadow: 0 4px 15px rgba(78,205,196,0.3); }

                /* Toolbar */
                .im-toolbar {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 1rem; border-radius: 1rem; margin-bottom: 1.5rem;
                }
                .im-filter-group { display: flex; gap: 1rem; }

                .search-box {
                    display: flex; align-items: center;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem; padding: 0 0.75rem;
                    color: var(--text-muted); flex: 1; max-width: 350px;
                }
                .search-box input { background: transparent; border: none; padding: 0.6rem; color: var(--text-main); width: 100%; outline: none; }

                .select-wrapper { position: relative; }
                .select-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }
                .select-wrapper select {
                    appearance: none; background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem;
                    padding: 0.6rem 2rem 0.6rem 1rem; color: var(--text-main);
                    cursor: pointer; outline: none; min-width: 180px;
                }

                /* Table */
                .im-table-container {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem; overflow: hidden;
                }
                .im-table { width: 100%; border-collapse: collapse; }
                .im-table th {
                    text-align: left; padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02); color: var(--text-muted);
                    font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .im-table td {
                    padding: 0.9rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: var(--text-main);
                }
                .im-table tbody tr:hover { background: rgba(255,255,255,0.02); }

                .product-cell { display: flex; align-items: center; gap: 1rem; }
                .product-img {
                    width: 46px; height: 46px; border-radius: 8px; overflow: hidden;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    flex-shrink: 0;
                }
                .product-img img { width: 100%; height: 100%; object-fit: cover; }
                .img-placeholder {
                    width: 100%; height: 100%; display: flex;
                    align-items: center; justify-content: center;
                    font-weight: 700; color: var(--color-primary); font-size: 1.1rem;
                }
                .product-name { font-weight: 600; color: var(--text-main); }
                .product-id { font-size: 0.78rem; color: var(--color-primary); font-family: monospace; margin-top: 2px; }

                .category-badge {
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem 0.75rem; border-radius: 50px;
                    font-size: 0.82rem; color: var(--text-muted);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .price-cell { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
                .price-normal { font-weight: 700; font-family: monospace; }
                .price-original { font-family: monospace; text-decoration: line-through; color: var(--text-muted); font-size: 0.85rem; }
                .price-sale { font-weight: 700; color: #4ade80; font-family: monospace; }
                .discount-tag { background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.72rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; }

                .stock-unit { font-size: 0.8rem; color: var(--text-muted); }

                .status-badge {
                    display: inline-flex; align-items: center;
                    padding: 0.3rem 0.7rem; border-radius: 50px;
                    font-size: 0.8rem; font-weight: 600;
                }

                .action-buttons { display: flex; gap: 0.5rem; }
                .btn-icon {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; transition: all 0.2s;
                }
                .btn-icon.edit { background: rgba(59,130,246,0.1); color: #3b82f6; }
                .btn-icon.delete { background: rgba(239,68,68,0.1); color: #ef4444; }
                .btn-icon:hover { transform: scale(1.1); }

                /* ── ADD PRODUCT MODAL ─────────────────────── */
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.75); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 200; padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .ap-modal {
                    background: #1a1f2e;
                    border: 1px solid rgba(78,205,196,0.2);
                    border-radius: 16px; width: 100%; max-width: 580px;
                    max-height: 92vh; overflow-y: auto;
                    display: flex; flex-direction: column;
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .ap-modal-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .ap-modal-header h3 { margin: 0 0 3px; color: var(--text-main); font-size: 1.15rem; font-weight: 700; }
                .ap-modal-header p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }

                .modal-close-btn {
                    background: rgba(255,255,255,0.08); border: none;
                    color: var(--text-muted); width: 30px; height: 30px;
                    border-radius: 50%; cursor: pointer; font-size: 0.8rem; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .modal-close-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; }

                .ap-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }

                /* Image Upload */
                .image-upload-section { display: flex; justify-content: center; }
                .image-preview-box {
                    width: 100%; height: 160px;
                    background: rgba(255,255,255,0.03);
                    border: 2px dashed rgba(255,255,255,0.12);
                    border-radius: 12px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; transition: border-color 0.2s;
                }
                .image-preview-box:hover { border-color: var(--color-primary); }
                .image-placeholder {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 6px; color: var(--text-muted);
                }
                .image-placeholder span { font-size: 0.88rem; }
                .image-hint { font-size: 0.75rem !important; opacity: 0.6; }
                .image-preview-img { width: 100%; height: 100%; object-fit: cover; }

                /* Form Fields */
                .ap-form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .ap-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .ap-form-group label {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 0.85rem; color: var(--text-muted); font-weight: 500;
                }
                .required { color: #f87171; }

                .ap-form-group input,
                .ap-form-group textarea,
                .ap-form-group select {
                    width: 100%; padding: 0.7rem 0.9rem;
                    background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px; color: var(--text-main);
                    font-size: 0.92rem; outline: none; transition: border-color 0.2s;
                    box-sizing: border-box; font-family: inherit;
                }
                .ap-form-group input:focus,
                .ap-form-group textarea:focus,
                .ap-form-group select:focus { border-color: var(--color-primary); }
                .input-error { border-color: #f87171 !important; }

                .ap-form-group textarea { resize: vertical; min-height: 80px; }

                .select-wrap-full { position: relative; }
                .select-wrap-full select { appearance: none; cursor: pointer; padding-right: 2rem; }
                .sel-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }

                .error-msg { font-size: 0.78rem; color: #f87171; margin-top: 1px; }

                /* Sale Preview */
                .sale-preview {
                    display: flex; align-items: center; gap: 10px;
                    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
                    border-radius: 8px; padding: 0.65rem 1rem;
                    font-size: 0.88rem; color: var(--text-muted);
                }
                .sale-preview strong { color: #4ade80; font-size: 1rem; }
                .sale-badge { background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }

                /* Modal Footer */
                .ap-modal-footer {
                    display: flex; gap: 0.75rem;
                    padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08);
                }
                .btn-cancel-modal {
                    flex: 1; padding: 0.75rem; background: transparent;
                    border: 1px solid rgba(255,255,255,0.12); color: var(--text-muted);
                    border-radius: 8px; cursor: pointer; transition: all 0.2s;
                    font-size: 0.92rem;
                }
                .btn-cancel-modal:hover { border-color: rgba(255,255,255,0.3); color: var(--text-main); }
                .btn-cancel-modal:disabled { opacity: 0.5; cursor: not-allowed; }

                .btn-save-product {
                    flex: 2; padding: 0.75rem; display: flex;
                    align-items: center; justify-content: center; gap: 7px;
                    background: linear-gradient(135deg, var(--color-primary), #38a89d);
                    border: none; color: #000; border-radius: 8px;
                    font-weight: 700; font-size: 0.95rem; cursor: pointer;
                    transition: all 0.2s; box-shadow: 0 4px 15px rgba(78,205,196,0.25);
                }
                .btn-save-product:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(78,205,196,0.35); }
                .btn-save-product:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                .spinner {
                    width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3);
                    border-top-color: #000; border-radius: 50%;
                    animation: spin 0.7s linear infinite; display: inline-block;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 640px) {
                    .ap-form-row { grid-template-columns: 1fr; }
                    .ap-modal { max-width: 100%; border-radius: 16px 16px 0 0; margin-top: auto; }
                }
            `}</style>
        </div>
    );
};

export default InventoryManagement;
