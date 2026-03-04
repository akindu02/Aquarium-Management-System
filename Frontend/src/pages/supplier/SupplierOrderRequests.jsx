import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, RefreshCw, Check, X, AlertTriangle,
    Clock, Package, Banknote, Layers, CalendarDays,
    FileText, User, CheckCircle, XCircle, Hourglass, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:5001/api';

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  Icon: Hourglass,    label: 'Pending'  },
    Approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  Icon: CheckCircle,  label: 'Approved' },
    Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   Icon: XCircle,      label: 'Rejected' },
    Ordered:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  Icon: Package,      label: 'Ordered'  },
    Received: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', Icon: CheckCircle,  label: 'Received' },
    Cancelled:{ color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', Icon: XCircle,      label: 'Cancelled'},
};

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const SupplierOrderRequests = () => {
    const [requests, setRequests]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [activeTab, setActiveTab]         = useState('All');
    const [searchTerm, setSearchTerm]       = useState('');
    const [processingId, setProcessingId]   = useState(null);

    const token = () => localStorage.getItem('auth_token');

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res  = await fetch(`${API}/restock/supplier`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const json = await res.json();
            if (json.success) setRequests(json.data);
        } catch (err) {
            console.error('Failed to fetch restock requests:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    // ── Accept / Reject ───────────────────────────────────────────
    const handleAction = async (req, action) => {
        const isAccept  = action === 'accept';
        const newStatus = isAccept ? 'Approved' : 'Rejected';

        if (!isAccept) {
            const confirm = await Swal.fire({
                title: 'Decline this request?',
                html: `<span style="color:rgba(255,255,255,0.7)">You are about to decline the restock request for <strong style="color:#f1f5f9">${req.product_name}</strong>. The staff will be notified.</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, decline',
                cancelButtonText: 'Keep',
                background: '#1a1f2e',
                color: '#fff',
            });
            if (!confirm.isConfirmed) return;
        }

        setProcessingId(req.request_id);
        try {
            const res = await fetch(`${API}/restock/${req.request_id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Update failed.');

            // Optimistically update local state
            setRequests(prev =>
                prev.map(r => r.request_id === req.request_id ? { ...r, status: newStatus } : r)
            );

            Swal.fire({
                icon: isAccept ? 'success' : 'info',
                title: isAccept ? 'Request Accepted!' : 'Request Declined',
                text: isAccept
                    ? `Restock request for "${req.product_name}" has been approved. The staff will be notified.`
                    : `Request for "${req.product_name}" has been declined.`,
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4',
                timer: 3000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1a1f2e', color: '#fff', confirmButtonColor: '#ef4444' });
        } finally {
            setProcessingId(null);
        }
    };

    // ── Filter ────────────────────────────────────────────────────
    const filtered = requests.filter(r => {
        const matchTab    = activeTab === 'All' || r.status === activeTab;
        const term        = searchTerm.toLowerCase();
        const matchSearch = !term || [r.product_name, r.product_category, r.staff_name, String(r.request_id)]
            .some(v => v && v.toLowerCase().includes(term));
        return matchTab && matchSearch;
    });

    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    // ── Helpers ───────────────────────────────────────────────────
    const fmt = (dateStr) => dateStr
        ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    const fmtCurrency = (val) =>
        val != null ? `LKR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

    return (
        <div className="sor-wrap">
            {/* ── Page Header ── */}
            <div className="sor-header">
                <div>
                    <h2 className="sor-title">
                        <ClipboardList size={22} style={{ color: '#4ecdc4' }} />
                        New Order Requests
                    </h2>
                    <p className="sor-subtitle">Incoming restock requests from the shop staff</p>
                </div>
                <div className="sor-header-actions">
                    {pendingCount > 0 && (
                        <span className="sor-attention-badge">
                            <AlertTriangle size={13} /> {pendingCount} need{pendingCount === 1 ? 's' : ''} response
                        </span>
                    )}
                    <button className="sor-refresh-btn" onClick={fetchRequests} title="Refresh">
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Tabs + Search ── */}
            <div className="sor-toolbar">
                <div className="sor-tabs">
                    {TABS.map(tab => {
                        const count = tab === 'All' ? requests.length : requests.filter(r => r.status === tab).length;
                        return (
                            <button
                                key={tab}
                                className={`sor-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                <span className="sor-tab-count">{count}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="sor-search">
                    <Filter size={14} />
                    <input
                        type="text"
                        placeholder="Search product, category, staff…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="sor-loading">
                    <span className="sor-spinner" />
                    Loading requests…
                </div>
            ) : filtered.length === 0 ? (
                <div className="sor-empty">
                    {activeTab === 'Pending' && requests.length > 0
                        ? <><CheckCircle size={52} style={{ color: '#10b981' }} /><p>All pending requests have been handled!</p></>
                        : <><ClipboardList size={52} style={{ color: '#4ecdc4', opacity: 0.4 }} /><p>{searchTerm ? 'No requests match your search.' : 'No requests found for this filter.'}</p></>
                    }
                </div>
            ) : (
                <div className="sor-cards">
                    {filtered.map(req => {
                        const s          = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                        const StatusIcon = s.Icon;
                        const isPending  = req.status === 'Pending';
                        const isProcessing = processingId === req.request_id;

                        return (
                            <div key={req.request_id} className={`sor-card ${isPending ? 'sor-card-pending' : ''}`}>

                                {/* Card Header */}
                                <div className="sor-card-header">
                                    <div className="sor-card-left">
                                        <div className="sor-product-thumb">
                                            {req.image_url
                                                ? <img src={`http://localhost:5001${req.image_url}`} alt={req.product_name} />
                                                : <span>{req.product_name?.[0] ?? 'P'}</span>
                                            }
                                        </div>
                                        <div>
                                            <div className="sor-product-name">{req.product_name}</div>
                                            <div className="sor-product-meta">
                                                <span className="sor-category">{req.product_category}</span>
                                                <span className="sor-req-id">REQ-{String(req.request_id).padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className="sor-status-badge"
                                        style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                                    >
                                        <StatusIcon size={13} />
                                        {s.label}
                                    </span>
                                </div>

                                {/* Detail Grid */}
                                <div className="sor-details-grid">
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><Layers size={11} /> Qty. Requested</span>
                                        <span className="sor-detail-value sor-qty">{req.quantity} units</span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><Banknote size={11} /> Unit Cost</span>
                                        <span className="sor-detail-value">{fmtCurrency(req.unit_cost)}</span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><Banknote size={11} /> Total Value</span>
                                        <span className="sor-detail-value sor-total">{fmtCurrency(req.total_cost)}</span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><Package size={11} /> Current Stock</span>
                                        <span
                                            className="sor-detail-value"
                                            style={{ color: req.current_stock === 0 ? '#ef4444' : req.current_stock <= 5 ? '#f59e0b' : '#f1f5f9' }}
                                        >
                                            {req.current_stock} units
                                        </span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><Clock size={11} /> Requested On</span>
                                        <span className="sor-detail-value">{fmt(req.requested_at)}</span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><CalendarDays size={11} /> Expected By</span>
                                        <span className="sor-detail-value">{req.expected_date ? fmt(req.expected_date) : 'Not specified'}</span>
                                    </div>
                                    <div className="sor-detail-item">
                                        <span className="sor-detail-label"><User size={11} /> Requested By</span>
                                        <span className="sor-detail-value">{req.staff_name || '—'}</span>
                                    </div>
                                    {req.notes && (
                                        <div className="sor-detail-item sor-detail-notes">
                                            <span className="sor-detail-label"><FileText size={11} /> Notes</span>
                                            <span className="sor-detail-value sor-notes-text">"{req.notes}"</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions — only for Pending */}
                                {isPending && (
                                    <div className="sor-actions">
                                        <button
                                            className="sor-btn-decline"
                                            onClick={() => handleAction(req, 'reject')}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <span className="sor-spinner-sm" /> : <X size={15} />}
                                            Decline
                                        </button>
                                        <button
                                            className="sor-btn-accept"
                                            onClick={() => handleAction(req, 'accept')}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing
                                                ? <span className="sor-spinner-sm" style={{ borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.2)' }} />
                                                : <Check size={15} />
                                            }
                                            Accept & Fulfil
                                        </button>
                                    </div>
                                )}

                                {/* Non-pending resolved banner */}
                                {!isPending && (
                                    <div
                                        className="sor-resolved-banner"
                                        style={{ background: s.bg, borderColor: s.border, color: s.color }}
                                    >
                                        <StatusIcon size={14} />
                                        This request was <strong>{s.label}</strong> on {fmt(req.updated_at)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .sor-wrap { display: flex; flex-direction: column; gap: 0; }

                .sor-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
                }
                .sor-title {
                    font-size: 1.75rem; font-weight: 700; color: var(--text-main);
                    margin: 0 0 0.3rem; display: flex; align-items: center; gap: 0.5rem;
                }
                .sor-subtitle { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
                .sor-header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
                .sor-attention-badge {
                    display: flex; align-items: center; gap: 0.35rem;
                    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
                    color: #f59e0b; padding: 0.4rem 0.875rem; border-radius: 50px;
                    font-size: 0.82rem; font-weight: 600;
                }
                .sor-refresh-btn {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-muted); padding: 0.55rem 1rem; border-radius: 0.5rem;
                    cursor: pointer; font-size: 0.875rem; transition: all 0.2s;
                }
                .sor-refresh-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-main); }

                .sor-toolbar {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
                }
                .sor-tabs { display: flex; gap: 0.25rem; }
                .sor-tab {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                    color: var(--text-muted); padding: 0.5rem 1rem; border-radius: 0.5rem;
                    cursor: pointer; font-size: 0.875rem; transition: all 0.2s;
                }
                .sor-tab:hover { background: rgba(255,255,255,0.08); color: var(--text-main); }
                .sor-tab.active {
                    background: rgba(78,205,196,0.12); border-color: rgba(78,205,196,0.35);
                    color: #4ecdc4; font-weight: 600;
                }
                .sor-tab-count {
                    background: rgba(255,255,255,0.1); color: inherit;
                    padding: 1px 7px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;
                }
                .sor-tab.active .sor-tab-count { background: rgba(78,205,196,0.2); }
                .sor-search {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem; padding: 0.5rem 0.875rem; min-width: 240px;
                    color: var(--text-muted);
                }
                .sor-search input {
                    background: transparent; border: none; outline: none;
                    color: var(--text-main); font-size: 0.875rem; width: 100%;
                }

                .sor-loading {
                    display: flex; align-items: center; justify-content: center;
                    gap: 0.75rem; padding: 5rem 2rem; color: var(--text-muted);
                }
                .sor-empty {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; padding: 5rem 2rem; gap: 1rem;
                    color: var(--text-muted); font-size: 1rem;
                    border: 2px dashed rgba(255,255,255,0.08); border-radius: 1rem;
                }
                .sor-spinner {
                    display: inline-block; width: 26px; height: 26px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #4ecdc4; border-radius: 50%;
                    animation: sor-spin 0.7s linear infinite;
                }
                .sor-spinner-sm {
                    display: inline-block; width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.15);
                    border-top-color: #ef4444; border-radius: 50%;
                    animation: sor-spin 0.7s linear infinite;
                }
                @keyframes sor-spin { to { transform: rotate(360deg); } }

                .sor-cards { display: flex; flex-direction: column; gap: 1rem; }

                .sor-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem; padding: 1.5rem; transition: all 0.2s;
                }
                .sor-card:hover { background: rgba(255,255,255,0.045); }
                .sor-card-pending { border-left: 3px solid #f59e0b; }

                .sor-card-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    gap: 1rem; margin-bottom: 1.25rem;
                }
                .sor-card-left { display: flex; align-items: center; gap: 0.875rem; }
                .sor-product-thumb {
                    width: 52px; height: 52px; border-radius: 10px; overflow: hidden;
                    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.3rem; font-weight: 700; color: #4ecdc4; flex-shrink: 0;
                }
                .sor-product-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .sor-product-name { font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem; }
                .sor-product-meta { display: flex; align-items: center; gap: 0.5rem; }
                .sor-category {
                    background: rgba(255,255,255,0.06); color: var(--text-muted);
                    padding: 2px 8px; border-radius: 50px; font-size: 0.78rem;
                }
                .sor-req-id { font-family: monospace; font-size: 0.78rem; color: #4ecdc4; }
                .sor-status-badge {
                    display: flex; align-items: center; gap: 0.35rem;
                    padding: 0.3rem 0.8rem; border-radius: 50px;
                    font-size: 0.8rem; font-weight: 600; white-space: nowrap; flex-shrink: 0;
                }

                .sor-details-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
                    gap: 0.875rem; padding: 1rem; margin-bottom: 1.25rem;
                    background: rgba(0,0,0,0.15); border-radius: 0.75rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .sor-detail-item { display: flex; flex-direction: column; gap: 3px; }
                .sor-detail-notes { grid-column: 1 / -1; }
                .sor-detail-label {
                    display: flex; align-items: center; gap: 0.3rem;
                    font-size: 0.72rem; font-weight: 600; color: var(--text-muted);
                    text-transform: uppercase; letter-spacing: 0.04em;
                }
                .sor-detail-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
                .sor-qty { color: #4ecdc4; }
                .sor-total { color: #10b981; }
                .sor-notes-text { font-style: italic; color: var(--text-muted); font-weight: 400; font-size: 0.875rem; }

                .sor-actions {
                    display: flex; justify-content: flex-end; gap: 0.75rem;
                    padding-top: 0.25rem;
                }
                .sor-btn-decline, .sor-btn-accept {
                    display: flex; align-items: center; gap: 0.4rem;
                    padding: 0.6rem 1.25rem; border-radius: 0.5rem;
                    font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .sor-btn-decline {
                    background: transparent; border: 1px solid rgba(239,68,68,0.3); color: #ef4444;
                }
                .sor-btn-decline:hover:not(:disabled) { background: rgba(239,68,68,0.1); }
                .sor-btn-accept {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    border: none; color: #000;
                }
                .sor-btn-accept:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(78,205,196,0.35); }
                .sor-btn-decline:disabled, .sor-btn-accept:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                .sor-resolved-banner {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.6rem 1rem; border-radius: 0.5rem; border: 1px solid;
                    font-size: 0.85rem;
                }

                @media (max-width: 640px) {
                    .sor-toolbar { flex-direction: column; align-items: stretch; }
                    .sor-tabs { overflow-x: auto; padding-bottom: 2px; }
                    .sor-actions { flex-direction: column; }
                    .sor-btn-decline, .sor-btn-accept { justify-content: center; }
                    .sor-details-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
};

export default SupplierOrderRequests;
