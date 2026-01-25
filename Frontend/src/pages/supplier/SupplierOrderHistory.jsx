import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';

const SupplierOrderHistory = () => {
    // Dummy Data for Order History
    const historyData = [
        { id: 'REQ-001', date: '2025-10-20', items: 'Goldfish (Medium) x100', status: 'Completed', amount: 15000 },
        { id: 'REQ-002', date: '2025-10-21', items: 'Neon Tetra x200', status: 'Completed', amount: 8000 },
        { id: 'REQ-003', date: '2025-10-22', items: 'Glass Tank 50L x5', status: 'Declined', amount: 0 },
        { id: 'REQ-004', date: '2025-10-23', items: 'Filter Sponges x50', status: 'Completed', amount: 2500 },
        { id: 'REQ-005', date: '2025-10-24', items: 'Heater 100W x10', status: 'Completed', amount: 12000 },
    ];

    const [orders, setOrders] = useState(historyData);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="badge success"><CheckCircle size={14} /> Completed</span>;
            case 'Declined': return <span className="badge fail"><XCircle size={14} /> Declined</span>;
            default: return <span className="badge neutral"><Clock size={14} /> {status}</span>;
        }
    };

    return (
        <div className="order-history-container">
            <div className="oh-header">
                <div>
                    <h2>Order History</h2>
                    <p>View details of past transactions and processed requests</p>
                </div>
                <button className="btn-export">
                    <Download size={16} /> Export Report
                </button>
            </div>

            <div className="oh-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search Order ID or Items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined</option>
                    </select>
                </div>
            </div>

            <div className="oh-table-wrapper">
                <table className="oh-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items Summary</th>
                            <th>Status</th>
                            <th>Amount (LKR)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="mono">{order.id}</td>
                                    <td>{order.date}</td>
                                    <td className="items-col">{order.items}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td className="fw-600">{order.status === 'Declined' ? '-' : `LKR ${order.amount.toLocaleString()}`}</td>
                                    <td>
                                        <button className="btn-view" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No orders found matching criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .order-history-container {
                    display: flex; flex-direction: column; height: 100%;
                }

                .oh-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 2rem;
                }
                .oh-header h2 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0 0 0.5rem 0; }
                .oh-header p { color: rgba(255,255,255,0.6); margin: 0; }

                .btn-export {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    color: white; padding: 0.75rem 1.25rem; border-radius: 8px;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-export:hover { background: rgba(255,255,255,0.15); }

                .oh-toolbar {
                    display: flex; gap: 1rem; margin-bottom: 1.5rem;
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
                
                .filter-box {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(0,0,0,0.2); padding: 0 1rem;
                    border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
                }
                .filter-box select {
                    background: transparent; border: none; outline: none;
                    color: white; padding: 0.75rem 0; cursor: pointer;
                }
                .filter-box select option { background: #1a1f2e; color: white; }

                .oh-table-wrapper {
                    flex: 1; overflow-y: auto; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
                }
                .oh-table { width: 100%; border-collapse: collapse; }
                .oh-table th {
                    text-align: left; padding: 1rem 1.5rem; position: sticky; top: 0;
                    background: rgba(20, 20, 30, 0.95); backdrop-filter: blur(5px);
                    color: rgba(255,255,255,0.5); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10;
                }
                .oh-table td {
                    padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
                    vertical-align: middle; color: rgba(255,255,255,0.9); font-size: 0.95rem;
                }
                .oh-table tr:hover { background: rgba(255,255,255,0.02); }

                .mono { font-family: monospace; color: var(--color-primary); }
                .items-col { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgba(255,255,255,0.8); }
                .fw-600 { font-weight: 600; }
                .text-center { text-align: center; color: rgba(255,255,255,0.4); padding: 2rem; }

                .badge {
                    display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.75rem;
                    border-radius: 20px; font-size: 0.85rem; font-weight: 500;
                }
                .badge.success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .badge.fail { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .badge.neutral { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); }

                .btn-view {
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.05); color: white;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-view:hover { background: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default SupplierOrderHistory;
