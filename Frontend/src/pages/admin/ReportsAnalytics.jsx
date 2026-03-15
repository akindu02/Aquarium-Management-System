import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart3, TrendingUp, Package, Calendar, Download,
    FileText, Star, ShoppingCart, Users, Store, CreditCard,
    AlertTriangle, Archive
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

/* Group daily rows into monthly summary for the PDF breakdown table */
const groupByMonth = (dailyRevenue) => {
    const map = {};
    dailyRevenue.forEach(d => {
        const dt = new Date(d.date);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const label = dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!map[key]) map[key] = { label, orders: 0, revenue: 0 };
        map[key].orders  += parseInt(d.orders)  || 0;
        map[key].revenue += parseFloat(d.revenue) || 0;
    });
    return Object.values(map);
};

/* ─── PDF template (hidden, white, captured by html2pdf) ── */
const SalesReportPDF = ({ reportData, startDate, endDate, pdfRef }) => {
    if (!reportData) return null;

    const s          = reportData.summary;
    const monthly    = groupByMonth(reportData.dailyRevenue);
    const bestMonth  = monthly.length ? monthly.reduce((a, b) => b.revenue > a.revenue ? b : a) : null;
    const worstMonth = monthly.length > 1 ? monthly.reduce((a, b) => b.revenue < a.revenue ? b : a) : null;

    const totalRevenue = parseFloat(s.total_revenue) || 0;
    const totalOrders  = parseInt(s.total_orders)    || 0;
    const avgOrder     = parseFloat(s.avg_order_value) || 0;
    const onlineOrders = parseInt(s.online_orders)   || 0;
    const posOrders    = parseInt(s.pos_orders)      || 0;

    const periodLabel = `${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    const generatedAt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const P = {
        wrap:    { position: 'fixed', left: '-9999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' },
        doc:     { width: '190mm', background: '#ffffff', fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", color: '#111827' },
        /* header */
        header:  { padding: '20px 28px 14px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', textAlign: 'center' },
        logoRow: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '1px', marginBottom: '5px' },
        logoM:   { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
        logoA:   { fontSize: '1.5rem', fontWeight: '800', color: '#06b6d4', letterSpacing: '-0.5px' },
        contact: { fontSize: '0.64rem', color: '#6b7280', marginBottom: '10px' },
        divider: { height: '1.5px', background: 'linear-gradient(90deg, transparent, #06b6d4 40%, #06b6d4 60%, transparent)', margin: '0 0 10px' },
        title:   { fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', letterSpacing: '5px', margin: '0 0 5px' },
        metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6b7280', marginTop: '3px' },
        /* section */
        section: { padding: '14px 24px' },
        secTitle:{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '2px', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #e0f2fe' },
        /* kpi row */
        kpiRow:  { display: 'flex', gap: '8px', marginBottom: '0' },
        kpiBox:  { flex: 1, border: '1px solid #e2e8f0', borderTop: '3px solid #06b6d4', borderRadius: '7px', padding: '8px 8px' },
        kpiLbl:  { fontSize: '0.52rem', fontWeight: '700', letterSpacing: '0.8px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '3px' },
        kpiVal:  { fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' },
        kpiSub:  { fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px' },
        /* table — tighter padding & smaller font to fit A4 width */
        table:   { width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', tableLayout: 'fixed' },
        th:      { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'left', wordBreak: 'keep-all' },
        thR:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'right', wordBreak: 'keep-all' },
        thC:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'keep-all' },
        tdE:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#ffffff', textAlign: 'left', verticalAlign: 'middle' },
        tdO:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#f9fafb', textAlign: 'left', verticalAlign: 'middle' },
        tdR:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        tdC:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'center', verticalAlign: 'middle' },
        tdPri:   { padding: '7px 10px', color: '#06b6d4', fontWeight: '700', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        /* insights */
        insightBox:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '11px 14px' },
        insightLine: { fontSize: '0.72rem', color: '#374151', marginBottom: '4px', lineHeight: '1.5' },
        insightKey:  { fontWeight: '700', color: '#0f172a' },
        insightHi:   { color: '#06b6d4', fontWeight: '700' },
        /* footer */
        footer:  { padding: '10px 28px 14px', textAlign: 'center', background: '#f8fafc', borderTop: '1.5px solid #e0f2fe' },
        footerTxt: { fontSize: '0.64rem', color: '#6b7280', margin: '0 0 2px' },
        footerCopy:{ fontSize: '0.58rem', color: '#9ca3af', margin: 0 },
    };

    const kpiAccents = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

    return (
        <div style={P.wrap}>
            <div ref={pdfRef} style={P.doc}>

                {/* ── HEADER ── */}
                <div style={P.header}>
                    <div style={P.logoRow}>
                        <span style={P.logoM}>Methu</span>
                        <span style={P.logoA}>Aquarium</span>
                    </div>
                    <div style={P.contact}>No 50, Kumaradasa Mawatha, Matara &nbsp;&bull;&nbsp; 041-2236848 / 074-3143109 &nbsp;&bull;&nbsp; methuaquarium@gmail.com</div>
                    <div style={P.divider} />
                    <h2 style={P.title}>SALES &amp; REVENUE REPORT</h2>
                    <div style={P.metaRow}>
                        <span>Period: <strong style={{ color: '#0f172a' }}>{periodLabel}</strong></span>
                        <span>Generated: {generatedAt}</span>
                    </div>
                </div>

                {/* ── SUMMARY KPIs ── */}
                <div style={P.section}>
                    <p style={P.secTitle}>Summary</p>
                    <div style={P.kpiRow}>
                        {[
                            { label: 'Total Revenue',    val: fmt(totalRevenue),          sub: 'Excl. cancelled/returned', accent: kpiAccents[0] },
                            { label: 'Total Orders',     val: totalOrders.toLocaleString(), sub: 'Completed orders',         accent: kpiAccents[1] },
                            { label: 'Avg Order Value',  val: fmt(avgOrder),              sub: 'Per order',                accent: kpiAccents[2] },
                            { label: 'Online Orders',    val: onlineOrders.toLocaleString(), sub: 'Customer portal',         accent: kpiAccents[3] },
                            { label: 'POS / Walk-in',    val: posOrders.toLocaleString(), sub: 'In-store sales',            accent: kpiAccents[4] },
                        ].map((k, i) => (
                            <div key={i} style={{ ...P.kpiBox, borderTopColor: k.accent }}>
                                <div style={P.kpiLbl}>{k.label}</div>
                                <div style={{ ...P.kpiVal, color: k.accent }}>{k.val}</div>
                                <div style={P.kpiSub}>{k.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MONTHLY BREAKDOWN TABLE ── */}
                {monthly.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Detailed Breakdown</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '28%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '12%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Period</th>
                                    <th style={P.thC}>Orders</th>
                                    <th style={P.thR}>Revenue (LKR)</th>
                                    <th style={P.thR}>Avg Order Value</th>
                                    <th style={P.thR}>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthly.map((m, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{m.label}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{m.orders}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(m.revenue)}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{m.orders > 0 ? fmt(m.revenue / m.orders) : '—'}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                            {totalRevenue > 0 ? ((m.revenue / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TOP PRODUCTS ── */}
                {reportData.topProducts.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Top Products</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '38%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '22%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>#</th>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Units Sold</th>
                                    <th style={P.thR}>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.topProducts.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), color: '#9ca3af' }}>{i + 1}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}><strong>{p.product_name}</strong></td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{p.total_quantity}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(p.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── PAYMENT METHODS ── */}
                {reportData.paymentMethods.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Payment Methods</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '30%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '30%' }} />
                                <col style={{ width: '20%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Method</th>
                                    <th style={P.thC}>Transactions</th>
                                    <th style={P.thR}>Total Amount</th>
                                    <th style={P.thR}>% of Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.paymentMethods.map((pm, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}><strong>{pm.method}</strong></td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{pm.count}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(pm.total_amount)}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                            {totalRevenue > 0 ? ((parseFloat(pm.total_amount) / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── INSIGHTS ── */}
                <div style={{ ...P.section, paddingTop: 0 }}>
                    <p style={P.secTitle}>Insights</p>
                    <div style={P.insightBox}>
                        <p style={P.insightLine}>
                            <span style={P.insightKey}>Total Revenue: </span>
                            <span style={P.insightHi}>{fmt(totalRevenue)}</span>
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Total Orders: </span>{totalOrders}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Avg Order Value: </span>{fmt(avgOrder)}
                        </p>
                        {bestMonth && (
                            <p style={P.insightLine}>
                                <span style={P.insightKey}>Best Period: </span>
                                {bestMonth.label} — <span style={P.insightHi}>{fmt(bestMonth.revenue)}</span> ({bestMonth.orders} orders)
                            </p>
                        )}
                        {worstMonth && (
                            <p style={P.insightLine}>
                                <span style={P.insightKey}>Lowest Period: </span>
                                {worstMonth.label} — {fmt(worstMonth.revenue)} ({worstMonth.orders} orders)
                            </p>
                        )}
                        <p style={{ ...P.insightLine, marginBottom: 0 }}>
                            <span style={P.insightKey}>Sales Channel: </span>
                            Online {onlineOrders} orders &nbsp;|&nbsp; POS/Walk-in {posOrders} orders
                            {totalOrders > 0 && (
                                <> &nbsp;({((onlineOrders / totalOrders) * 100).toFixed(0)}% online)</>
                            )}
                        </p>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={P.footer}>
                    <p style={P.footerTxt}>Generated by Methu Aquarium Management System</p>
                    <p style={{ ...P.footerTxt, marginBottom: '4px' }}>{generatedAt}</p>
                    <p style={P.footerCopy}>&copy; 2026 Methu Aquarium. All Rights Reserved.</p>
                </div>

            </div>
        </div>
    );
};

/* ─── Product Performance PDF template ─────────────────── */
const ProductPerformanceReportPDF = ({ reportData, startDate, endDate, pdfRef }) => {
    if (!reportData) return null;

    const s              = reportData.summary;
    const rs             = reportData.returnsSummary;
    const productsSold   = parseInt(s.products_sold)     || 0;
    const totalUnits     = parseInt(s.total_units_sold)  || 0;
    const totalRevenue   = parseFloat(s.total_revenue)   || 0;
    const totalOrders    = parseInt(s.total_orders)      || 0;
    const totalReturns   = parseInt(rs.total_returns)    || 0;
    const totalRefund    = parseFloat(rs.total_refund_amount) || 0;

    const periodLabel  = `${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    const generatedAt  = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const P = {
        wrap:    { position: 'fixed', left: '-9999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' },
        doc:     { width: '190mm', background: '#ffffff', fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", color: '#111827' },
        header:  { padding: '20px 28px 14px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', textAlign: 'center' },
        logoRow: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '1px', marginBottom: '5px' },
        logoM:   { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
        logoA:   { fontSize: '1.5rem', fontWeight: '800', color: '#10b981', letterSpacing: '-0.5px' },
        contact: { fontSize: '0.64rem', color: '#6b7280', marginBottom: '10px' },
        divider: { height: '1.5px', background: 'linear-gradient(90deg, transparent, #10b981 40%, #10b981 60%, transparent)', margin: '0 0 10px' },
        title:   { fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', letterSpacing: '5px', margin: '0 0 5px' },
        metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6b7280', marginTop: '3px' },
        section: { padding: '14px 24px' },
        secTitle:{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '2px', color: '#10b981', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #d1fae5' },
        kpiRow:  { display: 'flex', gap: '8px', marginBottom: '0' },
        kpiBox:  { flex: 1, border: '1px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '7px', padding: '8px 8px' },
        kpiLbl:  { fontSize: '0.52rem', fontWeight: '700', letterSpacing: '0.8px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '3px' },
        kpiVal:  { fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' },
        kpiSub:  { fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px' },
        table:   { width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', tableLayout: 'fixed' },
        th:      { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'left', wordBreak: 'keep-all' },
        thR:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'right', wordBreak: 'keep-all' },
        thC:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'keep-all' },
        tdE:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#ffffff', textAlign: 'left', verticalAlign: 'middle' },
        tdO:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#f9fafb', textAlign: 'left', verticalAlign: 'middle' },
        tdR:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        tdC:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'center', verticalAlign: 'middle' },
        tdPri:   { padding: '7px 10px', color: '#10b981', fontWeight: '700', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        insightBox:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '11px 14px' },
        insightLine: { fontSize: '0.72rem', color: '#374151', marginBottom: '4px', lineHeight: '1.5' },
        insightKey:  { fontWeight: '700', color: '#0f172a' },
        insightHi:   { color: '#10b981', fontWeight: '700' },
        footer:      { padding: '10px 28px 14px', textAlign: 'center', background: '#f8fafc', borderTop: '1.5px solid #d1fae5' },
        footerTxt:   { fontSize: '0.64rem', color: '#6b7280', margin: '0 0 2px' },
        footerCopy:  { fontSize: '0.58rem', color: '#9ca3af', margin: 0 },
    };

    const kpiAccents = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
    const topProduct  = reportData.topProducts[0];
    const topCategory = reportData.categoryPerformance[0];

    return (
        <div style={P.wrap}>
            <div ref={pdfRef} style={P.doc}>

                {/* ── HEADER ── */}
                <div style={P.header}>
                    <div style={P.logoRow}>
                        <span style={P.logoM}>Methu</span>
                        <span style={P.logoA}>Aquarium</span>
                    </div>
                    <div style={P.contact}>No 50, Kumaradasa Mawatha, Matara &nbsp;&bull;&nbsp; 041-2236848 / 074-3143109 &nbsp;&bull;&nbsp; methuaquarium@gmail.com</div>
                    <div style={P.divider} />
                    <h2 style={P.title}>PRODUCT PERFORMANCE REPORT</h2>
                    <div style={P.metaRow}>
                        <span>Period: <strong style={{ color: '#0f172a' }}>{periodLabel}</strong></span>
                        <span>Generated: {generatedAt}</span>
                    </div>
                </div>

                {/* ── SUMMARY KPIs ── */}
                <div style={P.section}>
                    <p style={P.secTitle}>Summary</p>
                    <div style={P.kpiRow}>
                        {[
                            { label: 'Products Sold',  val: productsSold.toLocaleString(),  sub: 'Unique products',     accent: kpiAccents[0] },
                            { label: 'Units Sold',     val: totalUnits.toLocaleString(),     sub: 'Total qty sold',     accent: kpiAccents[1] },
                            { label: 'Total Revenue',  val: fmt(totalRevenue),               sub: 'Excl. cancelled',    accent: kpiAccents[2] },
                            { label: 'Total Orders',   val: totalOrders.toLocaleString(),    sub: 'Orders placed',      accent: kpiAccents[3] },
                            { label: 'Returns',        val: totalReturns.toLocaleString(),   sub: fmt(totalRefund) + ' refunded', accent: kpiAccents[4] },
                        ].map((k, i) => (
                            <div key={i} style={{ ...P.kpiBox, borderTopColor: k.accent }}>
                                <div style={P.kpiLbl}>{k.label}</div>
                                <div style={{ ...P.kpiVal, color: k.accent }}>{k.val}</div>
                                <div style={P.kpiSub}>{k.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── TOP PRODUCTS ── */}
                {reportData.topProducts.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Top Products by Revenue</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '36%' }} />
                                <col style={{ width: '18%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '14%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>#</th>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Units Sold</th>
                                    <th style={P.thR}>Revenue</th>
                                    <th style={P.thR}>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.topProducts.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), color: '#9ca3af' }}>{i + 1}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}><strong>{p.product_name}</strong></td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{parseInt(p.units_sold).toLocaleString()}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(p.revenue)}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                            {totalRevenue > 0 ? ((parseFloat(p.revenue) / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CATEGORY PERFORMANCE ── */}
                {reportData.categoryPerformance.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Category Performance</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '26%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '18%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Products</th>
                                    <th style={P.thC}>Units Sold</th>
                                    <th style={P.thR}>Revenue (LKR)</th>
                                    <th style={P.thR}>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.categoryPerformance.map((c, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}><strong>{c.category}</strong></td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{c.products_count}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{parseInt(c.units_sold).toLocaleString()}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(c.revenue)}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                            {totalRevenue > 0 ? ((parseFloat(c.revenue) / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── RETURNS & REFUNDS ── */}
                {reportData.returnsByReason.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={{ ...P.secTitle, color: '#ef4444', borderBottomColor: '#fee2e2' }}>Returns &amp; Refunds by Reason</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '46%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '30%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Reason</th>
                                    <th style={P.thC}>Returns</th>
                                    <th style={P.thR}>Total Refund (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.returnsByReason.map((r, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{r.reason}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center', color: '#ef4444', fontWeight: '700' }}>{r.return_count}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb', color: '#ef4444', fontWeight: '700' }}>{fmt(r.total_refund)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── SLOW MOVERS ── */}
                {reportData.slowMovers.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={{ ...P.secTitle, color: '#f97316', borderBottomColor: '#ffedd5' }}>Slow Movers — No Sales in Period ({reportData.slowMovers.length})</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '42%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '18%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Stock</th>
                                    <th style={P.thR}>Price (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.slowMovers.map((p, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.name}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center', color: '#f97316', fontWeight: '700' }}>{p.stock_quantity}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── INSIGHTS ── */}
                <div style={{ ...P.section, paddingTop: 0 }}>
                    <p style={P.secTitle}>Insights</p>
                    <div style={P.insightBox}>
                        <p style={P.insightLine}>
                            <span style={P.insightKey}>Products Sold: </span>{productsSold}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Total Units: </span>{totalUnits.toLocaleString()}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Revenue: </span><span style={P.insightHi}>{fmt(totalRevenue)}</span>
                        </p>
                        {topProduct && (
                            <p style={P.insightLine}>
                                <span style={P.insightKey}>Best Product: </span>
                                {topProduct.product_name} — <span style={P.insightHi}>{fmt(topProduct.revenue)}</span> ({parseInt(topProduct.units_sold)} units)
                            </p>
                        )}
                        {topCategory && (
                            <p style={P.insightLine}>
                                <span style={P.insightKey}>Top Category: </span>
                                {topCategory.category} — <span style={P.insightHi}>{fmt(topCategory.revenue)}</span> ({parseInt(topCategory.units_sold)} units)
                            </p>
                        )}
                        <p style={{ ...P.insightLine, marginBottom: 0 }}>
                            <span style={P.insightKey}>Returns: </span>
                            <strong style={{ color: '#ef4444' }}>{totalReturns}</strong> returns
                            &nbsp;|&nbsp; Refunded: <strong style={{ color: '#ef4444' }}>{fmt(totalRefund)}</strong>
                            {totalOrders > 0 && totalReturns > 0 && (
                                <> &nbsp;({((totalReturns / totalOrders) * 100).toFixed(1)}% return rate)</>
                            )}
                        </p>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={P.footer}>
                    <p style={P.footerTxt}>Generated by Methu Aquarium Management System</p>
                    <p style={{ ...P.footerTxt, marginBottom: '4px' }}>{generatedAt}</p>
                    <p style={P.footerCopy}>&copy; 2026 Methu Aquarium. All Rights Reserved.</p>
                </div>

            </div>
        </div>
    );
};

/* ─── Inventory PDF template ───────────────────────────── */
const InventoryReportPDF = ({ reportData, pdfRef }) => {
    if (!reportData) return null;

    const s             = reportData.summary;
    const totalProducts = parseInt(s.total_products)      || 0;
    const totalCats     = parseInt(s.total_categories)    || 0;
    const totalUnits    = parseInt(s.total_stock_units)   || 0;
    const totalValue    = parseFloat(s.total_stock_value)  || 0;
    const outOfStock    = parseInt(s.out_of_stock)         || 0;
    const lowStockCt    = parseInt(s.low_stock)            || 0;
    const inStockCt     = parseInt(s.in_stock)             || 0;
    const expiringSoon  = parseInt(s.expiring_soon)        || 0;

    const generatedAt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const P = {
        wrap:    { position: 'fixed', left: '-9999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' },
        doc:     { width: '190mm', background: '#ffffff', fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", color: '#111827' },
        header:  { padding: '20px 28px 14px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', textAlign: 'center' },
        logoRow: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '1px', marginBottom: '5px' },
        logoM:   { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
        logoA:   { fontSize: '1.5rem', fontWeight: '800', color: '#06b6d4', letterSpacing: '-0.5px' },
        contact: { fontSize: '0.64rem', color: '#6b7280', marginBottom: '10px' },
        divider: { height: '1.5px', background: 'linear-gradient(90deg, transparent, #f59e0b 40%, #f59e0b 60%, transparent)', margin: '0 0 10px' },
        title:   { fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', letterSpacing: '5px', margin: '0 0 5px' },
        metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6b7280', marginTop: '3px' },
        section: { padding: '14px 24px' },
        secTitle:{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '2px', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #fef3c7' },
        kpiRow:  { display: 'flex', gap: '8px', marginBottom: '0' },
        kpiBox:  { flex: 1, border: '1px solid #e2e8f0', borderTop: '3px solid #f59e0b', borderRadius: '7px', padding: '8px 8px' },
        kpiLbl:  { fontSize: '0.52rem', fontWeight: '700', letterSpacing: '0.8px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '3px' },
        kpiVal:  { fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' },
        kpiSub:  { fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px' },
        table:   { width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', tableLayout: 'fixed' },
        th:      { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'left', wordBreak: 'keep-all' },
        thR:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'right', wordBreak: 'keep-all' },
        thC:     { padding: '7px 10px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.6rem', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'keep-all' },
        tdE:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#ffffff', textAlign: 'left', verticalAlign: 'middle' },
        tdO:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', background: '#f9fafb', textAlign: 'left', verticalAlign: 'middle' },
        tdR:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        tdC:     { padding: '7px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', textAlign: 'center', verticalAlign: 'middle' },
        tdPri:   { padding: '7px 10px', color: '#f59e0b', fontWeight: '700', borderBottom: '1px solid #f1f5f9', textAlign: 'right', verticalAlign: 'middle' },
        insightBox:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '11px 14px' },
        insightLine: { fontSize: '0.72rem', color: '#374151', marginBottom: '4px', lineHeight: '1.5' },
        insightKey:  { fontWeight: '700', color: '#0f172a' },
        insightHi:   { color: '#f59e0b', fontWeight: '700' },
        footer:      { padding: '10px 28px 14px', textAlign: 'center', background: '#f8fafc', borderTop: '1.5px solid #fef3c7' },
        footerTxt:   { fontSize: '0.64rem', color: '#6b7280', margin: '0 0 2px' },
        footerCopy:  { fontSize: '0.58rem', color: '#9ca3af', margin: 0 },
    };

    const kpiAccents = ['#f59e0b', '#06b6d4', '#3b82f6', '#10b981', '#ef4444'];

    return (
        <div style={P.wrap}>
            <div ref={pdfRef} style={P.doc}>

                {/* ── HEADER ── */}
                <div style={P.header}>
                    <div style={P.logoRow}>
                        <span style={P.logoM}>Methu</span>
                        <span style={P.logoA}>Aquarium</span>
                    </div>
                    <div style={P.contact}>No 50, Kumaradasa Mawatha, Matara &nbsp;&bull;&nbsp; 041-2236848 / 074-3143109 &nbsp;&bull;&nbsp; methuaquarium@gmail.com</div>
                    <div style={P.divider} />
                    <h2 style={P.title}>INVENTORY &amp; STOCK REPORT</h2>
                    <div style={P.metaRow}>
                        <span>As of: <strong style={{ color: '#0f172a' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                        <span>Generated: {generatedAt}</span>
                    </div>
                </div>

                {/* ── SUMMARY KPIs ── */}
                <div style={P.section}>
                    <p style={P.secTitle}>Summary</p>
                    <div style={P.kpiRow}>
                        {[
                            { label: 'Total Products',   val: totalProducts.toLocaleString(), sub: 'In catalogue',           accent: kpiAccents[0] },
                            { label: 'Categories',       val: totalCats.toLocaleString(),      sub: 'Product groups',         accent: kpiAccents[1] },
                            { label: 'Total Units',      val: totalUnits.toLocaleString(),     sub: 'Across all products',    accent: kpiAccents[2] },
                            { label: 'Stock Value',      val: fmt(totalValue),                 sub: 'At current prices',      accent: kpiAccents[3] },
                            { label: 'Out of Stock',     val: outOfStock.toLocaleString(),     sub: 'Need restocking',        accent: kpiAccents[4] },
                        ].map((k, i) => (
                            <div key={i} style={{ ...P.kpiBox, borderTopColor: k.accent }}>
                                <div style={P.kpiLbl}>{k.label}</div>
                                <div style={{ ...P.kpiVal, color: k.accent }}>{k.val}</div>
                                <div style={P.kpiSub}>{k.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── STOCK BY CATEGORY ── */}
                {reportData.categoryStock.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={P.secTitle}>Stock by Category</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '22%' }} /><col style={{ width: '12%' }} />
                                <col style={{ width: '12%' }} /><col style={{ width: '26%' }} />
                                <col style={{ width: '14%' }} /><col style={{ width: '14%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Products</th>
                                    <th style={P.thC}>Units</th>
                                    <th style={P.thR}>Stock Value (LKR)</th>
                                    <th style={P.thC}>Out of Stock</th>
                                    <th style={P.thC}>Low Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.categoryStock.map((c, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}><strong>{c.category}</strong></td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{c.product_count}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{parseInt(c.total_units).toLocaleString()}</td>
                                        <td style={{ ...P.tdPri, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(c.total_value)}</td>
                                        <td style={{ ...P.tdC, background: i % 2 === 0 ? '#ffffff' : '#f9fafb', color: parseInt(c.out_of_stock_count) > 0 ? '#ef4444' : '#374151', fontWeight: parseInt(c.out_of_stock_count) > 0 ? '700' : '400' }}>
                                            {parseInt(c.out_of_stock_count) > 0 ? c.out_of_stock_count : '—'}
                                        </td>
                                        <td style={{ ...P.tdC, background: i % 2 === 0 ? '#ffffff' : '#f9fafb', color: parseInt(c.low_stock_count) > 0 ? '#f97316' : '#374151', fontWeight: parseInt(c.low_stock_count) > 0 ? '700' : '400' }}>
                                            {parseInt(c.low_stock_count) > 0 ? c.low_stock_count : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── OUT OF STOCK ── */}
                {reportData.outOfStock.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={{ ...P.secTitle, color: '#ef4444', borderBottomColor: '#fee2e2' }}>Out of Stock ({reportData.outOfStock.length})</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '46%' }} /><col style={{ width: '28%' }} /><col style={{ width: '26%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thR}>Price (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.outOfStock.map((p, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.name}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── LOW STOCK ── */}
                {reportData.lowStock.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={{ ...P.secTitle, color: '#f97316', borderBottomColor: '#ffedd5' }}>Low Stock — Units ≤ 10 ({reportData.lowStock.length})</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '44%' }} /><col style={{ width: '24%' }} />
                                <col style={{ width: '14%' }} /><col style={{ width: '18%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Stock</th>
                                    <th style={P.thR}>Price (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.lowStock.map((p, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.name}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...P.tdC, background: i % 2 === 0 ? '#ffffff' : '#f9fafb', color: '#f97316', fontWeight: '700' }}>{p.stock_quantity}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── EXPIRING SOON ── */}
                {reportData.expiringSoon.length > 0 && (
                    <div style={{ ...P.section, paddingTop: 0 }}>
                        <p style={{ ...P.secTitle, color: '#8b5cf6', borderBottomColor: '#ede9fe' }}>Expiring Within 30 Days ({reportData.expiringSoon.length})</p>
                        <table style={P.table}>
                            <colgroup>
                                <col style={{ width: '44%' }} /><col style={{ width: '24%' }} />
                                <col style={{ width: '14%' }} /><col style={{ width: '18%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={P.th}>Product</th>
                                    <th style={P.th}>Category</th>
                                    <th style={P.thC}>Stock</th>
                                    <th style={P.thR}>Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.expiringSoon.map((p, i) => (
                                    <tr key={i}>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.name}</td>
                                        <td style={i % 2 === 0 ? P.tdE : P.tdO}>{p.category}</td>
                                        <td style={{ ...(i % 2 === 0 ? P.tdE : P.tdO), textAlign: 'center' }}>{p.stock_quantity}</td>
                                        <td style={{ ...P.tdR, background: i % 2 === 0 ? '#ffffff' : '#f9fafb', color: '#8b5cf6', fontWeight: '700' }}>
                                            {new Date(p.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── INSIGHTS ── */}
                <div style={{ ...P.section, paddingTop: 0 }}>
                    <p style={P.secTitle}>Insights</p>
                    <div style={P.insightBox}>
                        <p style={P.insightLine}>
                            <span style={P.insightKey}>Total Products: </span>{totalProducts}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Categories: </span>{totalCats}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <span style={P.insightKey}>Total Stock Units: </span>{totalUnits.toLocaleString()}
                        </p>
                        <p style={P.insightLine}>
                            <span style={P.insightKey}>Total Inventory Value: </span>
                            <span style={P.insightHi}>{fmt(totalValue)}</span>
                        </p>
                        <p style={P.insightLine}>
                            <span style={P.insightKey}>Stock Health: </span>
                            In Stock <strong>{inStockCt}</strong>
                            &nbsp;|&nbsp; Low Stock <strong style={{ color: '#f97316' }}>{lowStockCt}</strong>
                            &nbsp;|&nbsp; Out of Stock <strong style={{ color: '#ef4444' }}>{outOfStock}</strong>
                            {totalProducts > 0 && <> — {((inStockCt / totalProducts) * 100).toFixed(0)}% healthy stock</>}
                        </p>
                        {expiringSoon > 0 && (
                            <p style={{ ...P.insightLine, marginBottom: 0 }}>
                                <span style={P.insightKey}>Expiring Soon: </span>
                                <strong style={{ color: '#8b5cf6' }}>{expiringSoon} product{expiringSoon > 1 ? 's' : ''}</strong> expiring within 30 days — review and action required.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={P.footer}>
                    <p style={P.footerTxt}>Generated by Methu Aquarium Management System</p>
                    <p style={{ ...P.footerTxt, marginBottom: '4px' }}>{generatedAt}</p>
                    <p style={P.footerCopy}>&copy; 2026 Methu Aquarium. All Rights Reserved.</p>
                </div>

            </div>
        </div>
    );
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

    /* ref for the hidden white PDF template */
    const pdfRef     = useRef(null);
    const invPdfRef  = useRef(null);
    const prodPdfRef = useRef(null);

    /* inventory chart canvas refs */
    const stockStatusRef   = useRef(null);
    const stockCategoryRef = useRef(null);

    /* product performance chart canvas refs */
    const prodTopRef      = useRef(null);
    const prodCategoryRef = useRef(null);

    const reportCategories = [
        { id: 'sales',     title: 'Sales & Revenue',     description: 'Orders, revenue & payment breakdown over a custom date range.', icon: <BarChart3 size={22} color="#3b82f6" />, bg: 'rgba(59,130,246,0.12)',  border: '#3b82f6' },
        { id: 'inventory', title: 'Inventory & Stock',   description: 'Current stock levels, low stock alerts and out-of-stock items.', icon: <Package  size={22} color="#f59e0b" />, bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b' },
        { id: 'product',   title: 'Product Performance', description: 'Best sellers, category insights, returns & refunds breakdown.',  icon: <Star     size={22} color="#10b981" />, bg: 'rgba(16,185,129,0.12)',  border: '#10b981' },
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

    useEffect(() => {
        if (!reportData || selectedReport !== 'inventory') return;
        const t = setTimeout(() => buildInventoryCharts(reportData), 80);
        return () => {
            clearTimeout(t);
            ['stockStatus', 'stockCategory'].forEach(k => {
                if (charts.current[k]) { charts.current[k].destroy(); delete charts.current[k]; }
            });
        };
    }, [reportData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!reportData || selectedReport !== 'product') return;
        const t = setTimeout(() => buildProductCharts(reportData), 80);
        return () => {
            clearTimeout(t);
            ['prodTop', 'prodCategory'].forEach(k => {
                if (charts.current[k]) { charts.current[k].destroy(); delete charts.current[k]; }
            });
        };
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

    const buildInventoryCharts = (data) => {
        ['stockStatus', 'stockCategory'].forEach(k => {
            if (charts.current[k]) { charts.current[k].destroy(); delete charts.current[k]; }
        });

        const s          = data.summary;
        const inStockCt  = parseInt(s.in_stock)    || 0;
        const lowStockCt = parseInt(s.low_stock)   || 0;
        const outOfStock = parseInt(s.out_of_stock) || 0;

        /* Stock status doughnut */
        if (stockStatusRef.current) {
            charts.current.stockStatus = new Chart(stockStatusRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                    datasets: [{
                        data: [inStockCt, lowStockCt, outOfStock],
                        backgroundColor: ['#10b981cc', '#f97316cc', '#ef4444cc'],
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

        /* Stock value by category bar */
        if (stockCategoryRef.current && data.categoryStock.length) {
            charts.current.stockCategory = new Chart(stockCategoryRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: data.categoryStock.map(c => c.category),
                    datasets: [{
                        label: 'Stock Value (LKR)',
                        data: data.categoryStock.map(c => parseFloat(c.total_value)),
                        backgroundColor: PALETTE.slice(0, data.categoryStock.length).map(c => c + 'cc'),
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => ' LKR ' + ctx.parsed.y.toLocaleString() } },
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8', callback: v => 'LKR ' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                },
            });
        }
    };

    const buildProductCharts = (data) => {
        ['prodTop', 'prodCategory'].forEach(k => {
            if (charts.current[k]) { charts.current[k].destroy(); delete charts.current[k]; }
        });

        /* Top products horizontal bar by revenue */
        if (prodTopRef.current && data.topProducts.length) {
            const top8 = data.topProducts.slice(0, 8);
            charts.current.prodTop = new Chart(prodTopRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: top8.map(p => p.product_name.length > 22 ? p.product_name.slice(0, 22) + '…' : p.product_name),
                    datasets: [{
                        label: 'Revenue (LKR)',
                        data: top8.map(p => parseFloat(p.revenue)),
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

        /* Category performance doughnut */
        if (prodCategoryRef.current && data.categoryPerformance.length) {
            charts.current.prodCategory = new Chart(prodCategoryRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: data.categoryPerformance.map(c => c.category),
                    datasets: [{
                        data: data.categoryPerformance.map(c => parseFloat(c.revenue)),
                        backgroundColor: PALETTE.slice(0, data.categoryPerformance.length).map(c => c + 'cc'),
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
        if (selectedReport !== 'sales' && selectedReport !== 'inventory' && selectedReport !== 'product') {
            Swal.fire({ icon: 'info', title: 'Coming Soon', text: 'This report type is under development.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
            return;
        }
        if (selectedReport === 'sales' || selectedReport === 'product') {
            if (!startDate || !endDate) {
                Swal.fire({ icon: 'warning', title: 'Select Dates', text: 'Please select both a start and end date.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
                return;
            }
            if (new Date(startDate) > new Date(endDate)) {
                Swal.fire({ icon: 'warning', title: 'Invalid Range', text: 'Start date must be before end date.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4' });
                return;
            }
        }
        setLoading(true);
        destroyCharts();
        setIsGenerated(false);
        setReportData(null);
        try {
            let res;
            if (selectedReport === 'sales') {
                res = await apiRequest(`/admin/sales-report?start_date=${startDate}&end_date=${endDate}`);
            } else if (selectedReport === 'inventory') {
                res = await apiRequest('/admin/inventory-report');
            } else {
                res = await apiRequest(`/admin/product-performance-report?start_date=${startDate}&end_date=${endDate}`);
            }
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
        if (!pdfRef.current) return;
        Swal.fire({ title: 'Generating PDF…', background: '#1a1f2e', color: '#fff', showConfirmButton: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set({
                margin: [8, 10, 8, 10],
                filename: `sales-report-${startDate}-to-${endDate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            }).from(pdfRef.current).save();
            Swal.fire({ icon: 'success', title: 'Downloaded!', text: 'Your PDF report has been saved.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4', timer: 2000, showConfirmButton: false });
        } catch {
            Swal.close();
        }
    };

    /* ── Download inventory PDF ─────────────────────────── */
    const downloadInventoryPDF = async () => {
        if (!invPdfRef.current) return;
        Swal.fire({ title: 'Generating PDF…', background: '#1a1f2e', color: '#fff', showConfirmButton: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const today = new Date().toISOString().split('T')[0];
            await html2pdf().set({
                margin: [8, 10, 8, 10],
                filename: `inventory-report-${today}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            }).from(invPdfRef.current).save();
            Swal.fire({ icon: 'success', title: 'Downloaded!', text: 'Your PDF report has been saved.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#06b6d4', timer: 2000, showConfirmButton: false });
        } catch {
            Swal.close();
        }
    };

    /* ── Download product performance PDF ──────────────── */
    const downloadProductPDF = async () => {
        if (!prodPdfRef.current) return;
        Swal.fire({ title: 'Generating PDF…', background: '#1a1f2e', color: '#fff', showConfirmButton: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set({
                margin: [8, 10, 8, 10],
                filename: `product-performance-report-${startDate}-to-${endDate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            }).from(prodPdfRef.current).save();
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

    /* ── Inventory report UI ────────────────────────────── */
    const renderInventoryReport = () => {
        if (!reportData) return null;
        const s             = reportData.summary;
        const totalProducts = parseInt(s.total_products)      || 0;
        const totalCats     = parseInt(s.total_categories)    || 0;
        const totalUnits    = parseInt(s.total_stock_units)   || 0;
        const totalValue    = parseFloat(s.total_stock_value)  || 0;
        const outOfStock    = parseInt(s.out_of_stock)         || 0;
        const lowStockCt    = parseInt(s.low_stock)            || 0;
        const expiringSoon  = parseInt(s.expiring_soon)        || 0;

        return (
            <div className="report-display-area">
                {/* ── Header ── */}
                <div className="report-header">
                    <div className="rh-left">
                        <h2 className="rh-title"><Package size={22} style={{ marginRight: 10 }} />Inventory &amp; Stock Report</h2>
                        <p className="rh-sub">As of: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
                        <p className="rh-sub" style={{ marginTop: 2 }}>Generated: {new Date().toLocaleString()}</p>
                    </div>
                    <button className="btn-download" onClick={downloadInventoryPDF}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                {/* ── KPI cards ── */}
                <div className="kpi-grid">
                    <div className="kpi-card" style={{ '--kc': '#f59e0b' }}>
                        <div className="kpi-icon-wrap"><Package size={18} /></div>
                        <div className="kpi-label">TOTAL PRODUCTS</div>
                        <div className="kpi-val">{totalProducts.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#06b6d4' }}>
                        <div className="kpi-icon-wrap"><Archive size={18} /></div>
                        <div className="kpi-label">CATEGORIES</div>
                        <div className="kpi-val">{totalCats}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#3b82f6' }}>
                        <div className="kpi-icon-wrap"><TrendingUp size={18} /></div>
                        <div className="kpi-label">TOTAL UNITS</div>
                        <div className="kpi-val">{totalUnits.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#10b981' }}>
                        <div className="kpi-icon-wrap"><TrendingUp size={18} /></div>
                        <div className="kpi-label">STOCK VALUE</div>
                        <div className="kpi-val">{fmt(totalValue)}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#ef4444' }}>
                        <div className="kpi-icon-wrap"><AlertTriangle size={18} /></div>
                        <div className="kpi-label">OUT OF STOCK</div>
                        <div className="kpi-val">{outOfStock}</div>
                    </div>
                </div>

                {/* ── Charts ── */}
                <div className="charts-2col">
                    <div className="chart-col">
                        <h3 className="section-label">STOCK STATUS</h3>
                        <div className="chart-box chart-box-md">
                            <canvas ref={stockStatusRef} />
                        </div>
                    </div>
                    <div className="chart-col">
                        <h3 className="section-label">STOCK VALUE BY CATEGORY</h3>
                        <div className="chart-box chart-box-md">
                            {reportData.categoryStock.length > 0
                                ? <canvas ref={stockCategoryRef} />
                                : <div className="no-data">No data</div>}
                        </div>
                    </div>
                </div>

                {/* ── Category breakdown table ── */}
                {reportData.categoryStock.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">STOCK BY CATEGORY</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Category</th><th>Products</th><th>Total Units</th><th>Stock Value</th><th>Out of Stock</th><th>Low Stock</th></tr>
                            </thead>
                            <tbody>
                                {reportData.categoryStock.map((c, i) => (
                                    <tr key={i}>
                                        <td><strong>{c.category}</strong></td>
                                        <td>{c.product_count}</td>
                                        <td>{parseInt(c.total_units).toLocaleString()}</td>
                                        <td className="td-primary">{fmt(c.total_value)}</td>
                                        <td style={{ color: parseInt(c.out_of_stock_count) > 0 ? '#ef4444' : 'inherit', fontWeight: parseInt(c.out_of_stock_count) > 0 ? 600 : 400 }}>
                                            {parseInt(c.out_of_stock_count) > 0 ? c.out_of_stock_count : '—'}
                                        </td>
                                        <td style={{ color: parseInt(c.low_stock_count) > 0 ? '#f97316' : 'inherit', fontWeight: parseInt(c.low_stock_count) > 0 ? 600 : 400 }}>
                                            {parseInt(c.low_stock_count) > 0 ? c.low_stock_count : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Out of stock ── */}
                {reportData.outOfStock.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label" style={{ color: '#ef4444' }}>OUT OF STOCK ({reportData.outOfStock.length})</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Product</th><th>Category</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {reportData.outOfStock.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td className="td-primary">{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Low stock ── */}
                {reportData.lowStock.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label" style={{ color: '#f97316' }}>LOW STOCK — UNITS ≤ 10 ({reportData.lowStock.length})</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {reportData.lowStock.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td><span className="badge-stock-low">{p.stock_quantity}</span></td>
                                        <td className="td-primary">{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Expiring soon ── */}
                {reportData.expiringSoon.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label" style={{ color: '#8b5cf6' }}>EXPIRING WITHIN 30 DAYS ({reportData.expiringSoon.length})</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Product</th><th>Category</th><th>Stock</th><th>Expiry Date</th></tr>
                            </thead>
                            <tbody>
                                {reportData.expiringSoon.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td>{p.stock_quantity}</td>
                                        <td style={{ color: '#8b5cf6', fontWeight: 600 }}>
                                            {new Date(p.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Low stock alert banner ── */}
                {lowStockCt > 0 && (
                    <div className="inv-alert-banner">
                        <AlertTriangle size={16} />
                        <span><strong>{lowStockCt} product{lowStockCt > 1 ? 's' : ''}</strong> with low stock (≤ 10 units).
                        {expiringSoon > 0 && <> &nbsp;&bull;&nbsp; <strong>{expiringSoon} product{expiringSoon > 1 ? 's' : ''}</strong> expiring within 30 days.</>}
                        </span>
                    </div>
                )}

                {/* ── Empty state ── */}
                {totalProducts === 0 && (
                    <div className="empty-state">
                        <Package size={48} color="#334155" />
                        <p>No products found in inventory.</p>
                    </div>
                )}
            </div>
        );
    };

    /* ── Product Performance report UI ─────────────────── */
    const renderProductReport = () => {
        if (!reportData) return null;
        const s            = reportData.summary;
        const rs           = reportData.returnsSummary;
        const productsSold = parseInt(s.products_sold)      || 0;
        const totalUnits   = parseInt(s.total_units_sold)   || 0;
        const totalRevenue = parseFloat(s.total_revenue)    || 0;
        const totalOrders  = parseInt(s.total_orders)       || 0;
        const totalReturns = parseInt(rs.total_returns)     || 0;
        const totalRefund  = parseFloat(rs.total_refund_amount) || 0;

        const startLabel = new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const endLabel   = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        return (
            <div className="report-display-area">
                {/* ── Header ── */}
                <div className="report-header">
                    <div className="rh-left">
                        <h2 className="rh-title"><Star size={22} style={{ marginRight: 10 }} />Product Performance Report</h2>
                        <p className="rh-sub">Period: <strong>{startLabel}</strong> — <strong>{endLabel}</strong></p>
                        <p className="rh-sub" style={{ marginTop: 2 }}>Generated: {new Date().toLocaleString()}</p>
                    </div>
                    <button className="btn-download" onClick={downloadProductPDF}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                {/* ── KPI cards ── */}
                <div className="kpi-grid">
                    <div className="kpi-card" style={{ '--kc': '#10b981' }}>
                        <div className="kpi-icon-wrap"><Star size={18} /></div>
                        <div className="kpi-label">PRODUCTS SOLD</div>
                        <div className="kpi-val">{productsSold.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#3b82f6' }}>
                        <div className="kpi-icon-wrap"><Package size={18} /></div>
                        <div className="kpi-label">UNITS SOLD</div>
                        <div className="kpi-val">{totalUnits.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#f59e0b' }}>
                        <div className="kpi-icon-wrap"><TrendingUp size={18} /></div>
                        <div className="kpi-label">TOTAL REVENUE</div>
                        <div className="kpi-val">{fmt(totalRevenue)}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#8b5cf6' }}>
                        <div className="kpi-icon-wrap"><ShoppingCart size={18} /></div>
                        <div className="kpi-label">TOTAL ORDERS</div>
                        <div className="kpi-val">{totalOrders.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card" style={{ '--kc': '#ef4444' }}>
                        <div className="kpi-icon-wrap"><AlertTriangle size={18} /></div>
                        <div className="kpi-label">RETURNS</div>
                        <div className="kpi-val">{totalReturns.toLocaleString()}</div>
                    </div>
                </div>

                {/* ── Charts ── */}
                <div className="charts-2col">
                    <div className="chart-col" style={{ flex: 2 }}>
                        <h3 className="section-label">TOP PRODUCTS BY REVENUE</h3>
                        <div className="chart-box chart-box-tall">
                            {reportData.topProducts.length > 0
                                ? <canvas ref={prodTopRef} />
                                : <div className="no-data">No sales data for this period</div>}
                        </div>
                    </div>
                    <div className="chart-col" style={{ flex: 1 }}>
                        <h3 className="section-label">REVENUE BY CATEGORY</h3>
                        <div className="chart-box chart-box-tall">
                            {reportData.categoryPerformance.length > 0
                                ? <canvas ref={prodCategoryRef} />
                                : <div className="no-data">No data</div>}
                        </div>
                    </div>
                </div>

                {/* ── Top products table ── */}
                {reportData.topProducts.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">TOP PRODUCTS DETAIL</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>#</th><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th><th>% of Total</th></tr>
                            </thead>
                            <tbody>
                                {reportData.topProducts.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ color: '#64748b' }}>{i + 1}</td>
                                        <td><strong>{p.product_name}</strong></td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td>{parseInt(p.units_sold).toLocaleString()}</td>
                                        <td className="td-primary">{fmt(p.revenue)}</td>
                                        <td style={{ color: '#94a3b8' }}>
                                            {totalRevenue > 0 ? ((parseFloat(p.revenue) / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Category performance table ── */}
                {reportData.categoryPerformance.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">CATEGORY PERFORMANCE</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Category</th><th>Products</th><th>Units Sold</th><th>Revenue</th><th>% of Total</th></tr>
                            </thead>
                            <tbody>
                                {reportData.categoryPerformance.map((c, i) => (
                                    <tr key={i}>
                                        <td><strong>{c.category}</strong></td>
                                        <td>{c.products_count}</td>
                                        <td>{parseInt(c.units_sold).toLocaleString()}</td>
                                        <td className="td-primary">{fmt(c.revenue)}</td>
                                        <td style={{ color: '#94a3b8' }}>
                                            {totalRevenue > 0 ? ((parseFloat(c.revenue) / totalRevenue) * 100).toFixed(1) + '%' : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Returns & Refunds ── */}
                {(totalReturns > 0 || reportData.returnsByReason.length > 0) && (
                    <div className="table-section">
                        <h3 className="section-label" style={{ color: '#ef4444' }}>
                            RETURNS &amp; REFUNDS — {totalReturns} Return{totalReturns !== 1 ? 's' : ''} &nbsp;|&nbsp; {fmt(totalRefund)} Refunded
                        </h3>
                        {reportData.returnsByReason.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr><th>Reason</th><th>Returns</th><th>Total Refund</th></tr>
                                </thead>
                                <tbody>
                                    {reportData.returnsByReason.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.reason}</td>
                                            <td><span className="badge-stock-low">{r.return_count}</span></td>
                                            <td style={{ color: '#ef4444', fontWeight: 600 }}>{fmt(r.total_refund)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No approved returns in this period.</p>
                        )}
                    </div>
                )}

                {/* ── Recent returns detail ── */}
                {reportData.recentReturns.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label">RECENT RETURN REQUESTS</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Return #</th><th>Order #</th><th>Reason</th><th>Status</th><th>Refund Amount</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {reportData.recentReturns.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ color: '#64748b' }}>#{r.return_id}</td>
                                        <td>#{r.order_id}</td>
                                        <td>{r.reason}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                                background: r.status === 'Approved' || r.status === 'Refunded' ? 'rgba(16,185,129,0.15)' : r.status === 'Pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: r.status === 'Approved' || r.status === 'Refunded' ? '#10b981' : r.status === 'Pending' ? '#f59e0b' : '#ef4444',
                                            }}>{r.status}</span>
                                        </td>
                                        <td className="td-primary">{fmt(r.refund_amount)}</td>
                                        <td style={{ color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Slow movers ── */}
                {reportData.slowMovers.length > 0 && (
                    <div className="table-section">
                        <h3 className="section-label" style={{ color: '#f97316' }}>
                            SLOW MOVERS — NO SALES IN PERIOD ({reportData.slowMovers.length})
                        </h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {reportData.slowMovers.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td><span className="badge-stock-low">{p.stock_quantity}</span></td>
                                        <td className="td-primary">{fmt(p.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Refund summary banner ── */}
                {totalRefund > 0 && (
                    <div className="inv-alert-banner" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <span style={{ color: '#ef4444' }}>
                            <strong>{totalReturns} return{totalReturns !== 1 ? 's' : ''}</strong> processed this period.
                            Total refunded: <strong>{fmt(totalRefund)}</strong>
                            {totalOrders > 0 && totalReturns > 0 && <> — {((totalReturns / totalOrders) * 100).toFixed(1)}% return rate.</>}
                        </span>
                    </div>
                )}

                {/* ── Empty state ── */}
                {productsSold === 0 && (
                    <div className="empty-state">
                        <Star size={48} color="#334155" />
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
                            {(cat.id === 'sales' || cat.id === 'inventory' || cat.id === 'product')
                                ? <span className="badge-live">LIVE DATA</span>
                                : <span className="badge-soon">COMING SOON</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Date range + generate ── */}
            <div className="filter-section">
                {selectedReport !== 'inventory' && (
                    <>
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
                    </>
                )}

                {selectedReport === 'inventory' && (
                    <div className="filter-row">
                        <button className="btn-generate" onClick={generateReport} disabled={loading}>
                            <FileText size={15} /> {loading ? 'Generating…' : 'Generate Report'}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Loading state ── */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <span>Fetching data from database…</span>
                </div>
            )}

            {/* ── Report output ── */}
            {isGenerated && !loading && selectedReport === 'sales'     && renderSalesReport()}
            {isGenerated && !loading && selectedReport === 'inventory' && renderInventoryReport()}
            {isGenerated && !loading && selectedReport === 'product'   && renderProductReport()}

            {/* ── Hidden white PDF templates (off-screen, captured by html2pdf) ── */}
            {isGenerated && selectedReport === 'sales' && (
                <SalesReportPDF
                    reportData={reportData}
                    startDate={startDate}
                    endDate={endDate}
                    pdfRef={pdfRef}
                />
            )}
            {isGenerated && selectedReport === 'inventory' && (
                <InventoryReportPDF
                    reportData={reportData}
                    pdfRef={invPdfRef}
                />
            )}
            {isGenerated && selectedReport === 'product' && (
                <ProductPerformanceReportPDF
                    reportData={reportData}
                    startDate={startDate}
                    endDate={endDate}
                    pdfRef={prodPdfRef}
                />
            )}

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

                /* ── Inventory extras ── */
                .badge-stock-low {
                    display: inline-block;
                    background: rgba(249,115,22,0.12); color: #fb923c;
                    border: 1px solid rgba(249,115,22,0.25);
                    padding: 2px 9px; border-radius: 20px; font-size: 0.77rem; font-weight: 600;
                }

                .inv-alert-banner {
                    display: flex; align-items: center; gap: 0.6rem;
                    background: rgba(249,115,22,0.08);
                    border: 1px solid rgba(249,115,22,0.25);
                    border-radius: 8px; padding: 0.75rem 1rem;
                    color: #fb923c; font-size: 0.85rem;
                    margin-top: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default ReportsAnalytics;
