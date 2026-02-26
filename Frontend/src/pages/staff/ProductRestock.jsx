import React, { useState, useEffect } from 'react';
import {
    AlertTriangle, RefreshCw, Package, User,
    DollarSign, Layers, FileText, CalendarDays,
    CheckCircle, XCircle, Send, X, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:5001/api';

const getStockStyle = (qty) => {
    if (qty === 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Out of Stock' };
    if (qty <= 5) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Critical' };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Low Stock' };
};

const EMPTY_MODAL = {
    quantity: '',
    supplier_id: '',
    unit_cost: '',
    notes: '',
    expected_date: '',
};

const ProductRestock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSuppliers, setProductSuppliers] = useState([]);
    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_MODAL);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const token = () => localStorage.getItem('auth_token');

    // ── Fetch low-stock products ──────────────────────────────────
    const fetchLowStock = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/products/low-stock`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const json = await res.json();
            if (json.success) setProducts(json.data);
        } catch (err) {
            console.error('Failed to fetch low-stock products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLowStock(); }, []);

    // ── Fetch suppliers for a specific product (with fallback) ─────
    const fetchProductSuppliers = async (product) => {
        setSuppliersLoading(true);
        const makeFallback = () => product.supplier_id
            ? [{ supplier_id: product.supplier_id, company_name: product.supplier_name, user_name: product.supplier_name, is_primary: true, supply_price: null }]
            : [];
        try {
            const res = await fetch(`${API}/products/${product.product_id}/suppliers`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const json = await res.json();
            const list = json.success ? json.data : [];
            // If bridge table has no rows, fall back to the product's direct supplier
            setProductSuppliers(list.length > 0 ? list : makeFallback());
        } catch (err) {
            console.error('Failed to fetch product suppliers:', err);
            setProductSuppliers(makeFallback());
        } finally {
            setSuppliersLoading(false);
        }
    };

    // ── Open modal ────────────────────────────────────────────────
    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setForm(EMPTY_MODAL);
        setErrors({});
        setProductSuppliers([]);
        setShowModal(true);
        fetchProductSuppliers(product);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setProductSuppliers([]);
        setForm(EMPTY_MODAL);
        setErrors({});
    };

    // ── When supplier changes pre-fill unit_cost from supply_price ─
    const handleSupplierChange = (e) => {
        const suppId = e.target.value;
        const matched = productSuppliers.find(s => String(s.supplier_id) === suppId);
        setForm(prev => ({
            ...prev,
            supplier_id: suppId,
            unit_cost: matched?.supply_price ? String(matched.supply_price) : prev.unit_cost,
        }));
        if (errors.supplier_id) setErrors(prev => ({ ...prev, supplier_id: '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // ── Validate ──────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.quantity || Number(form.quantity) < 1) e.quantity = 'Enter a quantity of at least 1.';
        if (!form.supplier_id) e.supplier_id = 'Please select a supplier.';
        if (form.unit_cost === '' || Number(form.unit_cost) < 0) e.unit_cost = 'Enter a valid unit cost (0 or more).';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({
                    product_id: selectedProduct.product_id,
                    supplier_id: form.supplier_id,
                    quantity: form.quantity,
                    unit_cost: form.unit_cost,
                    notes: form.notes || null,
                    expected_date: form.expected_date || null,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to submit request.');

            handleCloseModal();
            Swal.fire({
                icon: 'success',
                title: 'Request Submitted!',
                text: `Restock request for "${selectedProduct.name}" has been sent to the supplier.`,
                background: '#1a1f2e', color: '#fff',
                confirmButtonColor: '#4ecdc4',
                timer: 3000, showConfirmButton: false,
            });
            fetchLowStock();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1a1f2e', color: '#fff', confirmButtonColor: '#ef4444' });
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pr-wrap">
            {/* ── Header ── */}
            <div className="pr-header">
                <div>
                    <h2 className="pr-title">
                        <AlertTriangle size={22} style={{ color: '#f59e0b', marginRight: 8 }} />
                        Product Restock
                    </h2>
                    <p className="pr-subtitle">Low-stock products that need restocking from suppliers</p>
                </div>
                <button className="pr-refresh-btn" onClick={fetchLowStock} title="Refresh">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* ── Search ── */}
            <div className="pr-toolbar">
                <div className="pr-search">
                    <Package size={16} />
                    <input
                        type="text"
                        placeholder="Search product or category…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="pr-count-badge">
                    <AlertTriangle size={14} />
                    {products.length} items need attention
                </div>
            </div>

            {/* ── Table ── */}
            <div className="pr-table-wrap">
                {loading ? (
                    <div className="pr-loading">
                        <span className="pr-spinner" />
                        Loading low-stock products…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="pr-empty">
                        <CheckCircle size={48} style={{ color: '#10b981', marginBottom: 12 }} />
                        <p>{searchTerm ? 'No products match your search.' : 'All products are well-stocked!'}</p>
                    </div>
                ) : (
                    <table className="pr-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Status</th>
                                <th>Primary Supplier</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const style = getStockStyle(p.stock_quantity);
                                return (
                                    <tr key={p.product_id}>
                                        <td>
                                            <div className="pr-product-cell">
                                                <div className="pr-product-img">
                                                    {p.image_url
                                                        ? <img src={`http://localhost:5001${p.image_url}`} alt={p.name} />
                                                        : <span>{p.name[0]}</span>}
                                                </div>
                                                <div>
                                                    <div className="pr-product-name">{p.name}</div>
                                                    <div className="pr-product-id">#{p.product_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="pr-category">{p.category}</span></td>
                                        <td>
                                            <span className="pr-stock-qty" style={{ color: style.color }}>
                                                {p.stock_quantity} units
                                            </span>
                                        </td>
                                        <td>
                                            <span className="pr-status-badge" style={{ color: style.color, background: style.bg }}>
                                                {p.stock_quantity === 0 ? <XCircle size={13} /> : <AlertTriangle size={13} />}
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="pr-supplier-cell">
                                            {p.supplier_name || <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>— Not assigned —</span>}
                                        </td>
                                        <td>
                                            <button
                                                className="pr-request-btn"
                                                onClick={() => handleOpenModal(p)}
                                            >
                                                <Send size={14} />
                                                Request Restock
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ══════════════════ RESTOCK REQUEST MODAL ══════════════════ */}
            {showModal && selectedProduct && (
                <div className="pr-modal-overlay" onClick={e => e.target === e.currentTarget && handleCloseModal()}>
                    <div className="pr-modal">

                        {/* Modal Header */}
                        <div className="pr-modal-header">
                            <div>
                                <h3 className="pr-modal-title">
                                    <Send size={17} style={{ color: '#4ecdc4' }} /> Request Restock
                                </h3>
                                <p className="pr-modal-subtitle">
                                    Submitting for: <strong style={{ color: '#f1f5f9' }}>{selectedProduct.name}</strong>
                                </p>
                            </div>
                            <button className="pr-modal-close" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Info Banner */}
                        <div className="pr-info-banner">
                            <div className="pr-info-item">
                                <span className="pr-info-label">Category</span>
                                <span className="pr-info-value">{selectedProduct.category}</span>
                            </div>
                            <div className="pr-info-divider" />
                            <div className="pr-info-item">
                                <span className="pr-info-label">Current Stock</span>
                                <span className="pr-info-value" style={{ color: getStockStyle(selectedProduct.stock_quantity).color }}>
                                    {selectedProduct.stock_quantity} units
                                </span>
                            </div>
                            <div className="pr-info-divider" />
                            <div className="pr-info-item">
                                <span className="pr-info-label">Unit Price</span>
                                <span className="pr-info-value">LKR {Number(selectedProduct.price).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="pr-modal-body">

                            {/* Quantity */}
                            <div className="pr-form-group">
                                <label><Layers size={13} /> Restock Quantity <span className="pr-required"></span></label>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="How many units to order?"
                                    min="1"
                                    step="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className={errors.quantity ? 'pr-input-error' : ''}
                                    autoFocus
                                />
                                {errors.quantity && <span className="pr-error-msg">{errors.quantity}</span>}
                            </div>

                            {/* Supplier */}
                            <div className="pr-form-group">
                                <label><User size={13} /> Select Supplier <span className="pr-required"></span></label>
                                {suppliersLoading ? (
                                    <div className="pr-suppliers-loading"><span className="pr-spinner-sm" /> Loading suppliers…</div>
                                ) : productSuppliers.length === 0 ? (
                                    <div className="pr-no-suppliers">
                                        <AlertTriangle size={14} />
                                        No suppliers linked to this product. Please assign one first via Inventory.
                                    </div>
                                ) : (
                                    <div className="pr-select-wrap">
                                        <select
                                            name="supplier_id"
                                            value={form.supplier_id}
                                            onChange={handleSupplierChange}
                                            className={errors.supplier_id ? 'pr-input-error' : ''}
                                        >
                                            <option value="">— Choose a supplier —</option>
                                            {productSuppliers.map(s => (
                                                <option key={s.supplier_id} value={s.supplier_id}>
                                                    {s.company_name || s.user_name}
                                                    {s.is_primary ? ' ★ Primary' : ''}
                                                    {s.supply_price ? ` — LKR ${Number(s.supply_price).toLocaleString()}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="pr-sel-arrow" />
                                    </div>
                                )}
                                {errors.supplier_id && <span className="pr-error-msg">{errors.supplier_id}</span>}
                            </div>

                            {/* Unit Cost */}
                            <div className="pr-form-group">
                                <label><DollarSign size={13} /> Unit Cost (LKR) <span className="pr-required"></span></label>
                                <input
                                    type="number"
                                    name="unit_cost"
                                    placeholder="Cost per unit from supplier"
                                    min="0"
                                    step="0.01"
                                    value={form.unit_cost}
                                    onChange={handleChange}
                                    className={errors.unit_cost ? 'pr-input-error' : ''}
                                />
                                {errors.unit_cost && <span className="pr-error-msg">{errors.unit_cost}</span>}
                                {form.quantity && form.unit_cost && (
                                    <span className="pr-total-hint">
                                        Total: LKR {(Number(form.quantity) * Number(form.unit_cost)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                )}
                            </div>

                            {/* Expected Date + Notes row */}
                            <div className="pr-form-row">
                                <div className="pr-form-group">
                                    <label><CalendarDays size={13} /> Expected Delivery Date</label>
                                    <input
                                        type="date"
                                        name="expected_date"
                                        value={form.expected_date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="pr-form-group">
                                    <label><FileText size={13} /> Notes (Optional)</label>
                                    <input
                                        type="text"
                                        name="notes"
                                        placeholder="e.g. Urgent – holiday season"
                                        value={form.notes}
                                        onChange={handleChange}
                                        maxLength={200}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="pr-modal-footer">
                            <button className="pr-btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                                Cancel
                            </button>
                            <button
                                className="pr-btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting || productSuppliers.length === 0}
                            >
                                {submitting ? (
                                    <><span className="pr-spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Submitting…</>
                                ) : (
                                    <><Send size={15} /> Submit Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .pr-wrap { display: flex; flex-direction: column; gap: 0; }

                /* Header */
                .pr-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 1.5rem;
                }
                .pr-title {
                    font-size: 1.75rem; font-weight: 700; color: var(--text-main);
                    margin: 0 0 0.25rem; display: flex; align-items: center;
                }
                .pr-subtitle { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
                .pr-refresh-btn {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-muted); padding: 0.6rem 1rem; border-radius: 0.5rem;
                    cursor: pointer; font-size: 0.875rem; transition: all 0.2s;
                }
                .pr-refresh-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-main); }

                /* Toolbar */
                .pr-toolbar {
                    display: flex; align-items: center; gap: 1rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    padding: 0.875rem 1rem; border-radius: 0.75rem; margin-bottom: 1.25rem;
                }
                .pr-search {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem; padding: 0.5rem 0.75rem; flex: 1; max-width: 360px;
                    color: var(--text-muted);
                }
                .pr-search input {
                    background: transparent; border: none; outline: none;
                    color: var(--text-main); width: 100%; font-size: 0.9rem;
                }
                .pr-count-badge {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
                    color: #f59e0b; padding: 0.4rem 0.875rem; border-radius: 50px;
                    font-size: 0.82rem; font-weight: 600; margin-left: auto;
                }

                /* Table */
                .pr-table-wrap {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem; overflow-x: auto;
                }
                .pr-table { width: 100%; border-collapse: collapse; min-width: 750px; }
                .pr-table th {
                    text-align: left; padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02); color: var(--text-muted);
                    font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .pr-table td {
                    padding: 0.9rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: var(--text-main);
                }
                .pr-table tbody tr:last-child td { border-bottom: none; }
                .pr-table tbody tr:hover { background: rgba(255,255,255,0.02); }

                .pr-product-cell { display: flex; align-items: center; gap: 0.875rem; }
                .pr-product-img {
                    width: 42px; height: 42px; border-radius: 8px; overflow: hidden;
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; color: var(--color-primary); font-size: 1rem; flex-shrink: 0;
                }
                .pr-product-img img { width: 100%; height: 100%; object-fit: cover; }
                .pr-product-name { font-weight: 600; font-size: 0.92rem; }
                .pr-product-id { font-size: 0.75rem; color: var(--color-primary); font-family: monospace; }
                .pr-category {
                    background: rgba(255,255,255,0.05); padding: 0.2rem 0.65rem;
                    border-radius: 50px; font-size: 0.8rem; color: var(--text-muted);
                }
                .pr-stock-qty { font-weight: 700; font-size: 0.95rem; }
                .pr-status-badge {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.25rem 0.65rem; border-radius: 50px;
                    font-size: 0.8rem; font-weight: 600;
                }
                .pr-supplier-cell { font-size: 0.88rem; color: var(--text-muted); }
                .pr-request-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: var(--color-primary);
                    color: #fff; border: none; padding: 0.5rem 1rem;
                    border-radius: 0.5rem; font-size: 0.82rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .pr-request-btn:hover { background: var(--color-primary-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(6,182,212,0.3); }

                /* Loading / Empty */
                .pr-loading, .pr-empty {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; padding: 4rem 2rem; gap: 0.75rem;
                    color: var(--text-muted); font-size: 0.95rem;
                }
                .pr-spinner {
                    display: inline-block; width: 28px; height: 28px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #4ecdc4; border-radius: 50%;
                    animation: pr-spin 0.7s linear infinite;
                }
                @keyframes pr-spin { to { transform: rotate(360deg); } }

                /* ── MODAL ── */
                .pr-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px); display: flex; align-items: center;
                    justify-content: center; z-index: 1000; padding: 1rem;
                }
                .pr-modal {
                    background: #1a1f2e; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1rem; width: 100%; max-width: 520px;
                    max-height: 92vh; overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                    display: flex; flex-direction: column;
                }
                .pr-modal-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .pr-modal-title {
                    font-size: 1.1rem; font-weight: 700; color: var(--text-main);
                    margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem;
                }
                .pr-modal-subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
                .pr-modal-close {
                    background: none; border: none; color: var(--text-muted);
                    cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s;
                    display: flex; align-items: center;
                }
                .pr-modal-close:hover { color: var(--text-main); }

                /* Info Banner */
                .pr-info-banner {
                    display: flex; align-items: center; gap: 0;
                    background: rgba(78,205,196,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);
                    padding: 0.875rem 1.5rem;
                }
                .pr-info-item { display: flex; flex-direction: column; gap: 2px; flex: 1; }
                .pr-info-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                .pr-info-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
                .pr-info-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.08); margin: 0 1rem; flex-shrink: 0; }

                /* Modal Body */
                .pr-modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .pr-form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .pr-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .pr-form-group label {
                    font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
                    display: flex; align-items: center; gap: 0.35rem; text-transform: uppercase; letter-spacing: 0.04em;
                }
                .pr-required { color: #ef4444; }
                .pr-form-group input, .pr-select-wrap select {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 0.5rem; padding: 0.6rem 0.875rem; color: var(--text-main);
                    font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .pr-form-group input:focus, .pr-select-wrap select:focus { border-color: #4ecdc4; }
                .pr-form-group input.pr-input-error { border-color: #ef4444; }
                .pr-select-wrap select.pr-input-error { border-color: #ef4444; }
                .pr-form-group input[type="date"] { color-scheme: dark; }
                .pr-select-wrap { position: relative; }
                .pr-select-wrap select { appearance: none; padding-right: 2rem; cursor: pointer; }
                .pr-sel-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }
                .pr-error-msg { font-size: 0.78rem; color: #ef4444; margin-top: 2px; }
                .pr-total-hint {
                    font-size: 0.8rem; color: #4ecdc4; font-weight: 600; margin-top: 2px;
                }
                .pr-suppliers-loading {
                    display: flex; align-items: center; gap: 0.5rem;
                    color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;
                }
                .pr-spinner-sm {
                    display: inline-block; width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.15);
                    border-top-color: #4ecdc4; border-radius: 50%;
                    animation: pr-spin 0.7s linear infinite;
                }
                .pr-no-suppliers {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
                    color: #f59e0b; border-radius: 0.5rem; padding: 0.6rem 0.875rem;
                    font-size: 0.84rem;
                }
                .pr-select-wrap select option { background: #1e293b; color: #f1f5f9; }

                /* Modal Footer */
                .pr-modal-footer {
                    display: flex; justify-content: flex-end; gap: 0.75rem;
                    padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08);
                }
                .pr-btn-cancel {
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
                    color: var(--text-muted); padding: 0.6rem 1.25rem; border-radius: 0.5rem;
                    cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
                }
                .pr-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: var(--text-main); }
                .pr-btn-submit {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: var(--color-primary);
                    color: #fff; border: none; padding: 0.6rem 1.4rem;
                    border-radius: 0.5rem; font-size: 0.9rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s;
                }
                .pr-btn-submit:hover:not(:disabled) { background: var(--color-primary-dark); transform: translateY(-1px); box-shadow: 0 4px 15px rgba(6,182,212,0.3); }
                .pr-btn-submit:disabled, .pr-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

                @media (max-width: 640px) {
                    .pr-form-row { grid-template-columns: 1fr; }
                    .pr-info-banner { flex-wrap: wrap; gap: 0.75rem; }
                    .pr-info-divider { display: none; }
                }
            `}</style>
        </div>
    );
};

export default ProductRestock;
