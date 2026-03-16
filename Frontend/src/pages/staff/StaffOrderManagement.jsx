import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Banknote, Package, Check, X, Truck, Clock, AlertCircle, ChevronDown, Download, Users, Factory, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { getOrdersAPI, updateOrderStatusAPI } from '../../utils/api';

const StaffOrderManagement = () => {
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'supplier'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newRequest, setNewRequest] = useState({
        supplier: '',
        items: '',
        cost: '',
        expected: ''
    });

    // --- Customer Orders Data ---
    const [customerOrders, setCustomerOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    const fetchCustomerOrders = useCallback(async () => {
        try {
            setIsLoadingOrders(true);
            const res = await getOrdersAPI();
            if (res.success) {
                setCustomerOrders(res.data.map(o => ({
                    _orderId: o.order_id,
                    id: o.order_ref,
                    customer: o.customer_name,
                    email: o.customer_email,
                    items: Array.isArray(o.items) ? o.items.map(i => `${i.name} (x${i.quantity})`).join(', ') : '',
                    date: o.order_date ? o.order_date.split('T')[0] : '',
                    total: parseFloat(o.total_amount),
                    paymentStatus: o.payment_status === 'Completed' ? 'Paid' : o.payment_status === 'Refunded' ? 'Refunded' : o.payment_status === 'Failed' ? 'Failed' : 'Pending',
                    status: o.status,
                    address: o.shipping_address || '',
                })));
            }
        } catch (err) {
            console.error('fetchCustomerOrders error:', err);
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    useEffect(() => { fetchCustomerOrders(); }, [fetchCustomerOrders]);

    // --- Supplier / Restock Orders Data ---
    const [supplierOrders, setSupplierOrders] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);

    const fetchRestockRequests = useCallback(async () => {
        try {
            setSupplierLoading(true);
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:5001/api/restock', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setSupplierOrders(json.data.map(r => ({
                    _id:      r.request_id,
                    id:       `REQ-${String(r.request_id).padStart(4, '0')}`,
                    supplier: r.supplier_name || '—',
                    product:  r.product_name  || '—',
                    quantity: r.quantity,
                    unit_cost: r.unit_cost,
                    cost:     r.total_cost,
                    date:     r.requested_at  ? r.requested_at.split('T')[0]  : '',
                    expected: r.expected_date ? r.expected_date.split('T')[0] : 'TBD',
                    status:   r.status,
                    notes:    r.notes || '',
                    staff:    r.staff_name || '',
                })));
            }
        } catch (err) {
            console.error('fetchRestockRequests error:', err);
        } finally {
            setSupplierLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'supplier') fetchRestockRequests();
    }, [activeTab, fetchRestockRequests]);

    // --- Helpers ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered':
            case 'Received': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', icon: Check };
            case 'Shipped': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: Truck };
            case 'Processing': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: Clock };
            case 'Pending': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', icon: Clock };
            case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: X };
            default: return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', icon: AlertCircle };
        }
    };

    // --- Functions ---
    const updateCustomerStatus = async (id, newStatus) => {
        const order = customerOrders.find(o => o.id === id);
        if (!order) return;
        try {
            await updateOrderStatusAPI(order._orderId, newStatus);
            setCustomerOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message || 'Could not update order status.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4' });
        }
    };

    const updateSupplierStatus = async (id, newStatus) => {
        const order = supplierOrders.find(o => o.id === id);
        if (!order) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:5001/api/restock/${order._id}/staff-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Update failed.');
            setSupplierOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
            Swal.fire({ icon: 'success', title: 'Status Updated', text: `Request marked as ${newStatus}.`, background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4', timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message, background: '#1a1f2e', color: '#fff', confirmButtonColor: '#ef4444' });
        }
    };

    const handleCreateRequest = () => {
        if (!newRequest.supplier || !newRequest.items || !newRequest.cost) return;
        
        const newOrder = {
            id: `SUP-${Math.floor(Math.random() * 1000) + 9000}`,
            supplier: newRequest.supplier,
            items: newRequest.items,
            date: new Date().toISOString().split('T')[0],
            cost: parseFloat(newRequest.cost),
            status: 'Pending',
            expected: newRequest.expected || 'TBD'
        };

        setSupplierOrders([newOrder, ...supplierOrders]);
        setShowRequestModal(false);
        setNewRequest({ supplier: '', items: '', cost: '', expected: '' });
    };

    const filteredData = activeTab === 'customer'
        ? customerOrders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
        : supplierOrders.filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.product.toLowerCase().includes(searchTerm.toLowerCase())
          );

    return (
        <div className="staff-orders-container">
            {/* Header */}
            <div className="so-header">
                <div>
                    <h2 className="so-title">Process Orders</h2>
                    <p className="so-subtitle">Manage customer orders and supplier requisitions</p>
                </div>
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customer')}
                    >
                        <Users size={18} /> Customer Orders
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'supplier' ? 'active' : ''}`}
                        onClick={() => setActiveTab('supplier')}
                    >
                        <Factory size={18} /> Supplier Orders
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="so-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={activeTab === 'customer' ? "Search Order ID or Customer..." : "Search Request ID or Supplier..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="so-table-wrapper">
                <table className="so-table">
                    <thead>
                        {activeTab === 'customer' ? (
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>Request ID</th>
                                <th>Supplier</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Order Date</th>
                                <th>Total Cost</th>
                                <th>Expected</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {supplierLoading && activeTab === 'supplier' ? (
                            <tr><td colSpan="9" style={{ textAlign:'center', padding:'3rem', color:'rgba(255,255,255,0.4)' }}>Loading restock requests…</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign:'center', padding:'3rem', color:'rgba(255,255,255,0.4)' }}>{activeTab === 'supplier' ? 'No restock requests found.' : 'No orders found.'}</td></tr>
                        ) : filteredData.map(item => {
                            const statusStyle = getStatusStyle(item.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <tr key={item.id}>
                                    <td className="font-mono">{item.id}</td>
                                    <td>
                                        {activeTab === 'customer' ? (
                                            <div className="user-cell">
                                                <div className="avatar">{item.customer[0]}</div>
                                                <span>{item.customer}</span>
                                            </div>
                                        ) : (
                                            <span className="supplier-name">{item.supplier}</span>
                                        )}
                                    </td>
                                    {activeTab === 'supplier' ? (
                                        <>
                                            <td className="items-cell">{item.product}</td>
                                            <td>{item.quantity ?? '—'}</td>
                                        </>
                                    ) : (
                                        <td className="items-cell" title={item.items}>{item.items}</td>
                                    )}
                                    <td>{item.date}</td>
                                    <td className="font-bold">LKR {Number(item.total ?? item.cost ?? 0).toLocaleString()}</td>
                                    {activeTab === 'supplier' && (
                                        <td><div className="supplier-date">{item.expected}</div></td>
                                    )}
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                            <StatusIcon size={12} style={{ marginRight: '4px' }} />
                                            {item.status}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => setSelectedOrder({ type: activeTab, ...item })}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedOrder.type === 'customer' ? 'Customer Order Details' : 'Supplier Request Details'}</h3>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="summary-header">
                                <h2 className="summary-id">{selectedOrder.id}</h2>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                                    <span className="summary-date">{selectedOrder.date}</span>
                                    {(() => { const s = getStatusStyle(selectedOrder.status); const SI = s.icon; return (
                                        <span className="status-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                                            <SI size={12} style={{ marginRight: 4 }}/>{selectedOrder.status}
                                        </span>
                                    ); })()}
                                </div>
                            </div>

                            {selectedOrder.type === 'customer' ? (
                                <div className="detail-grid">
                                    <div><label>Customer</label><p>{selectedOrder.customer}</p></div>
                                    <div><label>Total Amount</label><p className="highlight-price">LKR {Number(selectedOrder.total || 0).toLocaleString()}</p></div>
                                    <div className="full-width"><label>Items</label><p>{selectedOrder.items}</p></div>
                                    {selectedOrder.address && <div className="full-width"><label>Shipping Address</label><p>{selectedOrder.address}</p></div>}
                                </div>
                            ) : (
                                <div className="detail-grid">
                                    <div><label>Supplier</label><p>{selectedOrder.supplier}</p></div>
                                    <div><label>Requested By</label><p>{selectedOrder.staff || '—'}</p></div>
                                    <div><label>Product</label><p>{selectedOrder.product}</p></div>
                                    <div><label>Quantity</label><p>{selectedOrder.quantity ?? '—'} units</p></div>
                                    <div><label>Unit Cost</label><p>LKR {Number(selectedOrder.unit_cost || 0).toLocaleString()}</p></div>
                                    <div><label>Total Cost</label><p className="highlight-price">LKR {Number(selectedOrder.cost || 0).toLocaleString()}</p></div>
                                    <div><label>Expected Delivery</label><p>{selectedOrder.expected}</p></div>
                                    {selectedOrder.notes && <div className="full-width"><label>Notes</label><p>{selectedOrder.notes}</p></div>}
                                </div>
                            )}

                            {/* Status Update Section */}
                            {(() => {
                                const customerSteps = [
                                    { key: 'Pending',    label: 'Pending',    icon: Clock,   color: '#9ca3af' },
                                    { key: 'Processing', label: 'Processing', icon: Package, color: '#f59e0b' },
                                    { key: 'Shipped',    label: 'Shipped',    icon: Truck,   color: '#3b82f6' },
                                    { key: 'Delivered',  label: 'Delivered',  icon: Check,   color: '#10b981' },
                                ];
                                const supplierSteps = [
                                    { key: 'Pending',   label: 'Pending',  icon: Clock,   color: '#9ca3af' },
                                    { key: 'Approved',  label: 'Approved', icon: Check,   color: '#6366f1' },
                                    { key: 'Ordered',   label: 'Ordered',  icon: Package, color: '#f59e0b' },
                                    { key: 'Received',  label: 'Received', icon: Check,   color: '#10b981' },
                                ];

                                const steps = selectedOrder.type === 'customer' ? customerSteps : supplierSteps;
                                const currentStatus = selectedOrder.status;
                                const isCancelled = currentStatus === 'Cancelled';
                                const currentIdx = steps.findIndex(s => s.key === currentStatus);

                                // Determine next action
                                const customerNextMap = { 'Pending': 'Processing', 'Processing': 'Shipped', 'Shipped': 'Delivered' };
                                const supplierNextMap = { 'Approved': 'Ordered', 'Ordered': 'Received' };
                                const nextStatus = selectedOrder.type === 'customer'
                                    ? customerNextMap[currentStatus]
                                    : supplierNextMap[currentStatus];

                                const nextStep = steps.find(s => s.key === nextStatus);

                                return (
                                    <div className="status-update-section">
                                        <div className="sus-label">Order Progress</div>

                                        {/* Progress Stepper */}
                                        {isCancelled ? (
                                            <div className="cancelled-banner">
                                                <X size={16} />
                                                <span>This order has been cancelled</span>
                                            </div>
                                        ) : (
                                            <div className="stepper">
                                                {steps.map((step, idx) => {
                                                    const StepIcon = step.icon;
                                                    const isDone = idx < currentIdx;
                                                    const isCurrent = idx === currentIdx;
                                                    return (
                                                        <React.Fragment key={step.key}>
                                                            <div className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                                                                <div
                                                                    className="step-circle"
                                                                    style={isDone || isCurrent ? { background: step.color, borderColor: step.color } : {}}
                                                                >
                                                                    <StepIcon size={13} />
                                                                </div>
                                                                <span className="step-label" style={isCurrent ? { color: step.color, fontWeight: 600 } : {}}>
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                            {idx < steps.length - 1 && (
                                                                <div className={`step-connector ${idx < currentIdx ? 'done' : ''}`} />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="sus-actions">
                                            {nextStep && (() => {
                                                const NextIcon = nextStep.icon;
                                                const handleNext = selectedOrder.type === 'customer'
                                                    ? () => updateCustomerStatus(selectedOrder.id, nextStatus)
                                                    : () => updateSupplierStatus(selectedOrder.id, nextStatus);
                                                return (
                                                    <button
                                                        className="sus-next-btn"
                                                        style={{ '--next-color': nextStep.color }}
                                                        onClick={handleNext}
                                                    >
                                                        <NextIcon size={16} />
                                                        Mark as {nextStep.label}
                                                        <span className="sus-arrow">→</span>
                                                    </button>
                                                );
                                            })()}

                                            {selectedOrder.type === 'supplier' && currentStatus === 'Pending' && (
                                                <button
                                                    className="sus-cancel-btn"
                                                    onClick={() => updateSupplierStatus(selectedOrder.id, 'Cancelled')}
                                                >
                                                    <X size={15} />
                                                    Cancel Request
                                                </button>
                                            )}

                                            {!nextStep && !isCancelled && (
                                                <div className="sus-complete">
                                                    <Check size={16} />
                                                    <span>Order complete — no further actions</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* New Request Modal */}
            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create Supplier Request</h3>
                            <button className="modal-close" onClick={() => setShowRequestModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Supplier Name</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    placeholder="Enter supplier name"
                                    value={newRequest.supplier} 
                                    onChange={(e) => setNewRequest({...newRequest, supplier: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Items Required</label>
                                <textarea 
                                    className="form-input"
                                    placeholder="List items and quantities"
                                    rows="3"
                                    value={newRequest.items} 
                                    onChange={(e) => setNewRequest({...newRequest, items: e.target.value})}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expected Cost (LKR)</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        placeholder="0.00"
                                        value={newRequest.cost} 
                                        onChange={(e) => setNewRequest({...newRequest, cost: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expected Date</label>
                                    <input 
                                        type="date" 
                                        className="form-input"
                                        value={newRequest.expected} 
                                        onChange={(e) => setNewRequest({...newRequest, expected: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="cancel-btn" onClick={() => setShowRequestModal(false)}>Cancel</button>
                                <button className="submit-btn" onClick={handleCreateRequest}>Submit Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .staff-orders-container {
                    padding: 0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                .so-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .so-title { font-size: 2rem; font-weight: 700; color: white; margin: 0; }
                .so-subtitle { color: rgba(255,255,255,0.6); margin: 0.5rem 0 0 0; }

                .tab-switcher {
                    display: flex; background: rgba(255,255,255,0.05);
                    padding: 4px; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
                }
                .tab-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none;
                    background: transparent; color: rgba(255,255,255,0.6);
                    cursor: pointer; font-weight: 500; transition: all 0.2s;
                }
                .tab-btn.active {
                    background: var(--color-primary); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }

                .so-toolbar {
                    display: flex; justify-content: space-between; margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .search-box {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(0,0,0,0.2); padding: 0.75rem 1rem;
                    border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
                    width: 100%;
                    max-width: 350px;
                }
                .search-box input {
                    background: transparent; border: none; outline: none;
                    color: white; width: 100%; font-size: 0.95rem;
                }
                
                .new-req-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    color: white; padding: 0 1.25rem; border-radius: 0.75rem;
                    cursor: pointer; transition: all 0.2s;
                }
                .new-req-btn:hover { background: rgba(255,255,255,0.15); }

                .so-table-wrapper {
                    flex: 1; overflow-x: auto; overflow-y: auto; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
                    width: 100%;
                }
                .so-table { width: 100%; border-collapse: collapse; min-width: 800px; }
                .so-table th {
                    text-align: left; padding: 1rem 1.5rem; position: sticky; top: 0;
                    background: rgba(20, 20, 30, 0.95); backdrop-filter: blur(5px);
                    color: rgba(255,255,255,0.5); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10;
                }
                .so-table td {
                    padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: rgba(255,255,255,0.9); font-size: 0.95rem;
                }
                .so-table tr:hover { background: rgba(255,255,255,0.02); }

                .font-mono { font-family: monospace; color: var(--color-primary); }
                .font-bold { font-weight: 600; }
                
                .user-cell { display: flex; align-items: center; gap: 0.75rem; }
                .avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #ec4899);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem; font-weight: 700;
                }
                
                .status-badge {
                    display: inline-flex; align-items: center; padding: 0.25rem 0.75rem;
                    border-radius: 20px; font-size: 0.8rem; font-weight: 600;
                }
                
                .btn-icon {
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.05); color: white;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-icon:hover { background: var(--color-primary); }

                /* Modal */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background: #1a1f2e; border: 1px solid rgba(255,255,255,0.1);
                    width: 420px; max-width: 94vw; max-height: 88vh; overflow-y: auto;
                    border-radius: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .modal-header {
                    padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                    position: sticky; top: 0; background: #1a1f2e; z-index: 1;
                }
                .modal-close { background: none; border: none; color: white; cursor: pointer; }
                
                .modal-body { padding: 1.25rem; }
                .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
                .summary-id { margin: 0; color: var(--color-primary); font-size: 1.2rem; }
                .summary-date { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
                
                .detail-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem 1.25rem; margin-bottom: 1.25rem;
                }
                .full-width { grid-column: 1 / -1; }
                .detail-grid label { display: block; color: rgba(255,255,255,0.45); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 0.25rem; }
                .detail-grid p { margin: 0; font-size: 0.9rem; color: white; }
                .highlight-price { font-size: 1.05rem; font-weight: 700; color: var(--color-primary); }
                
                /* ── Status Update Section ── */
                .status-update-section {
                    margin-top: 1.5rem;
                    padding: 1.25rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 0.875rem;
                }
                .sus-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.35);
                    margin-bottom: 1.25rem;
                }

                /* Stepper */
                .stepper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.25rem;
                }
                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.45rem;
                    flex-shrink: 0;
                    opacity: 0.35;
                    transition: opacity 0.2s;
                }
                .step-item.done, .step-item.current { opacity: 1; }
                .step-circle {
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.05);
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    transition: all 0.25s;
                }
                .step-item.current .step-circle {
                    box-shadow: 0 0 0 4px rgba(255,255,255,0.08);
                }
                .step-label {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.55);
                    white-space: nowrap;
                    transition: color 0.2s;
                }
                .step-connector {
                    flex: 1;
                    height: 2px;
                    min-width: 18px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 1px;
                    margin-bottom: 20px;
                    transition: background 0.25s;
                }
                .step-connector.done { background: rgba(255,255,255,0.35); }

                /* Cancelled state */
                .cancelled-banner {
                    display: flex; align-items: center; gap: 0.6rem;
                    padding: 0.75rem 1rem;
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 0.625rem;
                    color: #ef4444;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                }

                /* Action buttons */
                .sus-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .sus-next-btn {
                    flex: 1;
                    min-width: 160px;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    padding: 0.8rem 1.25rem;
                    border-radius: 0.625rem;
                    border: 1px solid var(--next-color, var(--color-primary));
                    background: color-mix(in srgb, var(--next-color, var(--color-primary)) 15%, transparent);
                    color: var(--next-color, var(--color-primary));
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.01em;
                }
                .sus-next-btn:hover {
                    background: color-mix(in srgb, var(--next-color, var(--color-primary)) 28%, transparent);
                    box-shadow: 0 0 14px color-mix(in srgb, var(--next-color, var(--color-primary)) 30%, transparent);
                    transform: translateY(-1px);
                }
                .sus-arrow {
                    margin-left: auto;
                    opacity: 0.6;
                    font-size: 1rem;
                }
                .sus-cancel-btn {
                    display: flex; align-items: center; gap: 0.45rem;
                    padding: 0.8rem 1.1rem;
                    border-radius: 0.625rem;
                    border: 1px solid rgba(239,68,68,0.3);
                    background: transparent;
                    color: #ef4444;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .sus-cancel-btn:hover {
                    background: rgba(239,68,68,0.1);
                    border-color: #ef4444;
                }
                .sus-complete {
                    display: flex; align-items: center; gap: 0.5rem;
                    color: #10b981;
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding: 0.5rem 0;
                }

                /* Form Styles */
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; font-size: 0.9rem; }
                .form-input {
                    width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.75rem; border-radius: 0.5rem; color: white; font-size: 0.95rem;
                    outline: none; transition: border-color 0.2s;
                }
                .form-input:focus { border-color: var(--color-primary); }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .form-actions {
                    display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;
                }
                .submit-btn {
                    background: var(--color-primary); color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
                    cursor: pointer;
                }
                .cancel-btn {
                    background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
                    cursor: pointer;
                }
                .cancel-btn:hover { background: rgba(255,255,255,0.05); color: white; }
            `}</style>
        </div>
    );
};

export default StaffOrderManagement;
