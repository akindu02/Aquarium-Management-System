import React, { useState } from 'react';
import { Search, Filter, Eye, DollarSign, Package, Check, X, Truck, Clock, AlertCircle, ChevronDown, Download } from 'lucide-react';

const OrderManagement = () => {
    // Dummy Data
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

    const [orders, setOrders] = useState(initialOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Handle Status Change
    const updateOrderStatus = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    // Helper for Status Badges
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', icon: Check };
            case 'Shipped': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: Truck };
            case 'Processing': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: Clock };
            case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: X };
            default: return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', icon: AlertCircle };
        }
    };

    // Helper for Payment Badges
    const getPaymentStyle = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981' };
            case 'Pending': return { color: '#f59e0b' };
            case 'Failed': return { color: '#ef4444' };
            default: return { color: '#9ca3af' };
        }
    };

    return (
        <div className="order-management">
            <div className="om-header">
                <div>
                    <h2 className="om-title">Orders & Transactions</h2>
                    <p className="om-subtitle">Track customer orders and payment statuses</p>
                </div>
                <button className="btn-export">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Toolbar */}
            <div className="om-toolbar">
                <div className="om-filter-group">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="select-wrapper">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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

            {/* Orders Table */}
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
                            const statusStyle = getStatusStyle(order.status);
                            const StatusIcon = statusStyle.icon;
                            const paymentColor = getPaymentStyle(order.paymentStatus).color;

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
                                        <span className="payment-dot" style={{ backgroundColor: paymentColor }}></span>
                                        {order.paymentStatus}
                                    </td>
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                            <StatusIcon size={12} style={{ marginRight: '4px' }} />
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

            {/* Order Details Modal */}
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
                                <div className="summary-total">
                                    LKR {selectedOrder.total.toLocaleString()}
                                </div>
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
                                    <button
                                        className={`status-btn ${selectedOrder.status === 'Processing' ? 'active' : ''}`}
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'Processing'); setSelectedOrder({ ...selectedOrder, status: 'Processing' }); }}
                                    >Processing</button>
                                    <button
                                        className={`status-btn ${selectedOrder.status === 'Shipped' ? 'active' : ''}`}
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'Shipped'); setSelectedOrder({ ...selectedOrder, status: 'Shipped' }); }}
                                    >Shipped</button>
                                    <button
                                        className={`status-btn ${selectedOrder.status === 'Delivered' ? 'active' : ''}`}
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'Delivered'); setSelectedOrder({ ...selectedOrder, status: 'Delivered' }); }}
                                    >Delivered</button>
                                    <button
                                        className={`status-btn ${selectedOrder.status === 'Cancelled' ? 'active' : ''}`}
                                        onClick={() => { updateOrderStatus(selectedOrder.id, 'Cancelled'); setSelectedOrder({ ...selectedOrder, status: 'Cancelled' }); }}
                                    >Cancelled</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .om-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .om-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .om-subtitle { color: var(--text-muted); font-size: 0.95rem; }

                .btn-export {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-main);
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-export:hover { background: rgba(255, 255, 255, 0.1); }

                .om-toolbar {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1rem;
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                }

                .om-filter-group { display: flex; gap: 1rem; }

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
                    background: transparent; border: none; padding: 0.6rem;
                    color: var(--text-main); width: 100%; outline: none;
                }

                .select-wrapper { position: relative; }
                .select-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }
                select {
                    appearance: none; background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem;
                    padding: 0.6rem 2rem 0.6rem 1rem; color: var(--text-main); cursor: pointer; outline: none;
                    min-width: 150px;
                }

                .om-table-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    overflow-x: auto;
                }
                .om-table { width: 100%; border-collapse: collapse; min-width: 900px; }
                .om-table th {
                    text-align: left; padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.02); color: var(--text-muted);
                    font-size: 0.85rem; text-transform: uppercase;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .om-table td {
                    padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    vertical-align: middle; color: var(--text-main);
                }

                .font-mono { font-family: monospace; color: var(--color-primary); }
                .font-bold { font-weight: 700; }
                
                .customer-cell { display: flex; align-items: center; gap: 0.75rem; }
                .customer-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: 700; font-size: 0.8rem;
                }
                .customer-name { font-weight: 500; }
                .customer-email { font-size: 0.8rem; color: var(--text-muted); }

                .truncate-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .payment-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

                .status-badge {
                    display: inline-flex; align-items: center; padding: 0.25rem 0.75rem;
                    border-radius: 50px; font-size: 0.8rem; font-weight: 600;
                }

                .btn-icon {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; transition: all 0.2s;
                    background: rgba(255, 255, 255, 0.05); color: var(--text-main);
                }
                .btn-icon:hover { background: rgba(255, 255, 255, 0.1); }

                /* Modal */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center; z-index: 200;
                }
                .modal-content {
                    background: #1a1f2e; width: 600px;
                    border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0; overflow: hidden;
                }
                .modal-header {
                    padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h3 { margin: 0; color: var(--text-main); }
                .modal-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
                
                .modal-body { padding: 1.5rem; }

                .order-summary-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
                }
                .summary-id { color: var(--color-primary); font-family: monospace; margin: 0 0 0.25rem 0; }
                .summary-date { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
                .summary-total { font-size: 1.75rem; font-weight: 700; color: var(--text-main); }

                .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
                .detail-box h4, .items-box h4 {
                    font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;
                }
                .detail-box p { margin: 0.25rem 0; color: var(--text-main); }

                .items-box { background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
                .items-box p { margin: 0; color: var(--text-main); }

                .status-actions h4 { margin-top: 0; margin-bottom: 1rem; color: var(--text-main); }
                .status-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .status-btn {
                    padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1);
                    background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
                }
                .status-btn:hover { border-color: var(--color-primary); color: var(--text-main); }
                .status-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default OrderManagement;
