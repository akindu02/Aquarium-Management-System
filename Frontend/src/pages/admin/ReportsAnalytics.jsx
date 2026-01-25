import React, { useState } from 'react';
import { BarChart3, TrendingUp, Package, Calendar, Download, FileText, ArrowUp, ArrowDown, Coins } from 'lucide-react';

const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Dummy Data for Charts/Stats
    const stats = {
        sales: { total: 450000, growth: '+12.5%', lastMonth: 400000 },
        bookings: { total: 45, pending: 12, completed: 28 },
        inventory: { total: 156, lowStock: 8, outOfStock: 2 }
    };

    const recentReports = [
        { id: 'R-2025-001', name: 'October Monthly Sales', date: '2025-10-31', type: 'Sales', size: '1.2 MB' },
        { id: 'R-2025-002', name: 'Inventory Status Report', date: '2025-10-28', type: 'Inventory', size: '850 KB' },
        { id: 'R-2025-003', name: 'Q3 Service Performance', date: '2025-10-15', type: 'Service', size: '2.4 MB' },
    ];

    // Simple Render Functions for different sections
    const renderOverview = () => (
        <div className="analytics-grid">
            {/* Sales Card */}
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon sales"><Coins size={20} /></div>
                </div>
                <h3>Total Sales</h3>
                <p className="stat-value">LKR {stats.sales.total.toLocaleString()}</p>
                <p className="stat-sub">vs. LKR {stats.sales.lastMonth.toLocaleString()} last month</p>
            </div>

            {/* Inventory Card */}
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon inventory"><Package size={20} /></div>
                </div>
                <h3>Inventory Health</h3>
                <p className="stat-value">{stats.inventory.total} Items</p>
                <p className="stat-sub">Total products tracked</p>
            </div>

            {/* Services Card */}
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon service"><Calendar size={20} /></div>
                </div>
                <h3>Service Bookings</h3>
                <p className="stat-value">{stats.bookings.total} Active</p>
                <p className="stat-sub">Requests this month</p>
            </div>
        </div>
    );

    const renderSalesDetail = () => (
        <div className="detail-view">
            <h3>Sales Performance</h3>
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Product Category</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Live Fish</td>
                        <td>1,240</td>
                        <td>LKR 150,000</td>
                    </tr>
                    <tr>
                        <td>Tanks & Aquariums</td>
                        <td>45</td>
                        <td>LKR 220,000</td>
                    </tr>
                    <tr>
                        <td>Fish Food</td>
                        <td>850</td>
                        <td>LKR 80,000</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    const renderInventoryDetail = () => (
        <div className="detail-view">
            <h3>Inventory Status</h3>
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Total Items</th>
                        <th>Valuation</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Equipment</td>
                        <td>45</td>
                        <td>LKR 450,000</td>
                        <td><span className="status ok">Healthy</span></td>
                    </tr>
                    <tr>
                        <td>Plants</td>
                        <td>120</td>
                        <td>LKR 60,000</td>
                        <td><span className="status warn">Check Stock</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );



    return (
        <div className="reports-analytics">
            <div className="ra-header">
                <div>
                    <h2 className="ra-title">Reports & Analytics</h2>
                    <p className="ra-subtitle">Business insights and performance metrics</p>
                </div>
                <div className="ra-actions">
                    <button className="btn-secondary" onClick={() => alert('Exporting data...')}>
                        <Download size={18} />
                        Export
                    </button>
                    <button className="btn-primary" onClick={() => alert('Generating new report...')}>
                        <FileText size={18} />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="ra-tabs">
                {['overview', 'sales', 'inventory'].map(tab => (
                    <button
                        key={tab}
                        className={`ra-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="ra-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'sales' && renderSalesDetail()}
                {activeTab === 'inventory' && renderInventoryDetail()}
            </div>

            {/* Recent Reports Section (Visible on Overview) */}
            {activeTab === 'overview' && (
                <div className="recent-reports-section">
                    <h3>Recent Report Files</h3>
                    <div className="report-list">
                        {recentReports.map(report => (
                            <div key={report.id} className="report-item">
                                <div className="report-info">
                                    <div className="report-icon"><FileText size={20} /></div>
                                    <div>
                                        <h4>{report.name}</h4>
                                        <p>{report.date} • {report.size}</p>
                                    </div>
                                </div>
                                <span className="report-type">{report.type}</span>
                                <button className="btn-download"><Download size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .reports-analytics {
                    color: var(--text-main);
                }

                .ra-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .ra-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
                .ra-subtitle { color: var(--text-muted); }

                .ra-actions { display: flex; gap: 1rem; }
                .btn-primary, .btn-secondary {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    border: none;
                }
                .btn-primary { background: var(--color-primary); color: white; }
                .btn-secondary { background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid rgba(255,255,255,0.1); }
                .btn-primary:hover, .btn-secondary:hover { transform: translateY(-1px); filter: brightness(1.1); }

                .ra-tabs {
                    display: flex; gap: 0.5rem; margin-bottom: 2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 1rem;
                }
                .ra-tab {
                    padding: 0.5rem 1.5rem; background: transparent; border: none;
                    color: var(--text-muted); font-weight: 600; cursor: pointer; border-radius: 0.5rem;
                }
                .ra-tab.active { background: var(--color-primary); color: white; }

                /* Grid Layout */
                .analytics-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;
                }

                .stat-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 1.5rem; border-radius: 1rem;
                    position: relative; overflow: hidden;
                }

                .stat-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
                .stat-icon {
                    width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
                }
                .stat-icon.sales { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stat-icon.inventory { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .stat-icon.service { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

                .stat-diff { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
                .stat-diff.positive { color: #10b981; }
                .stat-diff.negative { color: #ef4444; }

                .stat-value { font-size: 1.8rem; font-weight: 700; margin: 0.5rem 0; }
                .stat-sub { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }

                /* Charts */
                .chart-preview { display: flex; align-items: flex-end; gap: 8px; height: 100px; padding-top: 1rem; }
                .bar { flex: 1; background: rgba(255,255,255,0.1); border-radius: 4px; transition: height 0.3s; }
                .bar.active { background: var(--color-primary); }
                .bar:hover { background: rgba(255,255,255,0.3); }

                /* Progress Bars */
                .progress-list { margin-top: 1rem; }
                .p-item { margin-bottom: 0.8rem; }
                .p-item span { display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color: var(--text-muted); }
                .p-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; }
                .p-bar { height: 100%; border-radius: 3px; }
                .fill-green { background: #10b981; }
                .fill-yellow { background: #f59e0b; }
                .fill-red { background: #ef4444; }

                /* Circle Stats */
                .circle-stats { display: flex; gap: 2rem; margin-top: 1.5rem; }
                .c-stat { display: flex; flex-direction: column; }
                .c-val { font-size: 1.2rem; font-weight: 700; }
                .c-label { font-size: 0.8rem; color: var(--text-muted); }

                /* Table Styles */
                .detail-view { background: rgba(255,255,255,0.03); padding: 2rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.08); }
                .analytics-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                .analytics-table th { text-align: left; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-size: 0.9rem; }
                .analytics-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .trend.up { color: #10b981; }
                .trend.down { color: #ef4444; }
                .status.ok { color: #10b981; }
                .status.warn { color: #f59e0b; }

                /* Service Grid */
                .service-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
                .s-box { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); }
                .s-box h4 { margin: 0 0 0.5rem 0; color: var(--color-primary); }
                .s-box p { font-size: 1.2rem; font-weight: 600; margin: 0 0 0.5rem 0; }
                .s-box span { font-size: 0.85rem; color: var(--text-muted); }

                /* Recent Reports */
                .recent-reports-section { margin-top: 2rem; padding: 2rem; background: rgba(255,255,255,0.03); border-radius: 1rem; border: 1px solid rgba(255,255,255,0.08); }
                .report-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .report-item {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; transition: all 0.2s;
                }
                .report-item:hover { background: rgba(255,255,255,0.05); }
                .report-info { display: flex; align-items: center; gap: 1rem; }
                .report-icon { width: 40px; height: 40px; background: rgba(99, 102, 241, 0.1); color: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .report-info h4 { margin: 0; font-weight: 500; font-size: 0.95rem; }
                .report-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }
                .report-type { background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color: var(--text-muted); }
                .btn-download { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; }
                .btn-download:hover { color: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default ReportsAnalytics;
