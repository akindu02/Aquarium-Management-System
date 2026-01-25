import React, { useState } from 'react';
import { Search, Filter, Eye, DollarSign, Package, Check, X, Truck, Clock, AlertCircle, ChevronDown, Download, Users, Factory, Plus } from 'lucide-react';

const StaffOrderManagement = () => {
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'supplier'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- Customer Orders Data ---
    const initialCustomerOrders = [
        { id: 'ORD-5001', customer: 'Kasun Perera', email: 'kasun@gmail.com', items: 'Goldfish (x2), Fish Food', date: '2025-10-24', total: 950, paymentStatus: 'Paid', status: 'Delivered', address: '123 Beach Rd, Matara' },
        { id: 'ORD-5002', customer: 'Nimali Silva', email: 'nimali@yahoo.com', items: 'Glass Tank 30L', date: '2025-10-25', total: 8500, paymentStatus: 'Paid', status: 'Processing', address: '45 Galle Rd, Colombo' },
        { id: 'ORD-5003', customer: 'Saman Kumara', email: 'saman@hotmail.com', items: 'Canister Filter', date: '2025-10-25', total: 15000, paymentStatus: 'Pending', status: 'Pending', address: '88 Main St, Kandy' },
        { id: 'ORD-5004', customer: 'Chathuri Bandara', email: 'chathuri@gmail.com', items: 'Plant Fertilizer, LED Light', date: '2025-10-26', total: 4400, paymentStatus: 'Paid', status: 'Shipped', address: '12 Flower Rd, Galle' },
    ];
    const [customerOrders, setCustomerOrders] = useState(initialCustomerOrders);

    // --- Supplier Orders Data ---
    const initialSupplierOrders = [
        { id: 'SUP-9001', supplier: 'Aquarium Imports Ltd', items: 'Neon Tetra Batch (500)', date: '2025-10-28', cost: 25000, status: 'Pending', expected: '2025-11-01' },
        { id: 'SUP-9002', supplier: 'Lanka Tanks Makers', items: 'Glass Tanks 50L (x10)', date: '2025-10-26', cost: 45000, status: 'Received', expected: '2025-10-30' },
        { id: 'SUP-9003', supplier: 'Global Fish Foods', items: 'Flakes Bulk Pack (x50)', date: '2025-10-25', cost: 12000, status: 'Shipped', expected: '2025-10-31' },
    ];
    const [supplierOrders, setSupplierOrders] = useState(initialSupplierOrders);

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
    const updateCustomerStatus = (id, newStatus) => {
        setCustomerOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const updateSupplierStatus = (id, newStatus) => {
        setSupplierOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const filteredData = activeTab === 'customer'
        ? customerOrders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
        : supplierOrders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

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
                {activeTab === 'supplier' && (
                    <button className="new-req-btn">
                        <Plus size={18} /> New Request
                    </button>
                )}
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
                                <th>Items Details</th>
                                <th>Order Date</th>
                                <th>Exp. Cost</th>
                                <th>Status</th>
                                <th>Expected</th>
                                <th>Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {filteredData.map(item => {
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
                                    <td className="items-cell" title={item.items}>{item.items}</td>
                                    <td>{item.date}</td>
                                    <td className="font-bold">LKR {(item.total || item.cost).toLocaleString()}</td>
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                            <StatusIcon size={12} style={{ marginRight: '4px' }} />
                                            {item.status}
                                        </div>
                                    </td>
                                    {activeTab === 'supplier' && (
                                        <td>
                                            <div className="supplier-date">{item.expected}</div>
                                        </td>
                                    )}
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
                                <span className="summary-date">{selectedOrder.date}</span>
                            </div>

                            <div className="detail-grid">
                                <div>
                                    <label>Party Name</label>
                                    <p>{selectedOrder.customer || selectedOrder.supplier}</p>
                                </div>
                                <div>
                                    <label>{selectedOrder.type === 'customer' ? 'Total Amount' : 'Estimated Cost'}</label>
                                    <p className="highlight-price">LKR {(selectedOrder.total || selectedOrder.cost).toLocaleString()}</p>
                                </div>
                                <div className="full-width">
                                    <label>Items List</label>
                                    <p>{selectedOrder.items}</p>
                                </div>
                                {selectedOrder.address && (
                                    <div className="full-width">
                                        <label>Shipping Address</label>
                                        <p>{selectedOrder.address}</p>
                                    </div>
                                )}
                            </div>

                            <div className="action-section">
                                <h4>Update Status</h4>
                                <div className="status-buttons">
                                    {selectedOrder.type === 'customer' ? (
                                        <>
                                            <button className="st-btn" onClick={() => updateCustomerStatus(selectedOrder.id, 'Processing')}>Processing</button>
                                            <button className="st-btn" onClick={() => updateCustomerStatus(selectedOrder.id, 'Shipped')}>Shipped</button>
                                            <button className="st-btn success" onClick={() => updateCustomerStatus(selectedOrder.id, 'Delivered')}>Delivered</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="st-btn" onClick={() => updateSupplierStatus(selectedOrder.id, 'Pending')}>Pending</button>
                                            <button className="st-btn" onClick={() => updateSupplierStatus(selectedOrder.id, 'Shipped')}>Shipped</button>
                                            <button className="st-btn success" onClick={() => updateSupplierStatus(selectedOrder.id, 'Received')}>Received</button>
                                        </>
                                    )}
                                </div>
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
                }
                
                .so-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 2rem;
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
                }
                .search-box {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(0,0,0,0.2); padding: 0.75rem 1rem;
                    border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
                    width: 350px;
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
                    flex: 1; overflow-y: auto; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
                }
                .so-table { width: 100%; border-collapse: collapse; }
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
                    width: 500px; border-radius: 1.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    overflow: hidden;
                }
                .modal-header {
                    padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-close { background: none; border: none; color: white; cursor: pointer; }
                
                .modal-body { padding: 2rem; }
                .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .summary-id { margin: 0; color: var(--color-primary); }
                .summary-date { color: rgba(255,255,255,0.5); }
                
                .detail-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;
                }
                .full-width { grid-column: 1 / -1; }
                .detail-grid label { display: block; color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 0.5rem; }
                .detail-grid p { margin: 0; font-size: 1rem; color: white; }
                .highlight-price { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); }
                
                .action-section h4 { color: rgba(255,255,255,0.5); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 1rem; }
                .status-buttons { display: flex; gap: 1rem; }
                .st-btn {
                    flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: white; cursor: pointer; transition: all 0.2s;
                }
                .st-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
                .st-btn.success:hover { border-color: #10b981; color: #10b981; }
            `}</style>
        </div>
    );
};

export default StaffOrderManagement;
