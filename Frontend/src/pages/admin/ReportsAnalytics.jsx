import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart3, TrendingUp, Package, Calendar, Download,
    FileText, Star, ShoppingCart, Users, Store, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import { apiRequest } from '../../utils/api';

/* ─── helpers ─────────────────────────────────────────── */
const fmt = (val) =>
    'LKR ' + (parseFloat(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayStr = () => new Date().toISOString().split('T')[0];
const daysAgoStr = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

const STATUS_COLORS = {
    Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#06b6d4',
    Delivered: '#10b981', Cancelled: '#ef4444', Returned: '#8b5cf6',
};
const PALETTE = ['#3b82f6','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ec4899','#6366f1','#ef4444'];

/* ─── component ───────────────────────────────────────── */
const ReportsAnalytics = () => {
    const [selectedReport, setSelectedReport]   = useState('sales');
    const [startDate, setStartDate]             = useState(daysAgoStr(30));
    const [endDate,   setEndDate]               = useState(todayStr());
    const [loading,   setLoading]               = useState(false);
    const [reportData, setReportData]           = useState(null);
    const [isGenerated, setIsGenerated]         = useState(false);

    /* chart canvas refs */
    const revenueRef   = useRef(null);
    const productsRef  = useRef(null);
    const statusRef    = useRef(null);
    const categoryRef  = useRef(null);

    /* chart instance refs (for destroy) */
    const charts = useRef({});

    const reportCategories = [
        { id: 'sales',     title: 'Sales & Revenue',     description: 'Orders, revenue & payment breakdown over a custom date range.', icon: <BarChart3 size={22} color="#3b82f6" />, bg: 'rgba(59,130,246,0.12)',  border: '#3b82f6' },
        { id: 'inventory', title: 'Inventory & Stock',   description: 'Current stock levels, low stock alerts and out-of-stock items.', icon: <Package  size={22} color="#f59e0b" />, bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b' },
        { id: 'product',   title: 'Product Performance', description: 'Best selling products, fast-movers and category insights.',       icon: <Star     size={22} color="#10b981" />, bg: 'rgba(16,185,129,0.12)',  border: '#10b981' },
        { id: 'service',   title: 'Service Bookings',    description: 'Most ordered services and booking statistics.',                  icon: <Calendar size={22} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.12)', border: '#8b5cf6' },
    ];

    /* destroy all chart instances */
    const destroyCharts = () => {
        Object.values(charts.current).forEach(c => c && c.destroy());
        charts.current = {};
    };

    /* clean up on unmount */
    useEffect(() => () => destroyCharts(), []);

    /* build charts after data + DOM are ready */
    useEffect(() => {
        if (!reportData || selectedReport !== 'sales') return;
        const t = setTimeout(() => buildCharts(reportData), 80);
        return () => { clearTimeout(t); destroyCharts(); };
    }, [reportData]); // eslint-disable-line react-hooks/exhaustive-deps

    const buildCharts = (data) => {
        destroyCharts();

        /* 1 – Daily revenue line chart */
        if (revenueRef.current && data.dailyRevenue.length) {
            charts.current.revenue = new Chart(revenueRef.current.getContext('2d'), {
                type: 'line',
                data: {
                    labels: data.dailyRevenue.map(d => {
                        const dt = new Date(d.date);
                        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }),
                    datasets: [{
                        label: 'Revenue (LKR)',
                        data: data.dailyRevenue.map(d => parseFloat(d.revenue)),
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6,182,212,0.10)',
                        borderWidth: 2,
                        pointBackgroundColor: '#06b6d4',
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        tension: 0.4,
                        fill: true,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
                        tooltip: { callbacks: { label: ctx => ' LKR ' + ctx.parsed.y.toLocaleString() } },
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8', maxTicksLimit: 14 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8', callback: v => 'LKR ' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                },
            });
        }

        /* 2 – Top products horizontal bar */
        if (productsRef.current && data.topProducts.length) {
            const top8 = data.topProducts.slice(0, 8);
            charts.current.products = new Chart(productsRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: top8.map(p => p.product_name.length > 22 ? p.product_name.slice(0, 22) + '…' : p.product_name),
                    datasets: [{
                        label: 'Revenue (LKR)',
                        data: top8.map(p => parseFloat(p.total_revenue)),
                        backgroundColor: PALETTE.slice(0, top8.length).map(c => c + 'cc'),
                        borderRadius: 6,
                    }],
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => ' LKR ' + ctx.parsed.x.toLocaleString() } },
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8', callback: v => 'LKR ' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                },
            });
        }

        /* 3 – Order status doughnut */
        if (statusRef.current && data.orderStatus.length) {
            charts.current.status = new Chart(statusRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: data.orderStatus.map(s => s.status),
                    datasets: [{
                        data: data.orderStatus.map(s => parseInt(s.count)),
                        backgroundColor: data.orderStatus.map(s => STATUS_COLORS[s.status] || '#94a3b8'),
                        borderColor: '#151b2d',
                        borderWidth: 3,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: { legend: { labels: { color: '#94a3b8', padding: 14, font: { size: 11 } } } },
                },
            });
        }

        /* 4 – Revenue by category doughnut */
        if (categoryRef.current && data.categoryRevenue.length) {
            charts.current.category = new Chart(categoryRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: data.categoryRevenue.map(c => c.category),
                    datasets: [{
                        data: data.categoryRevenue.map(c => parseFloat(c.revenue)),
                        backgroundColor: PALETTE.slice(0, data.categoryRevenue.length).map(c => c + 'cc'),
                        borderColor: '#151b2d',
                        borderWidth: 3,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { labels: { color: '#94a3b8', padding: 14, font: { size: 11 } } },
                        tooltip: { callbacks: { label: ctx => ' LKR ' + ctx.parsed.toLocaleString() } },
                    },
                },
            });
        }
    };

    /* ── Generate report ────────────────────────────────── */
    const generateReport = async () => {
        if (selectedReport !== 'sales') {
            Swal.fire({ icon: 'info', title: 'Coming Soon', text: 'This report type is under development.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
            return;
        }
        if (!startDate || !endDate) {
            Swal.fire({ icon: 'warning', title: 'Select Dates', text: 'Please select both a start and end date.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            Swal.fire({ icon: 'warning', title: 'Invalid Range', text: 'Start date must be before end date.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
            return;
        }
        setLoading(true);
        destroyCharts();
        setIsGenerated(false);
        setReportData(null);
        try {
            const res = await apiRequest(`/admin/sales-report?start_date=${startDate}&end_date=${endDate}`);
            setReportData(res.data);
            setIsGenerated(true);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate report. Please try again.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Download PDF ───────────────────────────────────── */
    const downloadPDF = async () => {
        const el = document.getElementById('sales-report-pdf-area');
        if (!el) return;
        Swal.fire({ title: 'Generating PDF…', background: '#1a1f2e', color: '#fff', showConfirmButton: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set({
                margin: [0.4, 0.4],
                filename: `sales-report-${startDate}-to-${endDate}.pdf`,
                image: { type: 'jpeg', quality: 0.97 },
                html2canvas: { scale: 2, backgroundColor: '#0f1117', useCORS: true, logging: false },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            }).from(el).save();
            Swal.fire({ icon: 'success', title: 'Downloaded!', text: 'Your PDF report has been saved.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4', timer: 2000, showConfirmButton: false });
        } catch {
            Swal.close();
        }
    };

    /* ── Preset helpers ─────────────────────────────────── */
    const applyPreset = (days, thisYear = false) => {
        const today = todayStr();
        let start;
        if (thisYear) {
            start = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        } else {
            start = daysAgoStr(days);
        }
        setStartDate(start);
        setEndDate(today);
        setIsGenerated(false);
        setReportData(null);
    };

    /* ── Report content ─────────────────────────────────── */
    const renderSalesReport = () => {
        if (!reportData) return null;
        const s = reportData.summary;
        const totalOrders   = parseInt(s.total_orders)   || 0;
        const onlineOrders  = parseInt(s.online_orders)  || 0;
        const posOrders     = parseInt(s.pos_orders)     || 0;
        const totalRevenue  = parseFloat(s.total_revenue) || 0;
        const avgOrder      = parseFloat(s.avg_order_value) || 0;

        const startLabel = new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const endLabel   = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        return (
            <div className="report-display-area" id="sales-report-pdf-area">
                {/* ── Header ── */}
                <div className="report-header">
                    <div className="rh-left">
                        <h2 className="rh-title"><BarChart3 size={22} style={{ marginRight: 10 }} />Sales &amp; Revenue Report</h2>
                        <p className="rh-sub">Period: <strong>{startLabel}</strong> — <strong>{endLabel}</strong></p>
                        <p className="rh-sub" style={{ marginTop: 2 }}>Generated: {new Date().toLocaleString()}</p>
                    </div>
                    <button className="btn-download" onClick={downloadPDF}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                {/* ── KPI cards ── */}
                <div className="kpi-grid">
                    <div className="kpi-card" style={{ '--kc': '#06b6d4' }}>
                        <div className="kpi-icon-wrap"><BarChart3 size={18} /></div>
                        <div className="kpi-label">TOTAL REVENUE</div>
                        <div className="kpi-val">{fmt(totalRevenue)}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#3b82f6' }}>
                        <div className="kpi-icon-wrap"><ShoppingCart size={18} /></div>
                        <div className="kpi-label">TOTAL ORDERS</div>
                        <div className="kpi-val">{totalOrders.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#10b981' }}>
                        <div className="kpi-icon-wrap"><TrendingUp size={18} /></div>
                        <div className="kpi-label">AVG ORDER VALUE</div>
                        <div className="kpi-val">{fmt(avgOrder)}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#8b5cf6' }}>
                        <div className="kpi-icon-wrap"><Store size={18} /></div>
                        <div className="kpi-label">ONLINE ORDERS</div>
                        <div className="kpi-val">{onlineOrders.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#f59e0b' }}>
                        <div className="kpi-icon-wrap"><Users size={18} /></div>
                        <div className="kpi-label">POS / WALK-IN</div>
                        <div className="kpi-val">{posOrders.toLocaleString()}</div>
                    </div>
                </div>

                {/* ── Revenue trend ── */}
                <div className="chart-section">
                    <h3 className="section-label">DAILY REVENUE TREND</h3>
                    <div className="chart-box chart-box-tall">
                        {reportData.dailyRevenue.length > 0
                            ? <canvas ref={revenueRef} />
                            : <div className="no-data">No orders found in this period</div>}
                    </div>
                </div>

                {/* ── Two doughnuts ── */}
                <div className="charts-2col">
                    <div className="chart-col">
                        <h3 className="section-label">ORDER STATUS BREAKDOWN</h3>
                        <div className="chart-box chart-box-md">
                            {reportData.orderStatus.length > 0
                                ? <canvas ref={statusRef} />
                                : <div className="no-data">No data</div>}
                        </div>
                    </div>
                    <div className="chart-col">
                        <h3 className="section-label">REVENUE BY CATEGORY</h3>
                        <div className="chart-box chart-box-md">
                            {reportData.categoryRevenue.length > 0
                                ? <canvas ref={categoryRef} />
                                : <div className="no-data">No data</div>}
                        </div>
                    </div>
                </div>

                {/* ── Top products bar ── */}
                {reportData.topProducts.length > 0 && (
                    <div className="chart-section">
                        <h3 className="section-label">TOP PRODUCTS BY REVENUE</h3>
                        <div className="chart-box chart-box-tall">
                            <canvas ref={productsRef} />
                        </div>
                    </div>
                )}

                {/* ── Payment methods table ── */}
                {reportData.paymentMethods.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">PAYMENT METHODS</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Method</th><th>Transactions</th><th>Total Amount</th></tr>
                            </thead>
                            <tbody>
                                {reportData.paymentMethods.map((pm, i) => (
                                    <tr key={i}>
                                        <td><span className="badge-method"><CreditCard size={13} style={{ marginRight: 6 }} />{pm.method}</span></td>
                                        <td>{pm.count}</td>
                                        <td className="td-primary">{fmt(pm.total_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Top products detail table ── */}
                {reportData.topProducts.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">TOP PRODUCTS DETAIL</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>#</th><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr>
                            </thead>
                            <tbody>
                                {reportData.topProducts.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ color: '#64748b' }}>{i + 1}</td>
                                        <td>{p.product_name}</td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td>{p.total_quantity}</td>
                                        <td className="td-primary">{fmt(p.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Empty state ── */}
                {totalOrders === 0 && (
                    <div className="empty-state">
                        <BarChart3 size={48} color="#334155" />
                        <p>No sales data found for the selected period.</p>
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════ */
    return (
        <div className="ra-wrap">

            {/* ── Report type selector ── */}
            <p className="section-label" style={{ marginTop: 0 }}>Select Report Type</p>
            <div className="cat-grid">
                {reportCategories.map(cat => (
                    <div
                        key={cat.id}
                        className={`cat-card${selectedReport === cat.id ? ' active' : ''}`}
                        style={{ '--cc': cat.border }}
                        onClick={() => {
                            setSelectedReport(cat.id);
                            setIsGenerated(false);
                            setReportData(null);
                            destroyCharts();
                        }}
                    >
                        <div className="cat-icon" style={{ background: cat.bg }}>{cat.icon}</div>
                        <div className="cat-body">
                            <h4>{cat.title}</h4>
                            <p>{cat.description}</p>
                            {cat.id === 'sales'
                                ? <span className="badge-live">LIVE DATA</span>
                                : <span className="badge-soon">COMING SOON</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Date range + generate ── */}
            <div className="filter-section">
                <p className="section-label">Select Date Range</p>
                <div className="filter-row">
                    <div className="date-group">
                        <div className="date-field">
                            <label>Start Date</label>
                            <input type="date" className="date-input" value={startDate} max={endDate}
                                onChange={e => { setStartDate(e.target.value); setIsGenerated(false); }} />
                        </div>
                        <div className="date-field">
                            <label>End Date</label>
                            <input type="date" className="date-input" value={endDate} min={startDate} max={todayStr()}
                                onChange={e => { setEndDate(e.target.value); setIsGenerated(false); }} />
                        </div>
                    </div>

                    <div className="presets">
                        {[
                            { label: 'Today',        action: () => { const t = todayStr(); setStartDate(t); setEndDate(t); setIsGenerated(false); setReportData(null); } },
                            { label: 'Last 7 days',  action: () => applyPreset(7) },
                            { label: 'Last 30 days', action: () => applyPreset(30) },
                            { label: 'Last 90 days', action: () => applyPreset(90) },
                            { label: 'This Year',    action: () => applyPreset(0, true) },
                        ].map(p => (
                            <button key={p.label} className="btn-preset" onClick={p.action}>{p.label}</button>
                        ))}
                    </div>

                    <button className="btn-generate" onClick={generateReport} disabled={loading}>
                        <FileText size={15} /> {loading ? 'Generating…' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* ── Loading state ── */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <span>Fetching data from database…</span>
                </div>
            )}

            {/* ── Report output ── */}
            {isGenerated && !loading && selectedReport === 'sales' && renderSalesReport()}

            {/* ─────────────────── STYLES ─────────────────── */}
            <style>{`
                .ra-wrap { color: var(--text-main); padding-bottom: 3rem; }

                .section-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin: 2rem 0 1rem;
                }

                /* ── Category cards ── */
                .cat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 560px) { .cat-grid { grid-template-columns: 1fr; } }

                .cat-card {
                    background: rgba(255,255,255,0.02);
                    border: 2px solid rgba(255,255,255,0.07);
                    border-radius: 12px;
                    padding: 1.2rem 1rem;
                    display: flex;
                    gap: 0.9rem;
                    align-items: flex-start;
                    cursor: pointer;
                    transition: all 0.25s;
                }
                .cat-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.18); transform: translateY(-2px); }
                .cat-card.active { border-color: var(--cc); box-shadow: 0 4px 20px -6px var(--cc); background: rgba(255,255,255,0.05); }

                .cat-icon {
                    width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                }
                .cat-body h4 { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--text-main); }
                .cat-body p  { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.5rem; }

                .badge-live {
                    font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;
                    background: rgba(16,185,129,0.15); color: #10b981;
                    border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; padding: 2px 7px;
                }
                .badge-soon {
                    font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;
                    background: rgba(148,163,184,0.1); color: #64748b;
                    border: 1px solid rgba(148,163,184,0.2); border-radius: 4px; padding: 2px 7px;
                }

                /* ── Date / filter section ── */
                .filter-section { margin-top: 2rem; }

                .filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: flex-end;
                    gap: 1.25rem;
                }

                .date-group { display: flex; gap: 1rem; flex-wrap: wrap; }

                .date-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .date-field label { font-size: 0.82rem; color: var(--text-main); font-weight: 500; }

                .date-input {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 8px;
                    color: var(--text-main);
                    padding: 0.6rem 0.85rem;
                    font-size: 0.88rem;
                    outline: none;
                    cursor: pointer;
                    min-width: 160px;
                    color-scheme: dark;
                }
                .date-input:focus { border-color: var(--color-primary, #06b6d4); }

                .presets {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    align-items: flex-end;
                }

                .btn-preset {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-muted);
                    padding: 0.55rem 0.9rem;
                    border-radius: 7px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .btn-preset:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.4); color: #06b6d4; }

                .btn-generate {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: var(--color-primary, #06b6d4);
                    color: #fff;
                    border: none;
                    padding: 0.65rem 1.4rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .btn-generate:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(6,182,212,0.25); }
                .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── Loading ── */
                .loading-state {
                    margin-top: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .spinner {
                    width: 22px; height: 22px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: #06b6d4;
                    border-radius: 50%;
                    animation: spin 0.75s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Report display area ── */
                .report-display-area {
                    margin-top: 2.5rem;
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 2rem;
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .rh-title {
                    font-size: 1.35rem; font-weight: 700;
                    display: flex; align-items: center;
                    margin-bottom: 0.4rem;
                }
                .rh-sub { font-size: 0.85rem; color: var(--text-muted); }

                .btn-download {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(16,185,129,0.1);
                    color: #10b981;
                    border: 1px solid rgba(16,185,129,0.3);
                    padding: 0.65rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.88rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                    white-space: nowrap;
                }
                .btn-download:hover { background: rgba(16,185,129,0.2); }

                /* ── KPI cards ── */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }
                @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 600px)  { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }

                .kpi-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 3px solid var(--kc);
                    border-radius: 12px;
                    padding: 1.1rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .kpi-icon-wrap {
                    color: var(--kc);
                    margin-bottom: 0.25rem;
                }
                .kpi-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                }
                .kpi-val {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                    line-height: 1.2;
                }

                /* ── Charts ── */
                .chart-section { margin-bottom: 2rem; }
                .chart-box { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem 1.25rem; }
                .chart-box-tall { height: 220px; }
                .chart-box-md   { height: 200px; }
                .chart-box canvas { max-height: 100%; }

                .charts-2col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                @media (max-width: 700px) { .charts-2col { grid-template-columns: 1fr; } }
                .chart-col {}

                .no-data {
                    display: flex; align-items: center; justify-content: center;
                    height: 180px; color: var(--text-muted); font-size: 0.9rem;
                }

                /* ── Tables ── */
                .table-section { margin-bottom: 2rem; }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.88rem;
                }
                .data-table th {
                    text-align: left;
                    padding: 0.75rem 1rem;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    background: rgba(0,0,0,0.2);
                }
                .data-table th:first-child { border-radius: 8px 0 0 0; }
                .data-table th:last-child  { border-radius: 0 8px 0 0; }
                .data-table td {
                    padding: 0.8rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: var(--text-main);
                    vertical-align: middle;
                }
                .data-table tr:last-child td { border-bottom: none; }
                .data-table tr:hover td { background: rgba(255,255,255,0.02); }

                .td-primary { color: #06b6d4; font-weight: 600; }

                .badge-method {
                    display: inline-flex; align-items: center;
                    background: rgba(99,102,241,0.12); color: #a5b4fc;
                    border: 1px solid rgba(99,102,241,0.25);
                    padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
                }
                .badge-cat {
                    display: inline-block;
                    background: rgba(6,182,212,0.1); color: #67e8f9;
                    border: 1px solid rgba(6,182,212,0.2);
                    padding: 2px 9px; border-radius: 20px; font-size: 0.77rem;
                }

                /* ── Empty state ── */
                .empty-state {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; gap: 1rem;
                    padding: 3rem 0;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default ReportsAnalytics;
