import React, { useState, useEffect } from 'react';
import {
    Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag,
    XCircle, Search, RotateCcw, AlertCircle, ArrowLeft, ChevronDown,
    CheckSquare, Square, FileText, RefreshCw, ThumbsUp, ThumbsDown, Banknote
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getOrdersAPI } from '../../utils/api';

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
    const [returns, setReturns] = useState([
        {
            id: 'RET-2023-001',
            orderId: 'ORD-2023-0820',
            date: '2023-10-05',
            items: [{ name: 'Betta Fish', qty: 2, price: 250 }],
            reason: 'Defective / Dead on Arrival',
            description: 'Both fish were dead when the package arrived.',
            status: 'approved', // submitted, under_review, approved, rejected, refunded
            refundAmount: 500,
        }
    ]);

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

    const getStatusInfo = (status) => {
        switch (status) {
            case 'processing': return { icon: <Clock size={16} />, color: 'status-processing', label: 'Processing' };
            case 'shipped': return { icon: <Truck size={16} />, color: 'status-shipped', label: 'Shipped' };
            case 'delivered': return { icon: <CheckCircle size={16} />, color: 'status-delivered', label: 'Delivered' };
            case 'cancelled': return { icon: <XCircle size={16} />, color: 'status-cancelled', label: 'Cancelled' };
            default: return { icon: <Package size={16} />, color: '', label: status };
        }
    };

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
        setSelectedItems([]);
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

    const handleSubmitReturn = () => {
        const newReturn = {
            id: `RET-${Date.now()}`,
            orderId: selectedOrder.id,
            date: new Date().toISOString().split('T')[0],
            items: selectedOrder.items.filter(i => selectedItems.includes(i.name)),
            reason: returnReason,
            description: returnDescription,
            status: 'submitted',
            refundAmount: selectedOrder.items
                .filter(i => selectedItems.includes(i.name))
                .reduce((sum, i) => sum + i.price * i.qty, 0),
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
    };

    const canGoNext = () => {
        if (returnStep === 1) return selectedItems.length > 0;
        if (returnStep === 2) return returnReason !== '';
        return true;
    };

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <div>
                    <h2 className="page-title">My Orders</h2>
                    <p className="page-subtitle">Track, manage and return your purchases</p>
                </div>
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search Order ID..." />
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                {['all', 'active', 'completed', 'cancelled', 'returns'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'returns' && <RotateCcw size={14} style={{ marginRight: '5px' }} />}
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'returns' && returns.length > 0 && (
                            <span className="return-count-badge">{returns.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Returns Tab Content */}
            {filter === 'returns' ? (
                <div className="orders-list">
                    {returns.length === 0 ? (
                        <div className="empty-state">
                            <RotateCcw size={48} />
                            <h3>No Return Requests</h3>
                            <p>You haven't submitted any return requests yet.</p>
                        </div>
                    ) : (
                        returns.map(ret => {
                            const retStatus = getReturnStatusInfo(ret.status);
                            const steps = ['Submitted', 'Under Review', ret.status === 'rejected' ? 'Rejected' : 'Approved', 'Refunded'];
                            return (
                                <div key={ret.id} className="order-card return-card">
                                    <div className="order-header-main">
                                        <div className="order-id-group">
                                            <span className="order-id">{ret.id}</span>
                                            <span className="order-date">For order <strong style={{ color: 'var(--color-primary)' }}>{ret.orderId}</strong> · {ret.date}</span>
                                        </div>
                                        <div className={`status-badge ${retStatus.color}`}>
                                            {retStatus.icon}
                                            {retStatus.label}
                                        </div>
                                    </div>

                                    {/* Return Progress Timeline */}
                                    <div className="return-timeline">
                                        {steps.map((step, idx) => {
                                            const isComplete = retStatus.step > idx + 1;
                                            const isCurrent = retStatus.step === idx + 1;
                                            const isRejected = ret.status === 'rejected' && idx === 2;
                                            return (
                                                <React.Fragment key={step}>
                                                    <div className="timeline-step">
                                                        <div className={`timeline-dot ${isComplete ? 'dot-complete' : isCurrent ? (isRejected ? 'dot-rejected' : 'dot-current') : 'dot-pending'}`}>
                                                            {isComplete ? <CheckCircle size={12} /> : isRejected ? <XCircle size={12} /> : <span>{idx + 1}</span>}
                                                        </div>
                                                        <span className={`timeline-label ${isCurrent ? 'label-current' : isComplete ? 'label-complete' : 'label-pending'}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                    {idx < 3 && <div className={`timeline-line ${isComplete ? 'line-complete' : 'line-pending'}`} />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>

                                    <div className="order-content">
                                        <div className="order-items-preview">
                                            {ret.items.map((item, idx) => (
                                                <div key={idx} className="item-row">
                                                    <span className="item-qty">{item.qty}x</span>
                                                    <span className="item-name">{item.name}</span>
                                                </div>
                                            ))}
                                            <div className="return-reason-display">
                                                <AlertCircle size={13} />
                                                <span>{ret.reason}</span>
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-total">
                                                <span>Expected Refund</span>
                                                <span className="amount">LKR {ret.refundAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Orders List */
                <div className="orders-list">
                    {isLoadingOrders ? (
                        <div className="empty-state"><RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} /><p>Loading your orders…</p></div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingBag size={48} />
                            <h3>No orders found</h3>
                            <p>You haven't placed any orders in this category yet.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            const alreadyReturned = isAlreadyReturned(order.id);
                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-header-main">
                                        <div className="order-id-group">
                                            <span className="order-id">{order.id}</span>
                                            <span className="order-date">{order.date}</span>
                                        </div>
                                        <div className={`status-badge ${statusInfo.color}`}>
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </div>
                                    </div>

                                    <div className="order-content">
                                        <div className="order-items-preview">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="item-row">
                                                    <span className="item-qty">{item.qty}x</span>
                                                    <span className="item-name">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-total">
                                                <span>Total Amount</span>
                                                <span className="amount">LKR {order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-footer">
                                        <button className="track-btn">Track Order</button>
                                        {/* Return button: only for delivered, not already returned */}
                                        {order.status === 'delivered' && (
                                            alreadyReturned ? (
                                                <button className="return-btn return-btn-done" disabled>
                                                    <RotateCcw size={15} />
                                                    Return Requested
                                                </button>
                                            ) : (
                                                <button className="return-btn" onClick={() => openReturnModal(order)}>
                                                    <RotateCcw size={15} />
                                                    Return Item
                                                </button>
                                            )
                                        )}
                                        <button className="details-btn">
                                            Details <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                                <button className="btn-submit-return" onClick={handleSubmitReturn}>
                                    <RotateCcw size={15} /> Submit Return Request
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
                    gap: 1.5rem;
                }

                .orders-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .page-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-top: 0.25rem;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0 0.75rem;
                    width: 250px;
                }

                .search-icon { color: var(--text-muted); }

                .search-box input {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 0.65rem;
                    width: 100%;
                    outline: none;
                    font-size: 0.9rem;
                }

                /* Filters */
                .orders-filters {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .filter-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .filter-btn:hover {
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.05);
                }

                .filter-btn.active {
                    background: rgba(78, 205, 196, 0.15);
                    color: var(--color-primary);
                    font-weight: 600;
                }

                .return-count-badge {
                    background: var(--color-primary);
                    color: #000;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 0.7rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                /* Orders List */
                .orders-list { display: grid; gap: 1.25rem; }

                .order-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.2s;
                }

                .order-card:hover {
                    border-color: rgba(78, 205, 196, 0.3);
                    background: rgba(255, 255, 255, 0.05);
                }

                .return-card { border-left: 3px solid rgba(78, 205, 196, 0.5); }

                .order-header-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .order-id-group {
                    display: flex;
                    flex-direction: column;
                }

                .order-id {
                    font-weight: 700;
                    color: var(--text-main);
                    font-family: monospace;
                    font-size: 1rem;
                }

                .order-date { font-size: 0.85rem; color: var(--text-muted); }

                /* Status Badges */
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .status-processing { background: rgba(59,130,246,0.12); color: #60a5fa; }
                .status-shipped { background: rgba(168,85,247,0.12); color: #c084fc; }
                .status-delivered { background: rgba(34,197,94,0.12); color: #4ade80; }
                .status-cancelled { background: rgba(239,68,68,0.12); color: #f87171; }

                .ret-submitted { background: rgba(250,204,21,0.12); color: #facc15; }
                .ret-review { background: rgba(251,146,60,0.12); color: #fb923c; }
                .ret-approved { background: rgba(34,197,94,0.12); color: #4ade80; }
                .ret-rejected { background: rgba(239,68,68,0.12); color: #f87171; }
                .ret-refunded { background: rgba(78,205,196,0.12); color: var(--color-primary); }

                .order-content {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 2rem;
                    padding: 1rem 0;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .item-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                    font-size: 0.95rem;
                    color: rgba(255,255,255,0.8);
                }

                .item-qty { color: var(--text-muted); font-size: 0.9rem; }

                .return-reason-display {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 0.75rem;
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    font-style: italic;
                }

                .order-total {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .order-total span:first-child {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .amount {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .order-footer {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .track-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-main);
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .track-btn:hover { background: rgba(255,255,255,0.1); }

                .return-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.5rem 1rem;
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.3);
                    color: #f87171;
                    border-radius: 6px;
                    font-size: 0.88rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                }

                .return-btn:hover {
                    background: rgba(239,68,68,0.2);
                    border-color: rgba(239,68,68,0.5);
                    transform: translateY(-1px);
                }

                .return-btn-done {
                    background: rgba(78,205,196,0.08);
                    border-color: rgba(78,205,196,0.2);
                    color: var(--color-primary);
                    cursor: default;
                    opacity: 0.7;
                }

                .return-btn-done:hover { transform: none; }

                .details-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    color: var(--color-primary);
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .details-btn:hover { text-decoration: underline; }

                /* Return Timeline */
                .return-timeline {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding: 0.75rem 0;
                    overflow-x: auto;
                }

                .timeline-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    min-width: 70px;
                }

                .timeline-dot {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .dot-complete { background: var(--color-primary); color: #000; }
                .dot-current { background: rgba(78,205,196,0.2); border: 2px solid var(--color-primary); color: var(--color-primary); }
                .dot-rejected { background: rgba(239,68,68,0.2); border: 2px solid #f87171; color: #f87171; }
                .dot-pending { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.15); color: var(--text-muted); }

                .timeline-label { font-size: 0.72rem; text-align: center; }
                .label-current { color: var(--color-primary); font-weight: 600; }
                .label-complete { color: var(--text-muted); }
                .label-pending { color: rgba(255,255,255,0.2); }

                .timeline-line {
                    flex: 1;
                    height: 2px;
                    min-width: 24px;
                    margin-bottom: 18px;
                }

                .line-complete { background: var(--color-primary); }
                .line-pending { background: rgba(255,255,255,0.1); }

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
                    .order-content { grid-template-columns: 1fr; gap: 1rem; }
                    .order-total { align-items: flex-start; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1); }
                    .return-modal { max-width: 100%; border-radius: 16px 16px 0 0; margin-top: auto; }
                }
            `}</style>
        </div>
    );
};

export default MyOrders;
