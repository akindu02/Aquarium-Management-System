
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, CheckCircle, XCircle, Clock, Download,
    RefreshCw, Package, Banknote, Layers, User, CalendarDays,
    FileText, Eye, X, ChevronDown, Hourglass, Truck, AlertCircle
} from 'lucide-react';
import { getSupplierOrderHistoryAPI } from '../../utils/supplier';

const STATUS_CONFIG = {
    Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.13)',  Icon: Hourglass,    label: 'Pending'   },
    Approved:  { color: '#10b981', bg: 'rgba(16,185,129,0.13)',  Icon: CheckCircle,  label: 'Approved'  },
    Rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.13)',   Icon: XCircle,      label: 'Rejected'  },
    Ordered:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.13)',  Icon: Truck,        label: 'Ordered'   },
    Received:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.13)', Icon: CheckCircle,  label: 'Received'  },
    Cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.13)', Icon: XCircle,      label: 'Cancelled' },
};

const ALL_STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Ordered', 'Received', 'Cancelled'];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCur = (v) => v != null ? `LKR ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

const SupplierOrderHistory = () => {
    const [rawOrders, setRawOrders]     = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [searchTerm, setSearchTerm]   = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSupplierOrderHistoryAPI();
            if (res.success) setRawOrders(res.data);
            else setError(res.message || 'Failed to fetch order history.');
        } catch (err) {
            setError(err.message || 'Failed to fetch order history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const orders = rawOrders.map(row => ({
        id:           `REQ-${String(row.request_id).padStart(4, '0')}`,
        rawId:        row.request_id,
        productName:  row.product_name  || '—',
        productCat:   row.product_category || '—',
        imageUrl:     row.image_url,
        quantity:     row.quantity,
        unitCost:     row.unit_cost,
        totalCost:    row.total_cost,
        staffName:    row.staff_name    || '—',
        status:       row.status        || 'Pending',
        requestedAt:  row.requested_at,
        updatedAt:    row.updated_at,
        expectedDate: row.expected_date,
        notes:        row.notes,
        currentStock: row.current_stock,
    }));

    const filtered = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const matchSearch = !term ||
            o.id.toLowerCase().includes(term) ||
            o.productName.toLowerCase().includes(term) ||
            o.productCat.toLowerCase().includes(term) ||
            (o.staffName || '').toLowerCase().includes(term);
        const matchStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── Summary stats ──────────────────────────────────────────────
    const stats = [
        { label: 'Total Requests', value: orders.length, color: '#4ecdc4', Icon: Package },
        { label: 'Pending',  value: orders.filter(o => o.status === 'Pending').length,  color: '#f59e0b', Icon: Hourglass   },
        { label: 'Approved', value: orders.filter(o => o.status === 'Approved').length, color: '#10b981', Icon: CheckCircle },
        { label: 'Rejected', value: orders.filter(o => o.status === 'Rejected').length, color: '#ef4444', Icon: XCircle     },
        { label: 'Received', value: orders.filter(o => o.status === 'Received').length, color: '#a78bfa', Icon: Truck       },
    ];

    // ── CSV export ─────────────────────────────────────────────────
    const exportCSV = () => {
        const cols = ['Order ID','Product','Category','Qty','Unit Cost (LKR)','Total (LKR)','Requested By','Status','Requested On','Expected By','Resolved On','Notes'];
        const rows = filtered.map(o => [
            o.id, o.productName, o.productCat, o.quantity,
            o.unitCost != null ? Number(o.unitCost).toFixed(2) : '',
            o.totalCost != null ? Number(o.totalCost).toFixed(2) : '',
            o.staffName, o.status,
            o.requestedAt ? new Date(o.requestedAt).toISOString().split('T')[0] : '',
            o.expectedDate ? new Date(o.expectedDate).toISOString().split('T')[0] : '',
            o.updatedAt ? new Date(o.updatedAt).toISOString().split('T')[0] : '',
            o.notes || '',
        ]);
        const csv = [cols, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'order_history.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="oh-wrap">
            {/* ── Header ── */}
            <div className="oh-header">
                <div>
                    <h2 className="oh-title">Order History</h2>
                    <p className="oh-subtitle">Full history of all restock requests assigned to you</p>
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button className="oh-btn-refresh" onClick={fetchOrders}><RefreshCw size={15} /> Refresh</button>
                    <button className="oh-btn-export" onClick={exportCSV}><Download size={15} /> Export CSV</button>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="oh-stats-row">
                {stats.map(s => (
                    <div key={s.label} className="oh-stat-card">
                        <div className="oh-stat-icon" style={{ background:`${s.color}1a`, color: s.color }}><s.Icon size={18} /></div>
                        <div>
                            <div className="oh-stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="oh-stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="oh-toolbar">
                <div className="oh-search">
                    <Search size={16} />
                    <input placeholder="Search ID, product, category, staff…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="oh-select-wrap">
                    <Filter size={14} style={{ color:'rgba(255,255,255,0.4)', flexShrink:0 }} />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                    </select>
                    <ChevronDown size={13} className="oh-sel-arrow" />
                </div>
                <span className="oh-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── Table ── */}
            <div className="oh-table-wrapper">
                {loading ? (
                    <div className="oh-state"><span className="oh-spinner" /> Loading order history…</div>
                ) : error ? (
                    <div className="oh-state" style={{ color:'#ef4444' }}><AlertCircle size={20} /> {error}</div>
                ) : filtered.length === 0 ? (
                    <div className="oh-state"><Package size={48} style={{ color:'rgba(255,255,255,0.15)', marginBottom:'0.75rem' }} /><span>No records found.</span></div>
                ) : (
                    <table className="oh-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Qty</th>
                                <th>Unit Cost</th>
                                <th>Total Value</th>
                                <th>Requested By</th>
                                <th>Requested On</th>
                                <th>Expected By</th>
                                <th>Resolved On</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => {
                                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                                return (
                                    <tr key={order.rawId}>
                                        <td className="oh-mono">{order.id}</td>
                                        <td>
                                            <div className="oh-product-cell">
                                                <div className="oh-thumb">
                                                    {order.imageUrl
                                                        ? <img src={`http://localhost:5001${order.imageUrl}`} alt={order.productName} />
                                                        : <span>{order.productName[0]}</span>}
                                                </div>
                                                <span className="oh-product-name">{order.productName}</span>
                                            </div>
                                        </td>
                                        <td><span className="oh-cat-badge">{order.productCat}</span></td>
                                        <td className="oh-qty">{order.quantity} <span className="oh-unit">units</span></td>
                                        <td className="oh-muted">{fmtCur(order.unitCost)}</td>
                                        <td className="oh-total">{fmtCur(order.totalCost)}</td>
                                        <td className="oh-muted">{order.staffName}</td>
                                        <td className="oh-muted">{fmt(order.requestedAt)}</td>
                                        <td className="oh-muted">{fmt(order.expectedDate)}</td>
                                        <td className="oh-muted">{fmt(order.updatedAt)}</td>
                                        <td>
                                            <span className="oh-status-badge" style={{ color: s.color, background: s.bg }}>
                                                <s.Icon size={12} /> {s.label}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="oh-btn-view" title="View Details" onClick={() => setSelectedOrder(order)}>
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {selectedOrder && (() => {
                const s = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.Pending;
                return (
                    <div className="oh-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="oh-modal" onClick={e => e.stopPropagation()}>
                            {/* Modal header */}
                            <div className="oh-modal-header">
                                <div>
                                    <span className="oh-modal-id">{selectedOrder.id}</span>
                                    <h3 className="oh-modal-title">Restock Request Details</h3>
                                </div>
                                <button className="oh-modal-close" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
                            </div>

                            {/* Status banner */}
                            <div className="oh-modal-banner" style={{ background: s.bg, borderColor: `${s.color}55` }}>
                                <s.Icon size={16} style={{ color: s.color }} />
                                <span style={{ color: s.color, fontWeight: 700 }}>Status: {s.label}</span>
                            </div>

                            {/* Product info */}
                            <div className="oh-modal-product">
                                <div className="oh-modal-thumb">
                                    {selectedOrder.imageUrl
                                        ? <img src={`http://localhost:5001${selectedOrder.imageUrl}`} alt={selectedOrder.productName} />
                                        : <span>{selectedOrder.productName[0]}</span>}
                                </div>
                                <div>
                                    <div className="oh-modal-pname">{selectedOrder.productName}</div>
                                    <span className="oh-cat-badge" style={{ marginTop:'0.3rem' }}>{selectedOrder.productCat}</span>
                                </div>
                            </div>

                            {/* Detail grid */}
                            <div className="oh-modal-grid">
                                {[
                                    { Icon: Layers,      label: 'Quantity',       value: `${selectedOrder.quantity} units` },
                                    { Icon: Banknote,  label: 'Unit Cost',      value: fmtCur(selectedOrder.unitCost)   },
                                    { Icon: Banknote,  label: 'Total Value',    value: fmtCur(selectedOrder.totalCost), accent: true },
                                    { Icon: Package,     label: 'Current Stock',  value: `${selectedOrder.currentStock} units` },
                                    { Icon: User,        label: 'Requested By',   value: selectedOrder.staffName          },
                                    { Icon: CalendarDays,label: 'Requested On',   value: fmt(selectedOrder.requestedAt)   },
                                    { Icon: CalendarDays,label: 'Expected By',    value: fmt(selectedOrder.expectedDate)  },
                                    { Icon: CalendarDays,label: 'Resolved On',    value: fmt(selectedOrder.updatedAt)     },
                                ].map(({ Icon, label, value, accent }) => (
                                    <div key={label} className="oh-modal-item">
                                        <div className="oh-modal-item-label"><Icon size={12} /> {label}</div>
                                        <div className="oh-modal-item-value" style={accent ? { color:'#10b981' } : {}}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="oh-modal-notes">
                                    <div className="oh-modal-item-label" style={{ marginBottom:'0.4rem' }}><FileText size={12} /> Notes</div>
                                    <p>"{selectedOrder.notes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <style>{`
                .oh-wrap { display: flex; flex-direction: column; gap: 0; }

                .oh-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
                }
                .oh-title { font-size: 1.75rem; font-weight: 700; color: #fff; margin: 0 0 0.3rem; }
                .oh-subtitle { color: rgba(255,255,255,0.5); margin: 0; font-size: 0.95rem; }

                .oh-btn-refresh, .oh-btn-export {
                    display: flex; align-items: center; gap: 0.4rem;
                    padding: 0.55rem 1rem; border-radius: 0.5rem;
                    font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
                }
                .oh-btn-refresh {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
                }
                .oh-btn-refresh:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .oh-btn-export {
                    background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.3); color: #4ecdc4;
                }
                .oh-btn-export:hover { background: rgba(78,205,196,0.18); }

                /* Stats */
                .oh-stats-row {
                    display: grid; grid-template-columns: repeat(5, 1fr);
                    gap: 1rem; margin-bottom: 1.5rem;
                }
                .oh-stat-card {
                    display: flex; align-items: center; gap: 0.875rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 0.875rem; padding: 1rem 1.25rem;
                }
                .oh-stat-icon {
                    width: 40px; height: 40px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .oh-stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; }
                .oh-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.5); margin-top: 3px; }

                /* Toolbar */
                .oh-toolbar {
                    display: flex; align-items: center; gap: 1rem;
                    margin-bottom: 1.25rem; flex-wrap: wrap;
                }
                .oh-search {
                    display: flex; align-items: center; gap: 0.6rem;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.625rem; padding: 0.55rem 0.9rem;
                    color: rgba(255,255,255,0.4); flex: 1; max-width: 380px;
                }
                .oh-search input {
                    background: transparent; border: none; outline: none;
                    color: #fff; font-size: 0.9rem; width: 100%;
                }
                .oh-select-wrap {
                    display: flex; align-items: center; gap: 0.5rem; position: relative;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.625rem; padding: 0 0.9rem; min-width: 180px;
                }
                .oh-select-wrap select {
                    background: transparent; border: none; outline: none;
                    color: #fff; padding: 0.55rem 1.5rem 0.55rem 0;
                    font-size: 0.9rem; cursor: pointer; width: 100%; appearance: none;
                }
                .oh-select-wrap select option { background: #1a1f2e; }
                .oh-sel-arrow { position: absolute; right: 0.75rem; pointer-events: none; color: rgba(255,255,255,0.4); }
                .oh-count { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin-left: auto; white-space: nowrap; }

                /* Table */
                .oh-table-wrapper {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 1rem; overflow-x: auto;
                }
                .oh-table { width: 100%; border-collapse: collapse; min-width: 1100px; }
                .oh-table th {
                    text-align: left; padding: 0.875rem 1.1rem;
                    background: rgba(255,255,255,0.025); color: rgba(255,255,255,0.45);
                    font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    position: sticky; top: 0; z-index: 5;
                }
                .oh-table td {
                    padding: 0.85rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: rgba(255,255,255,0.85); font-size: 0.88rem;
                }
                .oh-table tr:last-child td { border-bottom: none; }
                .oh-table tbody tr:hover { background: rgba(255,255,255,0.025); }

                .oh-mono { font-family: monospace; color: var(--color-primary, #4ecdc4); font-size: 0.9rem; }
                .oh-qty { font-weight: 700; color: #4ecdc4; }
                .oh-unit { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 400; }
                .oh-muted { color: rgba(255,255,255,0.6); }
                .oh-total { font-weight: 700; color: #10b981; }

                .oh-product-cell { display: flex; align-items: center; gap: 0.625rem; }
                .oh-thumb {
                    width: 36px; height: 36px; border-radius: 8px;
                    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden; display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; font-weight: 700; color: #4ecdc4; flex-shrink: 0;
                }
                .oh-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .oh-product-name { font-weight: 600; color: #fff; }

                .oh-cat-badge {
                    display: inline-block;
                    background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.55);
                    padding: 2px 9px; border-radius: 50px; font-size: 0.76rem;
                }

                .oh-status-badge {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.28rem 0.7rem; border-radius: 50px;
                    font-size: 0.78rem; font-weight: 600; white-space: nowrap;
                }
                .oh-btn-view {
                    width: 30px; height: 30px; border-radius: 7px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .oh-btn-view:hover { background: rgba(78,205,196,0.15); color: #4ecdc4; border-color: rgba(78,205,196,0.35); }

                .oh-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 5rem 2rem; gap: 0.75rem;
                    color: rgba(255,255,255,0.4); font-size: 1rem;
                }
                .oh-spinner {
                    display: inline-block; width: 24px; height: 24px;
                    border: 3px solid rgba(255,255,255,0.1); border-top-color: #4ecdc4;
                    border-radius: 50%; animation: oh-spin 0.7s linear infinite;
                }
                @keyframes oh-spin { to { transform: rotate(360deg); } }

                /* Modal */
                .oh-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.72);
                    backdrop-filter: blur(6px); display: flex; align-items: center;
                    justify-content: center; z-index: 300; padding: 1rem;
                    animation: oh-fade 0.2s ease;
                }
                @keyframes oh-fade { from { opacity:0; } to { opacity:1; } }
                @keyframes oh-slide { from { transform: translateY(20px) scale(0.98); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }

                .oh-modal {
                    background: #13172299; backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem;
                    width: 540px; max-width: 100%; max-height: 90vh; overflow-y: auto;
                    animation: oh-slide 0.25s cubic-bezier(0.34,1.56,0.64,1);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
                }
                .oh-modal-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .oh-modal-id { font-family: monospace; font-size: 0.82rem; color: #4ecdc4; display: block; margin-bottom: 0.2rem; }
                .oh-modal-title { margin: 0; color: #fff; font-size: 1.1rem; font-weight: 700; }
                .oh-modal-close {
                    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5); width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
                }
                .oh-modal-close:hover { background: rgba(239,68,68,0.2); color: #f87171; }

                .oh-modal-banner {
                    display: flex; align-items: center; gap: 0.5rem;
                    margin: 1rem 1.5rem 0; padding: 0.65rem 1rem;
                    border-radius: 0.625rem; border: 1px solid; font-size: 0.9rem;
                }

                .oh-modal-product {
                    display: flex; align-items: center; gap: 1rem;
                    margin: 1rem 1.5rem 0; padding: 1rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 0.75rem;
                }
                .oh-modal-thumb {
                    width: 56px; height: 56px; border-radius: 10px; overflow: hidden;
                    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.4rem; font-weight: 700; color: #4ecdc4; flex-shrink: 0;
                }
                .oh-modal-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .oh-modal-pname { font-size: 1.05rem; font-weight: 700; color: #fff; }

                .oh-modal-grid {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 0.75rem; padding: 1rem 1.5rem;
                }
                .oh-modal-item {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 0.625rem; padding: 0.75rem 0.875rem;
                }
                .oh-modal-item-label {
                    display: flex; align-items: center; gap: 0.3rem;
                    font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.4);
                    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.35rem;
                }
                .oh-modal-item-value { font-size: 0.9rem; font-weight: 600; color: #fff; }

                .oh-modal-notes {
                    margin: 0 1.5rem 1.5rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 0.625rem; padding: 0.875rem;
                }
                .oh-modal-notes p {
                    margin: 0; font-style: italic; color: rgba(255,255,255,0.55); font-size: 0.9rem;
                }

                @media (max-width: 900px) {
                    .oh-stats-row { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 640px) {
                    .oh-stats-row { grid-template-columns: 1fr 1fr; }
                    .oh-toolbar { flex-direction: column; }
                    .oh-search { max-width: 100%; }
                    .oh-modal-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default SupplierOrderHistory;
