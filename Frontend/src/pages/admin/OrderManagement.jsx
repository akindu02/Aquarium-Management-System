import React, { useState } from 'react';
import {
    Search, Eye, DollarSign, Package, Check, X, Truck, Clock,
    AlertCircle, ChevronDown, RotateCcw, CheckCircle,
    XCircle, ThumbsUp, ThumbsDown, Banknote, RefreshCw, FileText,
    MessageSquare, User, ShoppingBag, Hash, Calendar, CreditCard, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

const OrderManagement = () => {

    // ─── Orders State ─────────────────────────────────────────────
    const initialOrders = [
        { id: 'ORD-5001', customer: 'Kasun Perera', email: 'kasun@gmail.com', items: 'Goldfish (x2), Fish Food', date: '2025-10-24', total: 950, paymentStatus: 'Paid', status: 'Delivered', address: '123 Beach Rd, Matara' },
        { id: 'ORD-5002', customer: 'Nimali Silva', email: 'nimali@yahoo.com', items: 'Glass Tank 30L', date: '2025-10-25', total: 8500, paymentStatus: 'Paid', status: 'Processing', address: '45 Galle Rd, Colombo' },
        { id: 'ORD-5003', customer: 'Saman Kumara', email: 'saman@hotmail.com', items: 'Canister Filter', date: '2025-10-25', total: 15000, paymentStatus: 'Pending', status: 'Pending', address: '88 Main St, Kandy' },
        { id: 'ORD-5004', customer: 'Chathuri Bandara', email: 'chathuri@gmail.com', items: 'Plant Fertilizer, LED Light', date: '2025-10-26', total: 4400, paymentStatus: 'Paid', status: 'Shipped', address: '12 Flower Rd, Galle' },
        { id: 'ORD-5005', customer: 'Ruwan Dissanayake', email: 'ruwan@outlook.com', items: 'Anti-Fungal Treatment', date: '2025-10-26', total: 800, paymentStatus: 'Failed', status: 'Cancelled', address: '56 Lake Dr, Nuwara Eliya' },
        { id: 'ORD-5006', customer: 'Dilshan Fernando', email: 'dilshan@gmail.com', items: 'Neon Tetra (x10)', date: '2025-10-27', total: 1200, paymentStatus: 'Paid', status: 'Processing', address: '78 Hill St, Badulla' },
        { id: 'ORD-5007', customer: 'Anoma Rathnayake', email: 'anoma@yahoo.com', items: 'Fish Food Flakes (x3)', date: '2025-10-27', total: 1350, paymentStatus: 'Paid', status: 'Delivered', address: '34 Sea view, Negombo' },
        { id: 'ORD-5008', customer: 'Mahesh Gunawardena', email: 'mahesh@gmail.com', items: 'Glass Tank 30L, LED Light', date: '2025-10-28', total: 11700, paymentStatus: 'Paid', status: 'Shipped', address: '90 Garden Ln, Kurunegala' },
    ];

    // ─── Returns State ────────────────────────────────────────────
    const initialReturns = [
        {
            id: 'RET-001',
            orderId: 'ORD-5001',
            customer: 'Kasun Perera',
            email: 'kasun@gmail.com',
            submittedDate: '2025-10-28',
            items: 'Goldfish (x2)',
            reason: 'Defective / Dead on Arrival',
            description: 'Both goldfish were dead when the package arrived. The water bag was punctured.',
            refundAmount: 460,
            status: 'Pending',        // Pending, Under Review, Approved, Rejected, Refunded
            adminNote: '',
        },
        {
            id: 'RET-002',
            orderId: 'ORD-5007',
            customer: 'Anoma Rathnayake',
            email: 'anoma@yahoo.com',
            submittedDate: '2025-10-29',
            items: 'Fish Food Flakes (x3)',
            reason: 'Wrong Item Received',
            description: 'I ordered tropical flakes but received goldfish flakes instead.',
            refundAmount: 1350,
            status: 'Under Review',
            adminNote: '',
        },
        {
            id: 'RET-003',
            orderId: 'ORD-5001',
            customer: 'Kasun Perera',
            email: 'kasun@gmail.com',
            submittedDate: '2025-10-30',
            items: 'Fish Food',
            reason: 'Item Damaged During Shipping',
            description: 'The bag of fish food was torn and most of it spilled out.',
            refundAmount: 490,
            status: 'Approved',
            adminNote: 'Confirmed damage from shipping photo. Refund approved.',
        },
        {
            id: 'RET-004',
            orderId: 'ORD-5007',
            customer: 'Anoma Rathnayake',
            email: 'anoma@yahoo.com',
            submittedDate: '2025-10-31',
            items: 'Fish Food Flakes (x1)',
            reason: 'Changed My Mind',
            description: 'No longer need this item.',
            refundAmount: 450,
            status: 'Rejected',
            adminNote: 'Change of mind is not covered under our return policy.',
        },
    ];

    const [activeTab, setActiveTab] = useState('orders');     // 'orders' | 'returns'
    const [orders, setOrders] = useState(initialOrders);
    const [returns, setReturns] = useState(initialReturns);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [returnFilterStatus, setReturnFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    // ─── Orders Logic ─────────────────────────────────────────────
    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const updateOrderStatus = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    // ─── Returns Logic ────────────────────────────────────────────
    const returnStatuses = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Refunded'];

    const filteredReturns = returns.filter(r => {
        const matchesSearch = r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orderId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = returnFilterStatus === 'All' || r.status === returnFilterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = returns.filter(r => r.status === 'Pending').length;

    const openReturnModal = (ret) => {
        setSelectedReturn(ret);
        setAdminNote(ret.adminNote || '');
    };

    const updateReturnStatus = (newStatus) => {
        const label = newStatus === 'Approved' ? 'Approve' : newStatus === 'Rejected' ? 'Reject' : newStatus === 'Refunded' ? 'Mark as Refunded' : 'Update';
        const iconMap = { Approved: 'success', Rejected: 'warning', 'Under Review': 'info', Refunded: 'success' };

        Swal.fire({
            title: `${label} Return?`,
            text: `This will change the status to "${newStatus}".`,
            icon: iconMap[newStatus] || 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'Rejected' ? '#ef4444' : '#4ecdc4',
            cancelButtonColor: '#374151',
            confirmButtonText: label,
            background: '#1a1f2e',
            color: '#fff',
        }).then((result) => {
            if (result.isConfirmed) {
                setReturns(prev => prev.map(r =>
                    r.id === selectedReturn.id
                        ? { ...r, status: newStatus, adminNote }
                        : r
                ));
                setSelectedReturn(prev => ({ ...prev, status: newStatus, adminNote }));
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Return ${selectedReturn.id} is now "${newStatus}".`,
                    background: '#1a1f2e',
                    color: '#fff',
                    confirmButtonColor: '#4ecdc4',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    // ─── Style Helpers ────────────────────────────────────────────
    const getOrderStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', Icon: Check };
            case 'Shipped': return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', Icon: Truck };
            case 'Processing': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', Icon: Clock };
            case 'Cancelled': return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', Icon: X };
            default: return { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', Icon: AlertCircle };
        }
    };

    const getPaymentStyle = (status) => {
        switch (status) {
            case 'Paid': return '#10b981';
            case 'Pending': return '#f59e0b';
            case 'Failed': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const getReturnStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'rgba(250,204,21,0.15)', color: '#facc15', Icon: Clock };
            case 'Under Review': return { bg: 'rgba(251,146,60,0.15)', color: '#fb923c', Icon: RefreshCw };
            case 'Approved': return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', Icon: ThumbsUp };
            case 'Rejected': return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', Icon: ThumbsDown };
            case 'Refunded': return { bg: 'rgba(78,205,196,0.15)', color: '#4ecdc4', Icon: Banknote };
            default: return { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', Icon: FileText };
        }
    };

    return (
        <div className="order-management">
            {/* ── Header ── */}
            <div className="om-header">
                <div>
                    <h2 className="om-title">Order Management</h2>
                    <p className="om-subtitle">Manage customer orders, payments and return requests</p>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'orders' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <ShoppingBag size={16} /> Orders
                </button>
                <button
                    className={`tab-btn ${activeTab === 'returns' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('returns')}
                >
                    <RotateCcw size={16} /> Return Requests
                    {pendingCount > 0 && (
                        <span className="pending-badge">{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ORDERS TAB                                              */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
                <>
                    <div className="om-toolbar">
                        <div className="om-filter-group">
                            <div className="search-box">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Order ID or Customer..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="select-wrapper">
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <ChevronDown size={14} className="select-arrow" />
                            </div>
                        </div>
                    </div>

                    <div className="om-table-container">
                        <table className="om-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Date</th>
                                    <th>Total (LKR)</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => {
                                    const { bg, color, Icon } = getOrderStatusStyle(order.status);
                                    const paymentColor = getPaymentStyle(order.paymentStatus);
                                    return (
                                        <tr key={order.id}>
                                            <td className="font-mono">{order.id}</td>
                                            <td>
                                                <div className="customer-cell">
                                                    <div className="customer-avatar">{order.customer[0]}</div>
                                                    <div>
                                                        <div className="customer-name">{order.customer}</div>
                                                        <div className="customer-email">{order.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="truncate-cell" title={order.items}>{order.items}</td>
                                            <td>{order.date}</td>
                                            <td className="font-bold">{order.total.toLocaleString()}</td>
                                            <td>
                                                <span className="payment-dot" style={{ backgroundColor: paymentColor }} />
                                                {order.paymentStatus}
                                            </td>
                                            <td>
                                                <div className="status-badge" style={{ backgroundColor: bg, color }}>
                                                    <Icon size={12} style={{ marginRight: 4 }} />
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn-icon view" title="View Details" onClick={() => setSelectedOrder(order)}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* RETURNS TAB                                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === 'returns' && (
                <>
                    {/* Return Stats Summary */}
                    <div className="return-stats-row">
                        {[
                            { label: 'Total Requests', value: returns.length, color: '#4ecdc4', Icon: RotateCcw },
                            { label: 'Pending Review', value: returns.filter(r => r.status === 'Pending').length, color: '#facc15', Icon: Clock },
                            { label: 'Approved', value: returns.filter(r => r.status === 'Approved' || r.status === 'Refunded').length, color: '#4ade80', Icon: ThumbsUp },
                            { label: 'Rejected', value: returns.filter(r => r.status === 'Rejected').length, color: '#f87171', Icon: ThumbsDown },
                        ].map(stat => (
                            <div key={stat.label} className="ret-stat-card">
                                <div className="ret-stat-icon" style={{ background: `${stat.color}1a`, color: stat.color }}>
                                    <stat.Icon size={18} />
                                </div>
                                <div>
                                    <div className="ret-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                                    <div className="ret-stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="om-toolbar">
                        <div className="om-filter-group">
                            <div className="search-box">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Return ID, Order ID or Customer..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="select-wrapper">
                                <select value={returnFilterStatus} onChange={e => setReturnFilterStatus(e.target.value)}>
                                    {returnStatuses.map(s => (
                                        <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="select-arrow" />
                            </div>
                        </div>
                    </div>

                    {/* Returns Table */}
                    <div className="om-table-container">
                        <table className="om-table">
                            <thead>
                                <tr>
                                    <th>Return ID</th>
                                    <th>Customer</th>
                                    <th>Order ID</th>
                                    <th>Items</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Refund (LKR)</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No return requests found.
                                        </td>
                                    </tr>
                                ) : filteredReturns.map(ret => {
                                    const { bg, color, Icon } = getReturnStatusStyle(ret.status);
                                    return (
                                        <tr key={ret.id} className={ret.status === 'Pending' ? 'row-highlight' : ''}>
                                            <td className="font-mono ret-id">{ret.id}</td>
                                            <td>
                                                <div className="customer-cell">
                                                    <div className="customer-avatar">{ret.customer[0]}</div>
                                                    <div>
                                                        <div className="customer-name">{ret.customer}</div>
                                                        <div className="customer-email">{ret.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="linked-order">{ret.orderId}</span>
                                            </td>
                                            <td className="truncate-cell" title={ret.items}>{ret.items}</td>
                                            <td className="truncate-cell reason-cell" title={ret.reason}>{ret.reason}</td>
                                            <td>{ret.submittedDate}</td>
                                            <td className="font-bold refund-amount">
                                                {ret.refundAmount.toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="status-badge" style={{ backgroundColor: bg, color }}>
                                                    <Icon size={12} style={{ marginRight: 4 }} />
                                                    {ret.status}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon view"
                                                    title="Review Return"
                                                    onClick={() => openReturnModal(ret)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ORDER DETAILS MODAL                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order Details</h3>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="order-summary-header">
                                <div>
                                    <h2 className="summary-id">{selectedOrder.id}</h2>
                                    <p className="summary-date">Placed on {selectedOrder.date}</p>
                                </div>
                                <div className="summary-total">LKR {selectedOrder.total.toLocaleString()}</div>
                            </div>
                            <div className="grid-2-col">
                                <div className="detail-box">
                                    <h4>Customer Information</h4>
                                    <p>{selectedOrder.customer}</p>
                                    <p>{selectedOrder.email}</p>
                                </div>
                                <div className="detail-box">
                                    <h4>Shipping Address</h4>
                                    <p>{selectedOrder.address}</p>
                                </div>
                            </div>
                            <div className="items-box">
                                <h4>Items Ordered</h4>
                                <p>{selectedOrder.items}</p>
                            </div>
                            <div className="status-actions">
                                <h4>Update Status</h4>
                                <div className="status-buttons">
                                    {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                        <button
                                            key={s}
                                            className={`status-btn ${selectedOrder.status === s ? 'active' : ''}`}
                                            onClick={() => {
                                                updateOrderStatus(selectedOrder.id, s);
                                                setSelectedOrder({ ...selectedOrder, status: s });
                                            }}
                                        >{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* RETURN REVIEW MODAL                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            {selectedReturn && (
                <div className="modal-overlay" onClick={() => setSelectedReturn(null)}>
                    <div className="modal-content ret-modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="modal-header">
                            <div>
                                <h3>Return Request Review</h3>
                                <span className="ret-modal-id">{selectedReturn.id}</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedReturn(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body ret-modal-body">

                            {/* Current Status Banner */}
                            {(() => {
                                const { bg, color, Icon } = getReturnStatusStyle(selectedReturn.status);
                                return (
                                    <div className="ret-status-banner" style={{ background: bg, borderColor: `${color}44` }}>
                                        <Icon size={16} style={{ color }} />
                                        <span style={{ color, fontWeight: 700 }}>Current Status: {selectedReturn.status}</span>
                                    </div>
                                );
                            })()}

                            {/* Customer & Order Info Grid */}
                            <div className="grid-2-col">
                                <div className="detail-box">
                                    <h4><User size={12} style={{ marginRight: 4 }} />Customer</h4>
                                    <p className="detail-name">{selectedReturn.customer}</p>
                                    <p className="detail-sub">{selectedReturn.email}</p>
                                </div>
                                <div className="detail-box">
                                    <h4><Hash size={12} style={{ marginRight: 4 }} />Order Reference</h4>
                                    <p className="detail-name linked-order">{selectedReturn.orderId}</p>
                                    <p className="detail-sub">Submitted: {selectedReturn.submittedDate}</p>
                                </div>
                            </div>

                            {/* Items & Refund */}
                            <div className="grid-2-col">
                                <div className="detail-box">
                                    <h4><Package size={12} style={{ marginRight: 4 }} />Items to Return</h4>
                                    <p>{selectedReturn.items}</p>
                                </div>
                                <div className="detail-box">
                                    <h4><CreditCard size={12} style={{ marginRight: 4 }} />Refund Amount</h4>
                                    <p className="ret-refund-big">LKR {selectedReturn.refundAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Reason & Description */}
                            <div className="items-box ret-reason-box">
                                <h4><AlertCircle size={12} style={{ marginRight: 4 }} />Return Reason</h4>
                                <p className="ret-reason-title">{selectedReturn.reason}</p>
                                {selectedReturn.description && (
                                    <p className="ret-reason-desc">"{selectedReturn.description}"</p>
                                )}
                            </div>

                            {/* Admin Note */}
                            <div className="admin-note-section">
                                <label className="admin-note-label">
                                    <MessageSquare size={14} /> Admin Note (visible to customer)
                                </label>
                                <textarea
                                    className="admin-note-textarea"
                                    rows={3}
                                    placeholder="Add a note, reason for rejection, or refund instructions..."
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    disabled={selectedReturn.status === 'Refunded'}
                                />
                            </div>

                            {/* Action Buttons */}
                            {selectedReturn.status !== 'Refunded' && (
                                <div className="ret-action-grid">
                                    {selectedReturn.status === 'Pending' && (
                                        <>
                                            <button className="ret-action-btn ret-btn-review" onClick={() => updateReturnStatus('Under Review')}>
                                                <RefreshCw size={15} /> Start Review
                                            </button>
                                            <button className="ret-action-btn ret-btn-approve" onClick={() => updateReturnStatus('Approved')}>
                                                <ThumbsUp size={15} /> Approve Return
                                            </button>
                                            <button className="ret-action-btn ret-btn-reject" onClick={() => updateReturnStatus('Rejected')}>
                                                <ThumbsDown size={15} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'Under Review' && (
                                        <>
                                            <button className="ret-action-btn ret-btn-approve" onClick={() => updateReturnStatus('Approved')}>
                                                <ThumbsUp size={15} /> Approve Return
                                            </button>
                                            <button className="ret-action-btn ret-btn-reject" onClick={() => updateReturnStatus('Rejected')}>
                                                <ThumbsDown size={15} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'Approved' && (
                                        <button className="ret-action-btn ret-btn-refund" onClick={() => updateReturnStatus('Refunded')}>
                                            <Banknote size={15} /> Process Refund (LKR {selectedReturn.refundAmount.toLocaleString()})
                                        </button>
                                    )}
                                    {selectedReturn.status === 'Rejected' && (
                                        <button className="ret-action-btn ret-btn-review" onClick={() => updateReturnStatus('Under Review')}>
                                            <RefreshCw size={15} /> Re‑open for Review
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Refunded Confirmation Banner */}
                            {selectedReturn.status === 'Refunded' && (
                                <div className="refunded-banner">
                                    <CheckCircle size={20} />
                                    <div>
                                        <strong>Refund Processed</strong>
                                        <p>LKR {selectedReturn.refundAmount.toLocaleString()} has been refunded to the customer.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* STYLES                                                  */}
            {/* ═══════════════════════════════════════════════════════ */}
            <style>{`
                .order-management { display: flex; flex-direction: column; gap: 0; }

                .om-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.5rem;
                }
                .om-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .om-subtitle { color: var(--text-muted); font-size: 0.95rem; }

                .btn-export {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-main); padding: 0.75rem 1rem; border-radius: 0.5rem;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-export:hover { background: rgba(255,255,255,0.1); }

                /* Tab Navigation */
                .tab-nav {
                    display: flex; gap: 0.25rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; padding: 6px;
                    margin-bottom: 1.5rem;
                    width: fit-content;
                }

                .tab-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 0.55rem 1.25rem; border-radius: 8px;
                    border: none; background: transparent;
                    color: var(--text-muted); font-size: 0.9rem;
                    cursor: pointer; transition: all 0.2s; font-weight: 500;
                    position: relative;
                }
                .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
                .tab-active { background: rgba(78,205,196,0.15) !important; color: var(--color-primary) !important; font-weight: 700; }

                .pending-badge {
                    background: #ef4444; color: #fff;
                    border-radius: 50%; width: 18px; height: 18px;
                    font-size: 0.7rem; display: flex; align-items: center;
                    justify-content: center; font-weight: 700;
                }

                /* Return Stats Row */
                .return-stats-row {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    gap: 1rem; margin-bottom: 1.5rem;
                }
                .ret-stat-card {
                    display: flex; align-items: center; gap: 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; padding: 1rem 1.25rem;
                }
                .ret-stat-icon {
                    width: 42px; height: 42px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .ret-stat-value { font-size: 1.6rem; font-weight: 800; line-height: 1; }
                .ret-stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 3px; }

                /* Toolbar */
                .om-toolbar {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 1rem; border-radius: 1rem;
                    margin-bottom: 1.5rem;
                }
                .om-filter-group { display: flex; gap: 1rem; }

                .search-box {
                    display: flex; align-items: center;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem; padding: 0 0.75rem;
                    color: var(--text-muted); flex: 1; max-width: 400px;
                }
                .search-box input {
                    background: transparent; border: none;
                    padding: 0.6rem; color: var(--text-main);
                    width: 100%; outline: none;
                }

                .select-wrapper { position: relative; }
                .select-arrow {
                    position: absolute; right: 0.75rem; top: 50%;
                    transform: translateY(-50%); pointer-events: none; color: var(--text-muted);
                }
                select {
                    appearance: none; background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem;
                    padding: 0.6rem 2rem 0.6rem 1rem; color: var(--text-main);
                    cursor: pointer; outline: none; min-width: 160px;
                }

                /* Table */
                .om-table-container {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem; overflow-x: auto;
                    margin-bottom: 1rem;
                }
                .om-table { width: 100%; border-collapse: collapse; min-width: 900px; }
                .om-table th {
                    text-align: left; padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02); color: var(--text-muted);
                    font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .om-table td {
                    padding: 0.9rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: var(--text-main);
                    font-size: 0.9rem;
                }
                .om-table tr:last-child td { border-bottom: none; }
                .om-table tbody tr:hover { background: rgba(255,255,255,0.02); }

                .row-highlight { border-left: 3px solid #facc15 !important; }

                .font-mono { font-family: monospace; color: var(--color-primary); font-size: 0.92rem; }
                .font-bold { font-weight: 700; }
                .ret-id { color: #fb923c; }
                .linked-order { color: var(--color-primary); font-family: monospace; }
                .refund-amount { color: #4ade80; }
                .reason-cell { max-width: 160px; }

                .customer-cell { display: flex; align-items: center; gap: 0.75rem; }
                .customer-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
                }
                .customer-name { font-weight: 500; }
                .customer-email { font-size: 0.78rem; color: var(--text-muted); }

                .truncate-cell { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .payment-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

                .status-badge {
                    display: inline-flex; align-items: center;
                    padding: 0.3rem 0.7rem; border-radius: 50px;
                    font-size: 0.78rem; font-weight: 600; white-space: nowrap;
                }

                .btn-icon {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; transition: all 0.2s;
                    background: rgba(255,255,255,0.05); color: var(--text-main);
                }
                .btn-icon:hover { background: rgba(255,255,255,0.12); }

                /* Order Modal */
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 200; padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .modal-content {
                    background: #1a1f2e; width: 600px; max-width: 100%;
                    border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden; animation: slideUp 0.25s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .ret-modal { width: 660px; max-height: 90vh; overflow-y: auto; }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.1rem; }
                .ret-modal-id { font-family: monospace; color: #fb923c; font-size: 0.85rem; display: block; margin-top: 2px; }
                .modal-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
                .modal-close:hover { color: #f87171; }

                .modal-body { padding: 1.5rem; }
                .ret-modal-body { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.25rem 1.5rem; }

                /* Return Review Modal Internals */
                .ret-status-banner {
                    display: flex; align-items: center; gap: 8px;
                    padding: 0.75rem 1rem; border-radius: 8px;
                    border: 1px solid; font-size: 0.9rem;
                }

                .order-summary-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 2rem; padding-bottom: 1rem;
                    border-bottom: 1px dashed rgba(255,255,255,0.1);
                }
                .summary-id { color: var(--color-primary); font-family: monospace; margin: 0 0 0.25rem; }
                .summary-date { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
                .summary-total { font-size: 1.75rem; font-weight: 700; color: var(--text-main); }

                .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .detail-box {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px; padding: 1rem;
                }
                .detail-box h4 {
                    display: flex; align-items: center;
                    font-size: 0.75rem; text-transform: uppercase;
                    color: var(--text-muted); margin: 0 0 0.6rem; letter-spacing: 0.06em;
                }
                .detail-box p { margin: 0.2rem 0; color: var(--text-main); font-size: 0.9rem; }
                .detail-name { font-weight: 600 !important; }
                .detail-sub { color: var(--text-muted) !important; font-size: 0.82rem !important; }
                .ret-refund-big { font-size: 1.2rem !important; font-weight: 800 !important; color: #4ade80 !important; }

                .items-box {
                    background: rgba(255,255,255,0.03); padding: 1rem;
                    border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
                }
                .items-box h4 {
                    display: flex; align-items: center;
                    font-size: 0.75rem; text-transform: uppercase;
                    color: var(--text-muted); margin: 0 0 0.5rem; letter-spacing: 0.06em;
                }
                .items-box p { margin: 0; color: var(--text-main); }

                .ret-reason-box { margin: 0; }
                .ret-reason-title { font-weight: 700; color: var(--text-main); margin: 0 0 0.4rem; }
                .ret-reason-desc { color: var(--text-muted); font-size: 0.88rem; font-style: italic; margin: 0; }

                /* Admin Note */
                .admin-note-section { display: flex; flex-direction: column; gap: 0.5rem; }
                .admin-note-label {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.85rem; color: var(--text-muted);
                }
                .admin-note-textarea {
                    width: 100%; background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px; color: var(--text-main);
                    font-size: 0.9rem; padding: 0.75rem; resize: none;
                    outline: none; font-family: inherit; transition: border 0.2s;
                    box-sizing: border-box;
                }
                .admin-note-textarea:focus { border-color: var(--color-primary); }
                .admin-note-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Return Action Buttons */
                .ret-action-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }

                .ret-action-btn {
                    display: flex; align-items: center; gap: 7px;
                    padding: 0.65rem 1.25rem; border-radius: 8px;
                    border: none; cursor: pointer; font-size: 0.88rem;
                    font-weight: 700; transition: all 0.2s;
                }
                .ret-action-btn:hover { transform: translateY(-1px); opacity: 0.9; }

                .ret-btn-review { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
                .ret-btn-approve { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
                .ret-btn-reject { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
                .ret-btn-refund {
                    background: linear-gradient(135deg, #4ecdc4, #38a89d);
                    color: #000; border: none;
                    box-shadow: 0 4px 15px rgba(78,205,196,0.25);
                    flex: 1;
                }

                /* Refunded Banner */
                .refunded-banner {
                    display: flex; align-items: center; gap: 12px;
                    background: rgba(78,205,196,0.1);
                    border: 1px solid rgba(78,205,196,0.3);
                    border-radius: 10px; padding: 1rem;
                    color: var(--color-primary);
                }
                .refunded-banner strong { display: block; font-weight: 700; margin-bottom: 2px; }
                .refunded-banner p { margin: 0; font-size: 0.85rem; color: var(--text-muted); }

                /* Status Buttons inside Order Modal */
                .status-actions { margin-top: 1rem; }
                .status-actions h4 { margin: 0 0 1rem; color: var(--text-main); }
                .status-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .status-btn {
                    padding: 0.5rem 1rem; border-radius: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: var(--text-muted);
                    cursor: pointer; transition: all 0.2s;
                }
                .status-btn:hover { border-color: var(--color-primary); color: var(--text-main); }
                .status-btn.active { background: var(--color-primary); color: #000; border-color: var(--color-primary); font-weight: 700; }

                /* Responsive */
                @media (max-width: 768px) {
                    .return-stats-row { grid-template-columns: repeat(2, 1fr); }
                    .grid-2-col { grid-template-columns: 1fr; }
                    .ret-modal { width: 100%; }
                    .tab-nav { width: 100%; }
                    .tab-btn { flex: 1; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default OrderManagement;
