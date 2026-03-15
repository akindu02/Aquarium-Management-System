import React, { useRef, useEffect } from 'react';

const OrderReceipt = ({ orderData, onClose }) => {
    const {
        orderRef = 'ORD-00000',
        orderId = '',
        shippingData = {},
        cartItems = [],
        currentTotal = 0,
        shippingFee: passedShippingFee = 0,
        cardType = 'Visa Card',
        paymentDate = new Date(),
        discountAmount = 0,
    } = orderData || {};

    const receiptRef = useRef(null);

    const subtotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const tax = 0;
    const shippingFee = passedShippingFee;
    
    // In case discount isn't explicitly passed but currentTotal < subtotal + shippingFee
    const calculatedDiscount = (subtotal + shippingFee) - parseFloat(currentTotal || (subtotal + shippingFee));
    const discount = parseFloat(discountAmount) || (calculatedDiscount > 0 ? calculatedDiscount : 0);
    
    const grandTotal = parseFloat(currentTotal || (subtotal + shippingFee - discount));

    const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
    const transactionId = `TXN-${String(orderId || '00000').padStart(5, '0')}-${Date.now().toString().slice(-6)}`;
    const formattedDate = new Date(paymentDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const handleDownloadPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = receiptRef.current;
        const options = {
            margin: [8, 8, 8, 8],
            filename: `Receipt-${orderRef}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        await html2pdf().set(options).from(element).save();
        if (onClose) onClose();
    };

    useEffect(() => {
        // Small delay to ensure the DOM is painted before capturing
        const timer = setTimeout(() => handleDownloadPDF(), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        /* Hidden off-screen container — rendered only for PDF capture */
        <div style={S.offscreen}>
            <div ref={receiptRef} style={S.receipt}>

                    {/* HEADER — white, brand logo text */}
                    <div style={S.header}>
                        <div style={S.logoBlock}>
                            <span style={S.logoMethu}>Methu</span>
                            <span style={S.logoAquarium}>Aquarium</span>
                        </div>
                        <div style={S.headerContact}>
                            <span style={S.contactItem}>No 50, Kumaradasa Mawatha, Matara</span>
                            <span style={S.contactDot}>&bull;</span>
                            <span style={S.contactItem}>041-2236848 / 074-3143109</span>
                            <span style={S.contactDot}>&bull;</span>
                            <span style={S.contactItem}>methuaquarium@gmail.com</span>
                        </div>
                        <div style={S.headerDivider} />
                        <h2 style={S.receiptTitle}>PAYMENT RECEIPT</h2>
                    </div>

                    {/* ORDER INFO + BILLING */}
                    <div style={S.infoGrid}>
                        <div style={S.infoCard}>
                            <p style={S.cardLabel}>ORDER INFORMATION</p>
                            <InfoRow label="Receipt No." value={receiptNumber} />
                            <InfoRow label="Order ID" value={orderRef} bold />
                            <InfoRow label="Payment Date" value={formattedDate} />
                            <InfoRow label="Payment Method" value={cardType} />
                            <InfoRow label="Transaction ID" value={transactionId} mono />
                        </div>
                        <div style={{ ...S.infoCard, borderRight: 'none' }}>
                            <p style={S.cardLabel}>BILLING DETAILS</p>
                            <InfoRow label="Name" value={shippingData.name || '—'} bold />
                            <InfoRow label="Email" value={shippingData.email || '—'} />
                            <InfoRow label="Phone" value={shippingData.phone || '—'} />
                            <InfoRow
                                label="Address"
                                value={[shippingData.address, shippingData.city, shippingData.zipCode]
                                    .filter(Boolean).join(', ') || '—'}
                            />
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div style={S.tableSection}>
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...S.th, textAlign: 'left', width: '46%' }}>Item</th>
                                    <th style={{ ...S.th, textAlign: 'center', width: '14%' }}>Qty</th>
                                    <th style={{ ...S.th, textAlign: 'right', width: '20%' }}>Unit Price</th>
                                    <th style={{ ...S.th, textAlign: 'right', width: '20%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.length > 0 ? cartItems.map((item, idx) => (
                                    <tr key={idx} style={idx % 2 === 0 ? S.trEven : S.trOdd}>
                                        <td style={{ ...S.td, textAlign: 'left' }}>
                                            {item.name || item.product_name || `Item ${idx + 1}`}
                                        </td>
                                        <td style={{ ...S.td, textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ ...S.td, textAlign: 'right' }}>
                                            Rs. {parseFloat(item.price).toFixed(2)}
                                        </td>
                                        <td style={{ ...S.td, textAlign: 'right' }}>
                                            Rs. {(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>
                                            No items
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS */}
                    <div style={S.totalsOuter}>
                        {/* PAID pill badge */}
                        <div style={S.stampArea}>
                            <div style={S.stamp}>
                                <span style={S.stampText}>PAID</span>
                            </div>
                        </div>
                        <div style={S.totalsBox}>
                            <TotalRow label="Subtotal" value={`Rs. ${subtotal.toFixed(2)}`} />
                            <TotalRow label="Shipping" value={`Rs. ${shippingFee.toFixed(2)}`} />
                            {tax > 0 && <TotalRow label="Tax" value={`Rs. ${tax.toFixed(2)}`} />}
                            {discount > 0 && <TotalRow label="Discount" value={`- Rs. ${discount.toFixed(2)}`} />}
                            <div style={S.totalSeparator} />
                            <TotalRow label="Grand Total" value={`Rs. ${grandTotal.toFixed(2)}`} grand />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div style={S.footer}>
                        <p style={S.thankYou}>Thank you for shopping with Methu Aquarium.</p>
                        <p style={S.policy}>Returns accepted within 7 days of purchase with original receipt.</p>
                        <p style={S.copyright}>&copy; 2026 Methu Aquarium. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
    );
};

/* ─── Sub-components ─── */
const InfoRow = ({ label, value, bold, mono }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 0', gap: '8px' }}>
        <span style={{ fontSize: '0.73rem', color: '#6b7280', fontWeight: '500', flexShrink: 0 }}>{label}</span>
        <span style={{
            fontSize: mono ? '0.68rem' : '0.78rem',
            color: '#111827',
            fontWeight: bold ? '700' : '500',
            fontFamily: mono ? 'monospace' : 'inherit',
            textAlign: 'right',
            wordBreak: 'break-all',
        }}>{value}</span>
    </div>
);

const TotalRow = ({ label, value, grand }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: grand ? '9px 12px' : '4px 0',
        borderRadius: grand ? '7px' : '0',
        background: grand ? '#06b6d4' : 'transparent',
        marginTop: grand ? '2px' : '0',
    }}>
        <span style={{ fontSize: grand ? '0.88rem' : '0.79rem', fontWeight: grand ? '700' : '500', color: grand ? '#fff' : '#374151' }}>
            {label}
        </span>
        <span style={{ fontSize: grand ? '0.92rem' : '0.82rem', fontWeight: grand ? '800' : '600', color: grand ? '#fff' : '#111827' }}>
            {value}
        </span>
    </div>
);

/* ─── Styles ─── */
const S = {
    offscreen: {
        position: 'fixed',
        left: '-9999px',
        top: 0,
        zIndex: -1,
        opacity: 0,
        pointerEvents: 'none',
    },

    /* Receipt card */
    receipt: {
        width: '210mm',
        maxWidth: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    },

    /* HEADER — clean white, no gradient */
    header: {
        padding: '28px 36px 20px',
        textAlign: 'center',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
    },
    logoBlock: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: '1px',
        marginBottom: '8px',
    },
    logoMethu: {
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: '-0.5px',
    },
    logoAquarium: {
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#06b6d4',
        letterSpacing: '-0.5px',
    },
    headerContact: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '14px',
    },
    contactItem: {
        fontSize: '0.71rem',
        color: '#6b7280',
    },
    contactDot: {
        color: '#d1d5db',
        fontSize: '0.65rem',
    },
    headerDivider: {
        height: '1.5px',
        background: 'linear-gradient(90deg, transparent, #06b6d4 40%, #06b6d4 60%, transparent)',
        margin: '0 0 14px',
    },
    receiptTitle: {
        fontSize: '1.05rem',
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: '5px',
        margin: '0 0 10px',
    },


    /* Info grid */
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid #f1f5f9',
    },
    infoCard: {
        padding: '18px 26px',
        borderRight: '1px solid #f1f5f9',
    },
    cardLabel: {
        fontSize: '0.6rem',
        fontWeight: '700',
        color: '#06b6d4',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '12px',
        paddingBottom: '7px',
        borderBottom: '1px solid #e0f2fe',
    },

    /* Table */
    tableSection: {
        borderBottom: '1px solid #f1f5f9',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.8rem',
    },
    th: {
        padding: '10px 20px',
        background: '#0f172a',
        color: '#f8fafc',
        fontWeight: '600',
        fontSize: '0.68rem',
        letterSpacing: '1px',
        textTransform: 'uppercase',
    },
    td: {
        padding: '10px 20px',
        color: '#374151',
        fontSize: '0.8rem',
        borderBottom: '1px solid #f8fafc',
    },
    trEven: { background: '#ffffff' },
    trOdd: { background: '#fafafa' },

    /* Totals */
    totalsOuter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 26px 18px',
        borderBottom: '1px solid #f1f5f9',
    },
    stampArea: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    stamp: {
        padding: '8px 28px',
        borderRadius: '6px',
        border: '3px solid #16a34a',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-12deg)',
        opacity: 0.8,
    },
    stampText: {
        fontSize: '1.4rem',
        fontWeight: '900',
        color: '#16a34a',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        fontFamily: "'Outfit', system-ui, sans-serif",
    },
    totalsBox: { width: '240px' },
    totalSeparator: {
        height: '1px',
        background: '#e5e7eb',
        margin: '8px 0 6px',
    },

    /* Footer — compact */
    footer: {
        padding: '14px 36px 16px',
        textAlign: 'center',
        background: '#f8fafc',
        borderTop: '1.5px solid #e0f2fe',
    },
    thankYou: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#0f172a',
        margin: '0 0 3px',
    },
    policy: {
        fontSize: '0.68rem',
        color: '#6b7280',
        margin: '0 0 8px',
    },
    copyright: {
        fontSize: '0.63rem',
        color: '#9ca3af',
        margin: 0,
    },
};

export default OrderReceipt;
