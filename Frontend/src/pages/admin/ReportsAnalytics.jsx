import React, { useState } from 'react';
import { BarChart3, TrendingUp, Package, Calendar, Download, FileText, ArrowUp, ArrowDown, Coins, Star, Droplets } from 'lucide-react';
import Swal from 'sweetalert2';

const ReportsAnalytics = () => {
    const [selectedReport, setSelectedReport] = useState('sales');
    const [isReportGenerated, setIsReportGenerated] = useState(false);

    const reportCategories = [
        {
            id: 'sales',
            title: 'Sales & Revenue Report',
            description: 'Total orders, revenue, and payment breakdown over time.',
            icon: <BarChart3 size={24} color="#3b82f6" />,
            bgColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6'
        },
        {
            id: 'inventory',
            title: 'Inventory & Stock Report',
            description: 'Current stock levels, low stock alerts, and out-of-stock items.',
            icon: <Package size={24} color="#f59e0b" />,
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b'
        },
        {
            id: 'product',
            title: 'Product Performance Report',
            description: 'Best selling products, fast-moving items, category insights, and product restock.',
            icon: <Star size={24} color="#10b981" />,
            bgColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981'
        },
        {
            id: 'service',
            title: 'Service Booking Report',
            description: 'Most ordered services and booking counts.',
            icon: <Calendar size={24} color="#8b5cf6" />,
            bgColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: '#8b5cf6'
        }
    ];

    const handleExport = () => {
        Swal.fire({ 
            icon: 'success', 
            title: 'Exporting Data...', 
            text: 'Your PDF report is being generated and downloaded.', 
            background: '#1a1f2e', 
            color: '#fff', 
            confirmButtonColor: '#4ecdc4',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const renderFilters = () => {
        return (
            <div className="filter-section">
                <h3 className="section-subtitle">SELECT PERIOD</h3>
                <div className="filter-controls">
                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Month (optional)</label>
                            <select className="filter-select">
                                <option>All months</option>
                                <option>January</option>
                                <option>February</option>
                                <option>March</option>
                                <option>April</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Year</label>
                            <select className="filter-select">
                                <option>2026</option>
                                <option>2025</option>
                                <option>2024</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-generate" onClick={() => setIsReportGenerated(true)}>
                        <FileText size={18} /> Generate Report
                    </button>
                </div>
            </div>
        );
    };

    const renderReportContent = () => {
        if (!isReportGenerated) return null;

        if (selectedReport === 'sales') {
            return (
                <div className="report-display-area">
                    <div className="report-header">
                        <div className="rh-left">
                            <h2 className="rh-title"><BarChart3 size={24} style={{ marginRight: '10px' }} /> Sales & Revenue Report</h2>
                            <p className="rh-subtitle">2026 — All Months</p>
                        </div>
                        <button className="btn-download" onClick={handleExport}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">YEAR</span>
                            <span className="stat-val">2026</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">TOTAL REVENUE</span>
                            <span className="stat-val text-primary">LKR 40,976</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">TOTAL ORDERS</span>
                            <span className="stat-val">53</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">BEST MONTH</span>
                            <span className="stat-val">March</span>
                        </div>
                    </div>

                    <h3 className="section-subtitle">INSIGHTS</h3>
                    <div className="insights-row">
                        <div className="insight-card border-green">
                            <div className="insight-head">
                                <TrendingUp size={20} color="#10b981" />
                                <span>BUSINESS TREND</span>
                            </div>
                            <h4 className="insight-val">Growing</h4>
                            <p className="insight-desc">Avg MoM Growth: +70%</p>
                        </div>
                        <div className="insight-card border-orange">
                            <div className="insight-head">
                                <Star size={20} color="#f59e0b" />
                                <span>BEST MONTH</span>
                            </div>
                            <h4 className="insight-val">March</h4>
                            <p className="insight-desc">LKR 25,800</p>
                        </div>
                        <div className="insight-card border-gray">
                            <div className="insight-head">
                                <ArrowDown size={20} color="#94a3b8" />
                                <span>LOWEST MONTH</span>
                            </div>
                            <h4 className="insight-val">February</h4>
                            <p className="insight-desc">LKR 15,176</p>
                        </div>
                        <div className="insight-card border-purple">
                            <div className="insight-head">
                                <Droplets size={20} color="#8b5cf6" />
                                <span>SEASONAL AVG REVENUE</span>
                            </div>
                            <div className="insight-list">
                                <div className="i-list-item active"><span>Q1</span> <strong>LKR 20,488</strong></div>
                                <div className="i-list-item"><span>Q2</span> <span className="muted">No data</span></div>
                                <div className="i-list-item"><span>Q3</span> <span className="muted">No data</span></div>
                                <div className="i-list-item"><span>Q4</span> <span className="muted">No data</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedReport === 'inventory') {
            return (
                <div className="report-display-area">
                    <div className="report-header">
                        <div className="rh-left">
                            <h2 className="rh-title"><Package size={24} style={{ marginRight: '10px' }} /> Inventory & Stock Report</h2>
                            <p className="rh-subtitle">Current Status</p>
                        </div>
                        <button className="btn-download" onClick={handleExport}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">TOTAL ITEMS</span>
                            <span className="stat-val">1,245</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">STOCK VALUE</span>
                            <span className="stat-val text-primary">LKR 185,400</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">LOW STOCK ITEMS</span>
                            <span className="stat-val" style={{ color: '#f59e0b' }}>12</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">OUT OF STOCK</span>
                            <span className="stat-val" style={{ color: '#ef4444' }}>3</span>
                        </div>
                    </div>

                    <h3 className="section-subtitle">INSIGHTS</h3>
                    <div className="insights-row">
                        <div className="insight-card border-orange">
                            <div className="insight-head">
                                <Package size={20} color="#f59e0b" />
                                <span>RESTOCK URGENCY</span>
                            </div>
                            <h4 className="insight-val">High</h4>
                            <p className="insight-desc">15 items need attention</p>
                        </div>
                        <div className="insight-card border-green">
                            <div className="insight-head">
                                <TrendingUp size={20} color="#10b981" />
                                <span>MOST STOCKED CATEGORY</span>
                            </div>
                            <h4 className="insight-val">Decorations</h4>
                            <p className="insight-desc">45% of total inventory</p>
                        </div>
                        <div className="insight-card border-purple">
                            <div className="insight-head">
                                <Calendar size={20} color="#8b5cf6" />
                                <span>EXPIRING SOON</span>
                            </div>
                            <h4 className="insight-val">5 Items</h4>
                            <p className="insight-desc">Expiring next 30 days</p>
                        </div>
                        <div className="insight-card border-gray">
                            <div className="insight-head">
                                <Coins size={20} color="#94a3b8" />
                                <span>DEAD STOCK (90+ DAYS)</span>
                            </div>
                            <h4 className="insight-val">LKR 12,000</h4>
                            <p className="insight-desc">8 items not moving</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedReport === 'product') {
            return (
                <div className="report-display-area">
                    <div className="report-header">
                        <div className="rh-left">
                            <h2 className="rh-title"><Star size={24} style={{ marginRight: '10px' }} /> Product Performance Report</h2>
                            <p className="rh-subtitle">2026 — All Months</p>
                        </div>
                        <button className="btn-download" onClick={handleExport}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">TOP PRODUCT</span>
                            <span className="stat-val text-primary" style={{ fontSize: '1.2rem' }}>TetraBits Food</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">UNITS SOLD</span>
                            <span className="stat-val">342</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">REVENUE TREND</span>
                            <span className="stat-val" style={{ color: '#10b981' }}>+15%</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">NEW PRODUCTS</span>
                            <span className="stat-val">8</span>
                        </div>
                    </div>

                    <h3 className="section-subtitle">INSIGHTS</h3>
                    <div className="insights-row">
                        <div className="insight-card border-green">
                            <div className="insight-head">
                                <TrendingUp size={20} color="#10b981" />
                                <span>FAST MOVERS</span>
                            </div>
                            <h4 className="insight-val">Fish Foods</h4>
                            <p className="insight-desc">Avg turnover: 5 days</p>
                        </div>
                        <div className="insight-card border-orange">
                            <div className="insight-head">
                                <Star size={20} color="#f59e0b" />
                                <span>MOST PROFITABLE</span>
                            </div>
                            <h4 className="insight-val">Canister Filters</h4>
                            <p className="insight-desc">40% margin average</p>
                        </div>
                        <div className="insight-card border-purple">
                            <div className="insight-head">
                                <BarChart3 size={20} color="#8b5cf6" />
                                <span>CATEGORY SHARE</span>
                            </div>
                            <div className="insight-list">
                                <div className="i-list-item active"><span>Equipment</span> <strong>45%</strong></div>
                                <div className="i-list-item"><span>Livestock</span> <strong>30%</strong></div>
                                <div className="i-list-item"><span>Foods</span> <strong>15%</strong></div>
                                <div className="i-list-item"><span>Decor</span> <strong>10%</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedReport === 'service') {
            return (
                <div className="report-display-area">
                    <div className="report-header">
                        <div className="rh-left">
                            <h2 className="rh-title"><Calendar size={24} style={{ marginRight: '10px' }} /> Service Booking Report</h2>
                            <p className="rh-subtitle">2026 — All Months</p>
                        </div>
                        <button className="btn-download" onClick={handleExport}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">TOTAL BOOKINGS</span>
                            <span className="stat-val">84</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">SERVICE REVENUE</span>
                            <span className="stat-val text-primary">LKR 95,500</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">COMPLETED</span>
                            <span className="stat-val" style={{ color: '#10b981' }}>72</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">PENDING</span>
                            <span className="stat-val" style={{ color: '#f59e0b' }}>12</span>
                        </div>
                    </div>

                    <h3 className="section-subtitle">INSIGHTS</h3>
                    <div className="insights-row">
                        <div className="insight-card border-purple">
                            <div className="insight-head">
                                <Star size={20} color="#8b5cf6" />
                                <span>MOST POPULAR</span>
                            </div>
                            <h4 className="insight-val">Tank Cleaning</h4>
                            <p className="insight-desc">55% of all bookings</p>
                        </div>
                        <div className="insight-card border-green">
                            <div className="insight-head">
                                <TrendingUp size={20} color="#10b981" />
                                <span>GROWTH TREND</span>
                            </div>
                            <h4 className="insight-val">Consistent</h4>
                            <p className="insight-desc">+5% more than last year</p>
                        </div>
                        <div className="insight-card border-orange">
                            <div className="insight-head">
                                <Calendar size={20} color="#f59e0b" />
                                <span>BUSIEST DAY</span>
                            </div>
                            <h4 className="insight-val">Weekends</h4>
                            <p className="insight-desc">80% of bookings</p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="reports-analytics-redesign">
            
            <h3 className="section-subtitle main-lbl">Select Report Type</h3>
            
            {/* Category Cards Grid */}
            <div className="category-grid">
                {reportCategories.map(cat => (
                    <div 
                        key={cat.id} 
                        className={`category-card ${selectedReport === cat.id ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedReport(cat.id);
                            setIsReportGenerated(false);
                        }}
                        style={{ '--cat-color': cat.borderColor }}
                    >
                        <div className="cat-icon-wrapper" style={{ background: cat.bgColor }}>
                            {cat.icon}
                        </div>
                        <div className="cat-content">
                            <h4>{cat.title}</h4>
                            <p>{cat.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            {renderFilters()}

            {/* Dynamic Report Content */}
            {renderReportContent()}

            <style>{`
                .reports-analytics-redesign {
                    color: var(--text-main);
                    padding-bottom: 2rem;
                }

                .section-subtitle {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--text-muted);
                    font-weight: 600;
                    margin-bottom: 1.25rem;
                    margin-top: 2rem;
                }
                .main-lbl { margin-top: 0; }

                /* Category Grid */
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .category-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 2px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 1.25rem 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .category-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .category-card.active {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: var(--cat-color);
                    box-shadow: 0 4px 20px -5px var(--cat-color);
                }

                .cat-icon-wrapper {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.75rem;
                }

                .cat-content h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }

                .cat-content p {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    line-height: 1.3;
                }

                /* Filters section */
                .filter-section {
                    margin-top: 2.5rem;
                }

                .filter-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .filter-grid {
                    display: flex;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-width: 200px;
                }

                .filter-group label {
                    font-size: 0.9rem;
                    color: var(--text-main);
                }

                .filter-select {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-main);
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                }

                .filter-select:focus {
                    border-color: var(--color-primary);
                }

                .btn-generate {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    height: 42px; /* match select box height roughly */
                }

                .btn-generate:hover {
                    background: var(--color-primary-dark, #0891b2);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
                }

                /* Report Display Area */
                .report-display-area {
                    margin-top: 3rem;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 2rem;
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .rh-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }

                .rh-subtitle {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .btn-download {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .btn-download:hover {
                    background: rgba(16, 185, 129, 0.2);
                }

                /* Stats Row */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .stat-box {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    letter-spacing: 1px;
                }

                .stat-val {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .text-primary {
                    color: var(--color-primary);
                }

                /* Insights Area */
                .insights-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .insight-card {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    border-left: 4px solid #fff;
                    display: flex;
                    flex-direction: column;
                }

                .insight-card.border-green { border-left-color: #10b981; }
                .insight-card.border-orange { border-left-color: #f59e0b; }
                .insight-card.border-gray { border-left-color: #94a3b8; }
                .insight-card.border-purple { border-left-color: #8b5cf6; }

                .insight-head {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }

                .insight-val {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                    color: var(--text-main);
                }

                .insight-desc {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                /* Insight List */
                .insight-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .i-list-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.95rem;
                    padding: 0.3rem 0;
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
                }

                .i-list-item:last-child {
                    border-bottom: none;
                }

                .i-list-item.active {
                    color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.1);
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    margin-bottom: 0.25rem;
                }
                
                .i-list-item .muted {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
            `}</style>
        </div>
    );
};

export default ReportsAnalytics;
