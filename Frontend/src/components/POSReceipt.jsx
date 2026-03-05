import React, { useRef, useEffect } from 'react';

/**
 * POSReceipt — Thermal-style cash receipt for Point of Sale transactions.
 * No shipping fee. Shows: items, total, cash received, balance.
 */
const POSReceipt = ({ orderData, onClose }) => {
    const {
        orderRef = 'POS-00000',
        orderId = '',
        customer = {},
        cartItems = [],
        totalAmount = 0,
        cashGiven = 0,
        paymentDate = new Date(),
    } = orderData || {};

    const receiptRef = useRef(null);

    const total = parseFloat(totalAmount) || 0;
    const cash = parseFloat(cashGiven) || 0;
    const balance = cash - total;

    const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
    const formattedDate = new Date(paymentDate).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const handleDownloadPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = receiptRef.current;
        const options = {
            margin: [6, 6, 6, 6],
            filename: `POS-Receipt-${orderRef}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
        };
        await html2pdf().set(options).from(element).save();
        if (onClose) onClose();
    };

    useEffect(() => {
        const timer = setTimeout(() => handleDownloadPDF(), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={S.offscreen}>
            <div ref={receiptRef} style={S.receipt}>

                {/* ── HEADER ── */}
                <div style={S.header}>
                    <div style={S.logoBlock}>
                        <span style={S.logoMethu}>Methu</span>
                        <span style={S.logoAquarium}>Aquarium</span>
                    </div>
                    <div style={S.headerContact}>
                        <span style={S.contactItem}>No 50, Kumaradasa Mawatha, Matara</span>
                        <span style={S.contactDot}>&bull;</span>
                        <span style={S.contactItem}>041-2236848 / 074-3143109</span>
                    </div>
                    <div style={S.headerDivider} />
                    <h2 style={S.receiptTitle}>CASH RECEIPT</h2>
                    <div style={S.metaRow}>
                        <span style={S.metaItem}><b style={S.metaLabel}>Receipt:</b> {receiptNumber}</span>
                        <span style={S.metaItem}><b style={S.metaLabel}>Ref:</b> {orderRef}</span>
                    </div>
                    <div style={S.metaRow}>
                        <span style={S.metaItem}><b style={S.metaLabel}>Date:</b> {formattedDate}</span>
                        <span style={S.metaItem}><b style={S.metaLabel}>Cashier:</b> Staff</span>
                    </div>
                </div>

                {/* ── CUSTOMER ── */}
                {customer.name && (
                    <div style={S.customerRow}>
                        <span style={S.custLabel}>Customer:</span>
                        <span style={S.custValue}>{customer.name}</span>
                        {customer.phone && <span style={S.custPhone}>{customer.phone}</span>}
                    </div>
                )}

                {/* ── ITEMS TABLE ── */}
                <div style={S.tableSection}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={{ ...S.th, textAlign: 'left', width: '46%' }}>Item</th>
                                <th style={{ ...S.th, textAlign: 'center', width: '12%' }}>Qty</th>
                                <th style={{ ...S.th, textAlign: 'right', width: '21%' }}>Price</th>
                                <th style={{ ...S.th, textAlign: 'right', width: '21%' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.length > 0 ? cartItems.map((item, idx) => (
                                <tr key={idx} style={idx % 2 === 0 ? S.trEven : S.trOdd}>
                                    <td style={{ ...S.td, textAlign: 'left' }}>{item.name || `Item ${idx + 1}`}</td>
                                    <td style={{ ...S.td, textAlign: 'center' }}>{item.quantity ?? item.qty}</td>
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        Rs. {parseFloat(item.price).toFixed(2)}
                                    </td>
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        Rs. {(item.price * (item.quantity ?? item.qty)).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>No items</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── TOTALS ── */}
                <div style={S.totalsOuter}>
                    {/* PAID stamp */}
                    <div style={S.stampArea}>
                        <div style={S.stamp}>
                            <span style={S.stampText}>PAID</span>
                        </div>
                    </div>

                    {/* Amount breakdown */}
                    <div style={S.totalsBox}>
                        <div style={S.totalSeparator} />
                        <TotalRow label="Total" value={`Rs. ${total.toFixed(2)}`} />
                        <div style={S.totalSeparator} />
                        <TotalRow label="Cash Received" value={`Rs. ${cash.toFixed(2)}`} cash />
                        <TotalRow
                            label="Balance"
                            value={balance >= 0
                                ? `Rs. ${balance.toFixed(2)}`
                                : `Rs. 0.00 (Short Rs. ${Math.abs(balance).toFixed(2)})`}
                            balance
                        />
                        <div style={S.totalSeparator} />
                        <TotalRow label="Grand Total" value={`Rs. ${total.toFixed(2)}`} grand />
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={S.footer}>
                    <p style={S.thankYou}>Thank you for shopping with Methu Aquarium!</p>
                    <p style={S.policy}>Returns accepted within 7 days with original receipt.</p>
                    <p style={S.copyright}>&copy; 2026 Methu Aquarium. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

/* ── Sub-components ── */
const TotalRow = ({ label, value, grand, cash, balance }) => {
    let bg = 'transparent', color = '#374151', padding = '4px 0', borderRadius = '0';
    if (grand)    { bg = '#06b6d4'; color = '#fff'; padding = '9px 12px'; borderRadius = '7px'; }
    if (cash)     { color = '#0f172a'; }
    if (balance)  { color = '#16a34a'; }
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding, borderRadius, background: bg, marginTop: grand ? '2px' : 0 }}>
            <span style={{ fontSize: grand ? '0.88rem' : '0.79rem', fontWeight: grand ? '700' : '500', color: grand ? '#fff' : color }}>{label}</span>
            <span style={{ fontSize: grand ? '0.92rem' : '0.82rem', fontWeight: grand ? '800' : '600', color: grand ? '#fff' : color }}>{value}</span>
        </div>
    );
};

/* ── Styles ── */
const S = {
    offscreen: {
        position: 'fixed', left: '-9999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none',
    },
    receipt: {
        width: '148mm',
        maxWidth: '100%',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    },
    header: {
        padding: '22px 28px 16px',
        textAlign: 'center',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
    },
    logoBlock: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '1px', marginBottom: '6px' },
    logoMethu: { fontSize: '1.55rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
    logoAquarium: { fontSize: '1.55rem', fontWeight: '800', color: '#06b6d4', letterSpacing: '-0.5px' },
    headerContact: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' },
    contactItem: { fontSize: '0.68rem', color: '#6b7280' },
    contactDot: { color: '#d1d5db', fontSize: '0.62rem' },
    headerDivider: { height: '1.5px', background: 'linear-gradient(90deg, transparent, #06b6d4 40%, #06b6d4 60%, transparent)', margin: '0 0 12px' },
    receiptTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', letterSpacing: '5px', margin: '0 0 10px' },
    metaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '3px' },
    metaItem: { fontSize: '0.68rem', color: '#374151' },
    metaLabel: { color: '#6b7280', fontWeight: '600' },
    customerRow: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 20px', background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap',
    },
    custLabel: { fontSize: '0.68rem', color: '#6b7280', fontWeight: '600' },
    custValue: { fontSize: '0.78rem', color: '#0f172a', fontWeight: '700' },
    custPhone: { fontSize: '0.68rem', color: '#6b7280', marginLeft: 'auto' },
    tableSection: { borderBottom: '1px solid #f1f5f9' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' },
    th: { padding: '8px 14px', background: '#0f172a', color: '#f8fafc', fontWeight: '600', fontSize: '0.64rem', letterSpacing: '1px', textTransform: 'uppercase' },
    td: { padding: '8px 14px', color: '#374151', fontSize: '0.76rem', borderBottom: '1px solid #f8fafc' },
    trEven: { background: '#ffffff' },
    trOdd: { background: '#fafafa' },
    totalsOuter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px 16px', borderBottom: '1px solid #f1f5f9' },
    stampArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 },
    stamp: { padding: '7px 22px', borderRadius: '6px', border: '3px solid #16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-12deg)', opacity: 0.8 },
    stampText: { fontSize: '1.2rem', fontWeight: '900', color: '#16a34a', letterSpacing: '6px', textTransform: 'uppercase' },
    totalsBox: { width: '200px' },
    totalSeparator: { height: '1px', background: '#e5e7eb', margin: '6px 0' },
    footer: { padding: '12px 28px 14px', textAlign: 'center', background: '#f8fafc', borderTop: '1.5px solid #e0f2fe' },
    thankYou: { fontSize: '0.76rem', fontWeight: '600', color: '#0f172a', margin: '0 0 3px' },
    policy: { fontSize: '0.64rem', color: '#6b7280', margin: '0 0 6px' },
    copyright: { fontSize: '0.6rem', color: '#9ca3af', margin: 0 },
};

export default POSReceipt;
