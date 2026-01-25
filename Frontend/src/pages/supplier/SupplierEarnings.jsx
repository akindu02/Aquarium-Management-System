import React, { useState } from 'react';
import { Banknote, TrendingUp, CreditCard, Download, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

const SupplierEarnings = () => {
    // Dummy Data
    const summary = {
        totalRevenue: 125000,
        availablePayout: 45000,
        pendingPayout: 12000,
        thisMonth: 28500
    };

    const transactions = [
        { id: 'TRX-9871', date: '2025-10-24', orderId: 'REQ-005', amount: 12000, status: 'Completed', type: 'Credit' },
        { id: 'TRX-9872', date: '2025-10-23', orderId: 'REQ-004', amount: 2500, status: 'Completed', type: 'Credit' },
        { id: 'TRX-9873', date: '2025-10-21', orderId: 'REQ-002', amount: 8000, status: 'Completed', type: 'Credit' },
        { id: 'TRX-9874', date: '2025-10-20', orderId: 'PAYOUT-001', amount: 50000, status: 'Completed', type: 'Debit' }, // Payout
        { id: 'TRX-9875', date: '2025-10-20', orderId: 'REQ-001', amount: 15000, status: 'Pending', type: 'Credit' },
    ];

    const [timeRange, setTimeRange] = useState('This Month');

    const getStatusStyle = (status) => {
        return status === 'Completed' ? { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' } : { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    };

    return (
        <div className="earnings-container">
            <div className="earn-header">
                <div>
                    <h2>Earnings & Payouts</h2>
                    <p>Track your revenue flow and financial history</p>
                </div>
                <div className="earn-actions">
                    <select className="time-select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </select>
                    <button className="btn-withdraw">
                        <CreditCard size={18} /> Request Payout
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="earn-metrics">
                <div className="metric-card primary">
                    <div className="icon-wrapper"><Banknote size={24} /></div>
                    <div className="metric-info">
                        <span className="label">Total Revenue</span>
                        <span className="value">LKR {summary.totalRevenue.toLocaleString()}</span>

                    </div>
                </div>
                <div className="metric-card success">
                    <div className="icon-wrapper"><CreditCard size={24} /></div>
                    <div className="metric-info">
                        <span className="label">Available for Payout</span>
                        <span className="value">LKR {summary.availablePayout.toLocaleString()}</span>
                        <span className="sub-text">Min payout: LKR 5,000</span>
                    </div>
                </div>
                <div className="metric-card warning">
                    <div className="icon-wrapper"><TrendingUp size={24} /></div>
                    <div className="metric-info">
                        <span className="label">Pending Clearance</span>
                        <span className="value">LKR {summary.pendingPayout.toLocaleString()}</span>
                        <span className="sub-text">Clears in 3-5 days</span>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="transactions-section">
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <button className="btn-download"><Download size={16} /> Export CSV</button>
                </div>

                <div className="table-wrapper">
                    <table className="earn-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Reference</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(trx => {
                                const statusStyle = getStatusStyle(trx.status);
                                return (
                                    <tr key={trx.id}>
                                        <td className="text-muted"><div className="flex-center"><Calendar size={14} /> {trx.date}</div></td>
                                        <td className="mono">{trx.id}</td>
                                        <td>{trx.orderId}</td>
                                        <td>
                                            <span className={`type-badge ${trx.type === 'Debit' ? 'debit' : 'credit'}`}>
                                                {trx.type === 'Debit' ? 'Payout' : 'Sale'}
                                            </span>
                                        </td>
                                        <td className={`amount ${trx.type === 'Debit' ? 'text-red' : 'text-green'}`}>
                                            {trx.type === 'Debit' ? '-' : '+'} LKR {trx.amount.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                {trx.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .earnings-container {
                    display: flex; flex-direction: column; height: 100%; overflow-y: auto;
                }

                .earn-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 2rem;
                }
                .earn-header h2 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0 0 0.5rem 0; }
                .earn-header p { color: rgba(255,255,255,0.6); margin: 0; }

                .earn-actions { display: flex; gap: 1rem; }

                .time-select {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;
                    outline: none;
                }
                .time-select option { background: #1a1f2e; }

                .btn-withdraw {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: var(--color-primary); color: white; border: none;
                    padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-withdraw:hover { background: #3aa8a0; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2); }

                .earn-metrics {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem; margin-bottom: 2.5rem;
                }

                .metric-card {
                    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1.5rem; border-radius: 16px; display: flex; align-items: flex-start; gap: 1rem;
                }
                
                .icon-wrapper {
                    padding: 10px; border-radius: 12px; background: rgba(255,255,255,0.05);
                    display: flex; align-items: center; justify-content: center;
                }
                .metric-card.primary .icon-wrapper { background: rgba(78, 205, 196, 0.1); color: var(--color-primary); }
                .metric-card.success .icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .metric-card.warning .icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .metric-info { display: flex; flex-direction: column; }
                .metric-info .label { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.25rem; }
                .metric-info .value { font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
                
                .trend { font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
                .trend.positive { color: #10b981; }
                .sub-text { font-size: 0.8rem; color: rgba(255,255,255,0.4); }

                .transactions-section {
                    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px; padding: 1.5rem; flex: 1; display: flex; flex-direction: column;
                }
                .section-header {
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
                }
                .section-header h3 { margin: 0; color: white; font-size: 1.25rem; }
                
                .btn-download {
                    background: transparent; border: 1px solid rgba(255,255,255,0.2);
                    color: rgba(255,255,255,0.8); padding: 0.5rem 1rem; border-radius: 6px;
                    display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;
                }
                .btn-download:hover { background: rgba(255,255,255,0.05); color: white; }

                .table-wrapper { overflow-y: auto; }
                .earn-table { width: 100%; border-collapse: collapse; }
                .earn-table th {
                    text-align: left; padding: 1rem; color: rgba(255,255,255,0.4);
                    font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .earn-table td {
                    padding: 1rem; color: rgba(255,255,255,0.9); border-bottom: 1px solid rgba(255,255,255,0.05);
                    font-size: 0.95rem; vertical-align: middle;
                }
                .earn-table tr:last-child td { border-bottom: none; }

                .flex-center { display: flex; align-items: center; gap: 0.5rem; }
                .mono { font-family: monospace; color: rgba(255,255,255,0.6); }
                
                .type-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
                .type-badge.credit { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .type-badge.debit { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .amount { font-weight: 600; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
                
                .status-badge {
                    padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default SupplierEarnings;
