import React, { useState, useEffect } from 'react';
import {
    Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag,
    XCircle, Search, RotateCcw, AlertCircle, ArrowLeft, Eye,
    CheckSquare, Square, FileText, RefreshCw, ThumbsUp, ThumbsDown, Banknote
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getOrdersAPI, createReturnAPI, getMyReturnsAPI } from '../../utils/api';

const MyOrders = () => {
    const [filter, setFilter] = useState('all');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Return form state
    const [returnStep, setReturnStep] = useState(1); // 1: select items, 2: reason, 3: confirmation
    const [selectedItems, setSelectedItems] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnDescription, setReturnDescription] = useState('');

    // Track submitted returns
    const [returns, setReturns] = useState([]);
    const [isLoadingReturns, setIsLoadingReturns] = useState(true);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                setIsLoadingReturns(true);
                const res = await getMyReturnsAPI();
                if (res.success) {
                    const statusMap = {
                        'Pending': 'submitted',
                        'Under Review': 'under_review',
                        'Approved': 'approved',
                        'Rejected': 'rejected',
                        'Refunded': 'refunded',
                    };
                    setReturns(res.data.map(r => ({
                        id: r.returnRef,
                        _returnId: r.returnId,
                        orderId: r.orderRef,
                        date: r.submittedDate,
                        items: r.items,
                        reason: r.reason,
                        description: r.description,
                        status: statusMap[r.status] || 'submitted',
                        refundAmount: r.refundAmount,
                        adminNote: r.adminNote,
                    })));
                }
            } catch (err) {
                console.error('fetchReturns error:', err);
            } finally {
                setIsLoadingReturns(false);
            }
        };
        fetchReturns();
    }, []);

    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoadingOrders(true);
                const res = await getOrdersAPI();
                if (res.success) {
                    const statusMap = {
                        Pending: 'processing',
                        Processing: 'processing',
                        Shipped: 'shipped',
                        Delivered: 'delivered',
                        Cancelled: 'cancelled',
                        Returned: 'cancelled',
                    };
                    const paymentMap = {
                        Completed: 'paid',
                        Pending: 'pending',
                        Failed: 'failed',
                        Refunded: 'refunded',
                    };
                    setOrders(res.data.map(o => ({
                        id: o.order_ref,
                        _orderId: o.order_id,
                        date: o.order_date ? o.order_date.split('T')[0] : '',
                        items: Array.isArray(o.items)
                            ? o.items.map(i => ({ name: i.name, qty: i.quantity, price: parseFloat(i.unit_price) }))
                            : [],
                        total: parseFloat(o.total_amount),
                        status: statusMap[o.status] || 'processing',
                        paymentStatus: paymentMap[o.payment_status] || 'pending',
                    })));
                }
            } catch (err) {
                console.error('fetchOrders error:', err);
            } finally {
                setIsLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

    const returnReasons = [
        'Defective / Dead on Arrival',
        'Wrong Item Received',
        'Item Damaged During Shipping',
        'Item Not as Described',
        'Changed My Mind',
        'Duplicate Order',
        'Other',
    ];

    const getReturnStatusInfo = (status) => {
        switch (status) {
            case 'submitted': return { icon: <FileText size={14} />, color: 'ret-submitted', label: 'Submitted', step: 1 };
            case 'under_review': return { icon: <RefreshCw size={14} />, color: 'ret-review', label: 'Under Review', step: 2 };
            case 'approved': return { icon: <ThumbsUp size={14} />, color: 'ret-approved', label: 'Approved', step: 3 };
            case 'rejected': return { icon: <ThumbsDown size={14} />, color: 'ret-rejected', label: 'Rejected', step: 3 };
            case 'refunded': return { icon: <Banknote size={14} />, color: 'ret-refunded', label: 'Refunded', step: 4 };
            default: return { icon: <FileText size={14} />, color: '', label: status, step: 1 };
        }
    };

    const isAlreadyReturned = (orderId) => returns.some(r => r.orderId === orderId);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['processing', 'shipped'].includes(order.status);
        if (filter === 'completed') return order.status === 'delivered';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    // --- Return Modal Handlers ---
    const openReturnModal = (order) => {
        setSelectedOrder(order);
        setReturnStep(1);
        setSelectedItems(order.items.map(i => i.name)); // pre-select all items (full-order return)
        setReturnReason('');
        setReturnDescription('');
        setShowReturnModal(true);
    };

    const toggleItemSelection = (itemName) => {
        setSelectedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(i => i !== itemName)
                : [...prev, itemName]
        );
    };

    const handleSubmitReturn = async () => {
        setIsSubmittingReturn(true);
        try {
            const res = await createReturnAPI({
                orderId: selectedOrder._orderId,
                reason: returnReason,
                description: returnDescription,
            });
            const newReturn = {
                id: res.returnRef,
                _returnId: res.returnId,
                orderId: selectedOrder.id,
                date: new Date().toISOString().split('T')[0],
                items: selectedOrder.items,
                reason: returnReason,
                description: returnDescription,
                status: 'submitted',
                refundAmount: selectedOrder.total,
                adminNote: '',
            };
            setReturns(prev => [newReturn, ...prev]);
            setShowReturnModal(false);
            Swal.fire({
                icon: 'success',
                title: 'Return Request Submitted!',
                text: 'We\'ll review your request within 2-3 business days and contact you.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4',
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: err.message || 'Could not submit return request.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4',
            });
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    const canGoNext = () => {
        if (returnStep === 1) return selectedItems.length > 0;
        if (returnStep === 2) return returnReason !== '';
        return true;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

    const getOrderStatusStyle = (status) => {
        switch (status) {
            case 'processing': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', Icon: Clock };
            case 'shipped': return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', Icon: Truck };
            case 'delivered': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', Icon: CheckCircle };
            case 'cancelled': return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', Icon: XCircle };
            default: return { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', Icon: Package };
        }
    };

    const getPaymentColor = (status) => {
        switch (status) {
            case 'paid': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'failed': return '#ef4444';
            case 'refunded': return '#4ecdc4';
            default: return '#9ca3af';
        }
    };

    const searchedOrders = filteredOrders.filter(o => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return o.id.toLowerCase().includes(term) ||
            o.items.some(i => i.name.toLowerCase().includes(term));
    });

    const searchedReturns = returns.filter(r => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return r.id.toLowerCase().includes(term) || r.orderId.toLowerCase().includes(term);
    });

    return (
        <div className="my-orders-container">
            {/* Header */}
            <div className="mo-header">
                <div>
                    <h2 className="mo-title">My Orders</h2>
                    <p className="mo-subtitle">Track, manage and return your purchases</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mo-tab-nav">
                {['all', 'active', 'completed', 'cancelled', 'returns'].map(f => (
                    <button
                        key={f}
                        className={`mo-tab-btn ${filter === f ? 'mo-tab-active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'returns' && <RotateCcw size={14} />}
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'returns' && returns.length > 0 && (
                            <span className="mo-badge">{returns.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="mo-toolbar">
                <div className="mo-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder={filter === 'returns' ? 'Search Return ID or Order ID...' : 'Search Order ID or Product...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Returns Tab Content */}
            {filter === 'returns' ? (
                <div className="mo-table-container">
                    {isLoadingReturns ? (
                        <div className="mo-empty"><RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} /><p>Loading return requests…</p></div>
                    ) : searchedReturns.length === 0 ? (
                        <div className="mo-empty">
                            <RotateCcw size={44} />
                            <h3>No Return Requests</h3>
                            <p>{returns.length === 0 ? "You haven't submitted any return requests yet." : 'No returns match your search.'}</p>
                        </div>
                    ) : (
                        <table className="mo-table">
                            <thead>
                                <tr>
                                    <th>Return ID</th>
                                    <th>Order</th>
                                    <th>Items</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Refund (LKR)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchedReturns.map(ret => {
                                    const retStatus = getReturnStatusInfo(ret.status);
                                    return (
                                        <tr key={ret.id}>
                                            <td className="mo-mono mo-ret-id">{ret.id}</td>
                                            <td><span className="mo-linked-order">{ret.orderId}</span></td>
                                            <td className="mo-truncate" title={ret.items.map(i => `${i.qty}x ${i.name}`).join(', ')}>
                                                {ret.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </td>
                                            <td className="mo-truncate" title={ret.reason}>{ret.reason}</td>
                                            <td>{ret.date}</td>
                                            <td className="mo-bold mo-refund">{ret.refundAmount.toLocaleString()}</td>
                                            <td>
                                                <div className={`mo-status-badge ${retStatus.color}`}>
                                                    {retStatus.icon}
                                                    {retStatus.label}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                /* Orders Table */
                <div className="mo-table-container">
                    {isLoadingOrders ? (
                        <div className="mo-empty"><RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} /><p>Loading your orders…</p></div>
                    ) : searchedOrders.length === 0 ? (
                        <div className="mo-empty">
                            <ShoppingBag size={44} />
                            <h3>No orders found</h3>
                            <p>{filteredOrders.length === 0 ? "You haven't placed any orders in this category yet." : 'No orders match your search.'}</p>
                        </div>
                    ) : (
                        <table className="mo-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Items</th>
                                    <th>Date</th>
                                    <th>Total (LKR)</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchedOrders.map(order => {
                                    const { bg, color: statusColor, Icon: StatusIcon } = getOrderStatusStyle(order.status);
                                    const paymentColor = getPaymentColor(order.paymentStatus);
                                    const alreadyReturned = isAlreadyReturned(order.id);
                                    const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
                                    return (
                                        <tr key={order.id}>
                                            <td className="mo-mono">{order.id}</td>
                                            <td className="mo-truncate" title={itemsSummary}>{itemsSummary}</td>
                                            <td>{order.date}</td>
                                            <td className="mo-bold">{order.total.toLocaleString()}</td>
                                            <td>
                                                <span className="mo-payment-dot" style={{ backgroundColor: paymentColor }} />
                                                <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus}</span>
                                            </td>
                                            <td>
                                                <div className="mo-status-badge" style={{ backgroundColor: bg, color: statusColor }}>
                                                    <StatusIcon size={12} />
                                                    <span style={{ textTransform: 'capitalize' }}>{order.status}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="mo-actions">
                                                    <button className="mo-btn-icon" title="View Details" onClick={() => setSelectedOrderDetail(order)}>
                                                        <Eye size={15} />
                                                    </button>
                                                    {order.status === 'delivered' && !alreadyReturned && (
                                                        <button className="mo-btn-icon mo-btn-return" title="Return Item" onClick={() => openReturnModal(order)}>
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                    {order.status === 'delivered' && alreadyReturned && (
                                                        <span className="mo-returned-tag">Returned</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ===== ORDER DETAIL MODAL ===== */}
            {selectedOrderDetail && (
                <div className="modal-overlay" onClick={() => setSelectedOrderDetail(null)}>
                    <div className="mo-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="mo-detail-header">
                            <div>
                                <h3>Order Details</h3>
                                <p className="mo-detail-ref">{selectedOrderDetail.id}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setSelectedOrderDetail(null)}>✕</button>
                        </div>
                        <div className="mo-detail-body">
                            <div className="mo-detail-row">
                                <span>Date</span>
                                <strong>{selectedOrderDetail.date}</strong>
                            </div>
                            <div className="mo-detail-row">
                                <span>Status</span>
                                <strong style={{ textTransform: 'capitalize', color: getOrderStatusStyle(selectedOrderDetail.status).color }}>
                                    {selectedOrderDetail.status}
                                </strong>
                            </div>
                            <div className="mo-detail-row">
                                <span>Payment</span>
                                <strong style={{ textTransform: 'capitalize', color: getPaymentColor(selectedOrderDetail.paymentStatus) }}>
                                    {selectedOrderDetail.paymentStatus}
                                </strong>
                            </div>
                            <div className="mo-detail-divider" />
                            <p className="mo-detail-section-label">Items</p>
                            {selectedOrderDetail.items.map((item, idx) => (
                                <div key={idx} className="mo-detail-item">
                                    <span>{item.qty}x {item.name}</span>
                                    <span>LKR {(item.price * item.qty).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="mo-detail-divider" />
                            <div className="mo-detail-row mo-detail-total">
                                <span>Total</span>
                                <strong>LKR {selectedOrderDetail.total.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RETURN REQUEST MODAL ===== */}
            {showReturnModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
                    <div className="return-modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="return-modal-header">
                            <div>
                                <h3>Return Request</h3>
                                <p>{selectedOrder.id}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowReturnModal(false)}>✕</button>
                        </div>

                        {/* Step Indicator */}
                        <div className="step-indicator">
                            {['Select Items', 'Reason', 'Confirm'].map((step, idx) => (
                                <React.Fragment key={step}>
                                    <div className="step-item">
                                        <div className={`step-circle ${returnStep > idx + 1 ? 'step-done' : returnStep === idx + 1 ? 'step-active' : 'step-inactive'}`}>
                                            {returnStep > idx + 1 ? <CheckCircle size={14} /> : <span>{idx + 1}</span>}
                                        </div>
                                        <span className={`step-label ${returnStep === idx + 1 ? 'label-active' : ''}`}>{step}</span>
                                    </div>
                                    {idx < 2 && <div className={`step-line ${returnStep > idx + 1 ? 'step-line-done' : ''}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="return-modal-body">

                            {/* Step 1: Select Items */}
                            {returnStep === 1 && (
                                <div className="step-content">
                                    <p className="step-description">Select the items you want to return.</p>
                                    <div className="item-selection-list">
                                        {selectedOrder.items.map((item, idx) => {
                                            const isSelected = selectedItems.includes(item.name);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`selectable-item ${isSelected ? 'item-selected' : ''}`}
                                                    onClick={() => toggleItemSelection(item.name)}
                                                >
                                                    <div className="item-checkbox">
                                                        {isSelected ? <CheckSquare size={20} color="var(--color-primary)" /> : <Square size={20} color="var(--text-muted)" />}
                                                    </div>
                                                    <div className="item-info">
                                                        <span className="item-name-select">{item.name}</span>
                                                        <span className="item-qty-select">Qty: {item.qty}</span>
                                                    </div>
                                                    <span className="item-price-select">LKR {(item.price * item.qty).toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {selectedItems.length > 0 && (
                                        <div className="selection-summary">
                                            <span>{selectedItems.length} item(s) selected</span>
                                            <span className="summary-refund">
                                                Refund: LKR {selectedOrder.items
                                                    .filter(i => selectedItems.includes(i.name))
                                                    .reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Reason */}
                            {returnStep === 2 && (
                                <div className="step-content">
                                    <p className="step-description">Why do you want to return these items?</p>
                                    <div className="reason-list">
                                        {returnReasons.map(reason => (
                                            <button
                                                key={reason}
                                                className={`reason-option ${returnReason === reason ? 'reason-selected' : ''}`}
                                                onClick={() => setReturnReason(reason)}
                                            >
                                                <span className="reason-radio">{returnReason === reason ? '●' : '○'}</span>
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="form-group-return">
                                        <label>Additional Details <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                                        <textarea
                                            className="return-textarea"
                                            rows={3}
                                            placeholder="Describe the issue in more detail..."
                                            value={returnDescription}
                                            onChange={e => setReturnDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirmation */}
                            {returnStep === 3 && (
                                <div className="step-content">
                                    <div className="confirm-summary">
                                        <div className="confirm-icon-wrap">
                                            <RotateCcw size={32} color="var(--color-primary)" />
                                        </div>
                                        <h4>Review Your Return</h4>
                                        <div className="confirm-detail-row">
                                            <span>Order</span>
                                            <strong>{selectedOrder.id}</strong>
                                        </div>
                                        <div className="confirm-detail-row">
                                            <span>Items</span>
                                            <strong>{selectedItems.join(', ')}</strong>
                                        </div>
                                        <div className="confirm-detail-row">
                                            <span>Reason</span>
                                            <strong>{returnReason}</strong>
                                        </div>
                                        <div className="confirm-detail-row">
                                            <span>Expected Refund</span>
                                            <strong className="confirm-refund">
                                                LKR {selectedOrder.items
                                                    .filter(i => selectedItems.includes(i.name))
                                                    .reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}
                                            </strong>
                                        </div>
                                        <div className="return-notice">
                                            <AlertCircle size={14} />
                                            <span>Our team will review your request within 2-3 business days. You'll be notified via email.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="return-modal-footer">
                            {returnStep > 1 && (
                                <button className="btn-back" onClick={() => setReturnStep(s => s - 1)}>
                                    <ArrowLeft size={15} /> Back
                                </button>
                            )}
                            {returnStep < 3 ? (
                                <button
                                    className={`btn-next ${!canGoNext() ? 'btn-disabled' : ''}`}
                                    onClick={() => canGoNext() && setReturnStep(s => s + 1)}
                                    disabled={!canGoNext()}
                                >
                                    Continue <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button
                                    className="btn-submit-return"
                                    onClick={handleSubmitReturn}
                                    disabled={isSubmittingReturn}
                                    style={{ opacity: isSubmittingReturn ? 0.7 : 1 }}
                                >
                                    <RotateCcw size={15} style={{ animation: isSubmittingReturn ? 'spin 1s linear infinite' : 'none' }} />
                                    {isSubmittingReturn ? 'Submitting…' : 'Submit Return Request'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .my-orders-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .mo-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .mo-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 0.25rem;
                }

                .mo-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin: 0;
                }

                /* Tab Navigation */
                .mo-tab-nav {
                    display: flex;
                    gap: 0.25rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 6px;
                    margin-bottom: 1.5rem;
                    width: fit-content;
                }

                .mo-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.55rem 1.25rem;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .mo-tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
                .mo-tab-active { background: rgba(78,205,196,0.15) !important; color: var(--color-primary) !important; font-weight: 700; }

                .mo-badge {
                    background: #ef4444;
                    color: #fff;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                /* Toolbar */
                .mo-toolbar {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 1rem;
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                }

                .mo-search-box {
                    display: flex;
                    align-items: center;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem;
                    padding: 0 0.75rem;
                    color: var(--text-muted);
                    flex: 1;
                    max-width: 400px;
                }

                .mo-search-box input {
                    background: transparent;
                    border: none;
                    padding: 0.6rem;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                    font-size: 0.9rem;
                }

                /* Table */
                .mo-table-container {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem;
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }

                .mo-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 750px;
                }

                .mo-table th {
                    text-align: left;
                    padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02);
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    white-space: nowrap;
                }

                .mo-table td {
                    padding: 0.9rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle;
                    color: var(--text-main);
                    font-size: 0.9rem;
                }

                .mo-table tr:last-child td { border-bottom: none; }
                .mo-table tbody tr:hover { background: rgba(255,255,255,0.02); }

                .mo-mono { font-family: monospace; color: var(--color-primary); font-size: 0.92rem; }
                .mo-bold { font-weight: 700; }
                .mo-ret-id { color: #fb923c !important; }
                .mo-linked-order { color: var(--color-primary); font-family: monospace; }
                .mo-refund { color: #4ade80; }
                .mo-truncate { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .mo-payment-dot {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    margin-right: 6px;
                    vertical-align: middle;
                }

                .mo-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.3rem 0.7rem;
                    border-radius: 50px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .ret-submitted { background: rgba(250,204,21,0.12); color: #facc15; }
                .ret-review { background: rgba(251,146,60,0.12); color: #fb923c; }
                .ret-approved { background: rgba(34,197,94,0.12); color: #4ade80; }
                .ret-rejected { background: rgba(239,68,68,0.12); color: #f87171; }
                .ret-refunded { background: rgba(78,205,196,0.12); color: var(--color-primary); }

                /* Action Buttons */
                .mo-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .mo-btn-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(255,255,255,0.05);
                    color: var(--text-main);
                }

                .mo-btn-icon:hover { background: rgba(255,255,255,0.12); }

                .mo-btn-return {
                    background: rgba(239,68,68,0.1);
                    color: #f87171;
                }

                .mo-btn-return:hover {
                    background: rgba(239,68,68,0.2);
                }

                .mo-returned-tag {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--color-primary);
                    background: rgba(78,205,196,0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    white-space: nowrap;
                }

                /* Empty State */
                .mo-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    color: var(--text-muted);
                    text-align: center;
                    gap: 0.5rem;
                }

                .mo-empty h3 { color: var(--text-main); margin: 0.5rem 0 0; }
                .mo-empty p { margin: 0; }

                /* Order Detail Modal */
                .mo-detail-modal {
                    background: #1a1f2e;
                    border: 1px solid rgba(78,205,196,0.2);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 440px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .mo-detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .mo-detail-header h3 {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .mo-detail-ref {
                    color: var(--color-primary);
                    font-family: monospace;
                    font-size: 0.88rem;
                    margin: 2px 0 0;
                }

                .mo-detail-body { padding: 1.5rem; }

                .mo-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.6rem 0;
                    font-size: 0.9rem;
                }

                .mo-detail-row span { color: var(--text-muted); }
                .mo-detail-row strong { color: var(--text-main); }

                .mo-detail-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                    margin: 0.75rem 0;
                }

                .mo-detail-section-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 0.5rem;
                }

                .mo-detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.4rem 0;
                    font-size: 0.88rem;
                    color: rgba(255,255,255,0.8);
                }

                .mo-detail-total {
                    padding-top: 0.75rem;
                }

                .mo-detail-total strong {
                    color: var(--color-primary) !important;
                    font-size: 1.1rem;
                }

                /* ==== RETURN MODAL ==== */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                    animation: overlayIn 0.2s ease;
                }

                @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

                .return-modal {
                    background: #1a1f2e;
                    border: 1px solid rgba(78,205,196,0.2);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 520px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .return-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .return-modal-header h3 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .return-modal-header p {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-family: monospace;
                    margin: 2px 0 0;
                }

                .modal-close-btn {
                    background: rgba(255,255,255,0.08);
                    border: none;
                    color: var(--text-muted);
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .modal-close-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; }

                /* Step Indicator */
                .step-indicator {
                    display: flex;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }

                .step-circle {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    transition: all 0.3s;
                }

                .step-active { background: var(--color-primary); color: #000; }
                .step-done { background: rgba(78,205,196,0.15); color: var(--color-primary); }
                .step-inactive { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); }

                .step-label { font-size: 0.72rem; color: var(--text-muted); }
                .label-active { color: var(--color-primary) !important; font-weight: 600; }

                .step-line {
                    flex: 1;
                    height: 2px;
                    background: rgba(255,255,255,0.08);
                    margin-bottom: 20px;
                    transition: background 0.3s;
                }

                .step-line-done { background: var(--color-primary); }

                .return-modal-body { padding: 1.5rem; }

                .step-description { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem; }

                /* Item Selection */
                .item-selection-list { display: flex; flex-direction: column; gap: 0.75rem; }

                .selectable-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .selectable-item:hover { border-color: rgba(78,205,196,0.3); }
                .item-selected { border-color: rgba(78,205,196,0.5) !important; background: rgba(78,205,196,0.05) !important; }

                .item-info { flex: 1; }
                .item-name-select { display: block; font-weight: 600; color: var(--text-main); }
                .item-qty-select { font-size: 0.82rem; color: var(--text-muted); }
                .item-price-select { font-weight: 700; color: var(--color-primary); font-size: 0.95rem; }

                .selection-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(78,205,196,0.08);
                    border: 1px solid rgba(78,205,196,0.2);
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    margin-top: 1rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .summary-refund { font-weight: 700; color: var(--color-primary); }

                /* Reason Selection */
                .reason-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }

                .reason-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px;
                    cursor: pointer;
                    color: rgba(255,255,255,0.8);
                    font-size: 0.92rem;
                    text-align: left;
                    transition: all 0.2s;
                }

                .reason-option:hover { border-color: rgba(78,205,196,0.3); color: var(--text-main); }
                .reason-selected { border-color: rgba(78,205,196,0.5) !important; background: rgba(78,205,196,0.08) !important; color: var(--color-primary) !important; font-weight: 600; }
                .reason-radio { font-size: 1.1rem; line-height: 1; }

                .form-group-return label {
                    display: block;
                    color: var(--text-muted);
                    font-size: 0.88rem;
                    margin-bottom: 0.5rem;
                }

                .return-textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    padding: 0.75rem;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    transition: border 0.2s;
                    box-sizing: border-box;
                }

                .return-textarea:focus { border-color: var(--color-primary); }

                /* Confirm Step */
                .confirm-summary {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                    text-align: center;
                }

                .confirm-icon-wrap {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(78,205,196,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.75rem;
                }

                .confirm-summary h4 {
                    font-size: 1.1rem;
                    color: var(--text-main);
                    margin: 0 0 1.25rem;
                }

                .confirm-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    width: 100%;
                    padding: 0.65rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-size: 0.9rem;
                    gap: 1rem;
                }

                .confirm-detail-row span { color: var(--text-muted); text-align: left; }
                .confirm-detail-row strong { color: var(--text-main); text-align: right; }
                .confirm-refund { color: var(--color-primary) !important; font-size: 1.05rem; }

                .return-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    background: rgba(250,204,21,0.08);
                    border: 1px solid rgba(250,204,21,0.2);
                    border-radius: 8px;
                    padding: 0.75rem;
                    margin-top: 1.25rem;
                    font-size: 0.83rem;
                    color: #fde68a;
                    text-align: left;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Modal Footer */
                .return-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.08);
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.65rem 1.25rem;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.12);
                    color: var(--text-muted);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    margin-right: auto;
                }

                .btn-back:hover { border-color: rgba(255,255,255,0.3); color: var(--text-main); }

                .btn-next {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.65rem 1.5rem;
                    background: var(--color-primary);
                    border: none;
                    color: #000;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 700;
                    transition: all 0.2s;
                }

                .btn-next:hover { transform: translateY(-1px); opacity: 0.9; }
                .btn-disabled { opacity: 0.4; cursor: not-allowed !important; transform: none !important; }

                .btn-submit-return {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.65rem 1.5rem;
                    background: linear-gradient(135deg, var(--color-primary), #38a89d);
                    border: none;
                    color: #000;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 700;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(78,205,196,0.25);
                }

                .btn-submit-return:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(78,205,196,0.35); }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    color: var(--text-muted);
                    text-align: center;
                    border: 1px dashed rgba(255,255,255,0.1);
                    gap: 0.5rem;
                }

                @media (max-width: 768px) {
                    .mo-table { min-width: 600px; }
                    .mo-tab-nav { overflow-x: auto; width: 100%; }
                    .return-modal { max-width: 100%; border-radius: 16px 16px 0 0; margin-top: auto; }
                    .mo-detail-modal { max-width: 100%; border-radius: 16px 16px 0 0; margin-top: auto; }
                }
            `}</style>
        </div>
    );
};

export default MyOrders;
