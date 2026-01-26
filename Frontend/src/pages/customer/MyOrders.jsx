import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, XCircle, Search, Filter } from 'lucide-react';

const MyOrders = () => {
    const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

    // Dummy Data
    const orders = [
        {
            id: 'ORD-2023-1001',
            date: '2023-10-25',
            items: [
                { name: 'Neon Tetra', qty: 10, price: 120 },
                { name: 'Goldfish Food Flakes', qty: 1, price: 450 }
            ],
            total: 1650,
            status: 'processing', // processing, shipped, delivered, cancelled
            paymentStatus: 'paid'
        },
        {
            id: 'ORD-2023-0988',
            date: '2023-10-20',
            items: [
                { name: 'Glass Tank 30L', qty: 1, price: 8500 },
                { name: 'Decor Stones (1kg)', qty: 2, price: 350 }
            ],
            total: 9200,
            status: 'shipped',
            paymentStatus: 'paid'
        },
        {
            id: 'ORD-2023-0950',
            date: '2023-10-15',
            items: [
                { name: 'Anti-Chlorine', qty: 1, price: 600 }
            ],
            total: 600,
            status: 'delivered',
            paymentStatus: 'paid'
        },
        {
            id: 'ORD-2023-0820',
            date: '2023-09-30',
            items: [
                { name: 'Betta Fish', qty: 2, price: 250 }
            ],
            total: 500,
            status: 'cancelled',
            paymentStatus: 'refunded'
        }
    ];

    const getStatusInfo = (status) => {
        switch (status) {
            case 'processing': return { icon: <Clock size={16} />, color: 'text-blue-400 bg-blue-400/10', label: 'Processing' };
            case 'shipped': return { icon: <Truck size={16} />, color: 'text-purple-400 bg-purple-400/10', label: 'Shipped' };
            case 'delivered': return { icon: <CheckCircle size={16} />, color: 'text-green-400 bg-green-400/10', label: 'Delivered' };
            case 'cancelled': return { icon: <XCircle size={16} />, color: 'text-red-400 bg-red-400/10', label: 'Cancelled' };
            default: return { icon: <Package size={16} />, color: 'text-gray-400 bg-gray-400/10', label: status };
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['processing', 'shipped'].includes(order.status);
        if (filter === 'completed') return order.status === 'delivered';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <div>
                    <h2 className="page-title">My Orders</h2>
                    <p className="page-subtitle">Track and manage your purchases</p>
                </div>

                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search Order ID..." />
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Orders
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
                <button
                    className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            {/* Orders List */}
            <div className="orders-list">
                {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} />
                        <h3>No orders found</h3>
                        <p>You haven't placed any orders in this category yet.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
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
                                    <button className="details-btn">
                                        Details <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

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

                /* Orders List */
                .orders-list {
                    display: grid;
                    gap: 1.25rem;
                }

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

                .order-date {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

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
                    color: rgba(255, 255, 255, 0.8);
                }

                .item-qty { color: var(--text-muted); font-size: 0.9rem; }

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
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .track-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-main);
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .track-btn:hover { background: rgba(255, 255, 255, 0.1); }

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

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    color: var(--text-muted);
                    text-align: center;
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                }

                @media (max-width: 768px) {
                    .order-content {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .order-total {
                        align-items: flex-start;
                        margin-top: 0.5rem;
                        padding-top: 0.5rem;
                        border-top: 1px dashed rgba(255, 255, 255, 0.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default MyOrders;
