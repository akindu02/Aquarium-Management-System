import React, { useState, useEffect } from 'react';
import { Settings, ShoppingBag, DollarSign, Percent, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getAdminSettingsAPI, updateAdminSettingsAPI } from '../../utils/api';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        shipping_fee: '',
        online_discount_type: 'percentage',
        online_discount_value: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getAdminSettingsAPI();
            const data = res.data || {};
            setSettings({
                shipping_fee: data.shipping_fee ?? '0.00',
                online_discount_type: data.online_discount_type ?? 'percentage',
                online_discount_value: data.online_discount_value ?? '0.00',
            });
        } catch {
            setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleSave = async () => {
        const shippingNum = parseFloat(settings.shipping_fee);
        const discountNum = parseFloat(settings.online_discount_value);

        if (isNaN(shippingNum) || shippingNum < 0) {
            setMessage({ type: 'error', text: 'Shipping fee must be a non-negative number.' });
            return;
        }
        if (isNaN(discountNum) || discountNum < 0) {
            setMessage({ type: 'error', text: 'Discount value must be a non-negative number.' });
            return;
        }
        if (settings.online_discount_type === 'percentage' && discountNum > 100) {
            setMessage({ type: 'error', text: 'Percentage discount cannot exceed 100%.' });
            return;
        }

        setSaving(true);
        try {
            await updateAdminSettingsAPI({
                shipping_fee: shippingNum.toFixed(2),
                online_discount_type: settings.online_discount_type,
                online_discount_value: discountNum.toFixed(2),
            });
            setMessage({ type: 'success', text: 'Settings saved successfully.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div style={styles.pageHeaderLeft}>
                    <div style={styles.pageIconWrapper}>
                        <Settings size={22} color="#4ECDC4" />
                    </div>
                    <div>
                        <h1 style={styles.pageTitle}>System Settings</h1>
                        <p style={styles.pageSubtitle}>Configure platform-wide behaviour and billing rules</p>
                    </div>
                </div>
                <button style={styles.refreshBtn} onClick={fetchSettings} disabled={loading} title="Reload settings">
                    <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </button>
            </div>

            {/* Feedback Banner */}
            {message && (
                <div style={{ ...styles.banner, ...(message.type === 'success' ? styles.bannerSuccess : styles.bannerError) }}>
                    {message.type === 'success'
                        ? <CheckCircle size={16} style={{ flexShrink: 0 }} />
                        : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{message.text}</span>
                </div>
            )}

            {loading ? (
                <div style={styles.loadingWrapper}>
                    <RefreshCw size={28} color="#4ECDC4" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={styles.loadingText}>Loading settings…</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {/* ── Online Sales Card ── */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.cardIconWrapper}>
                                <ShoppingBag size={18} color="#4ECDC4" />
                            </div>
                            <div>
                                <h2 style={styles.cardTitle}>Online Sales</h2>
                                <p style={styles.cardSubtitle}>Shipping and discount settings applied at checkout</p>
                            </div>
                        </div>

                        <div style={styles.cardBody}>
                            {/* Shipping Fee */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <DollarSign size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#4ECDC4' }} />
                                    Shipping Fee (LKR)
                                </label>
                                <p style={styles.fieldHint}>
                                    A flat shipping charge added to every online order. Set to 0 for free shipping.
                                </p>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settings.shipping_fee}
                                    onChange={(e) => handleChange('shipping_fee', e.target.value)}
                                    style={styles.input}
                                    placeholder="e.g. 350.00"
                                />
                            </div>

                            <div style={styles.divider} />

                            {/* Discount */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <Percent size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#4ECDC4' }} />
                                    Online Order Discount
                                </label>
                                <p style={styles.fieldHint}>
                                    Applied to the subtotal of every online order at checkout.
                                    Set value to 0 to disable.
                                </p>

                                {/* Discount Type Toggle */}
                                <div style={styles.toggleRow}>
                                    <button
                                        style={{
                                            ...styles.toggleBtn,
                                            ...(settings.online_discount_type === 'percentage' ? styles.toggleBtnActive : {}),
                                        }}
                                        onClick={() => handleChange('online_discount_type', 'percentage')}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button
                                        style={{
                                            ...styles.toggleBtn,
                                            ...(settings.online_discount_type === 'amount' ? styles.toggleBtnActive : {}),
                                        }}
                                        onClick={() => handleChange('online_discount_type', 'amount')}
                                    >
                                        Fixed Amount (LKR)
                                    </button>
                                </div>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputAddon}>
                                        {settings.online_discount_type === 'percentage' ? '%' : 'LKR'}
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={settings.online_discount_type === 'percentage' ? 100 : undefined}
                                        step="0.01"
                                        value={settings.online_discount_value}
                                        onChange={(e) => handleChange('online_discount_value', e.target.value)}
                                        style={styles.inputWithAddon}
                                        placeholder={settings.online_discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 500.00'}
                                    />
                                </div>

                                {/* Live Preview */}
                                {parseFloat(settings.online_discount_value) > 0 && (
                                    <div style={styles.previewBox}>
                                        <span style={styles.previewLabel}>Preview:</span>
                                        {settings.online_discount_type === 'percentage'
                                            ? <span style={styles.previewValue}>
                                                {settings.online_discount_value}% off subtotal
                                              </span>
                                            : <span style={styles.previewValue}>
                                                LKR {parseFloat(settings.online_discount_value).toFixed(2)} off subtotal
                                              </span>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={styles.cardFooter}>
                            <button
                                style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                    : <><Save size={15} /> Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
    page: {
        padding: '0',
        color: 'var(--text-main)',
        minHeight: '100%',
    },
    pageHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
    },
    pageHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    pageIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'rgba(78,205,196,0.12)',
        border: '1px solid rgba(78,205,196,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    pageTitle: {
        fontSize: '1.6rem',
        fontWeight: 700,
        margin: 0,
        background: 'linear-gradient(135deg, #4ECDC4, #44A8B3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    pageSubtitle: {
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
        margin: '2px 0 0',
    },
    refreshBtn: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    banner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1.1rem',
        borderRadius: 10,
        fontSize: '0.9rem',
        marginBottom: '1.25rem',
    },
    bannerSuccess: {
        background: 'rgba(78,205,196,0.12)',
        border: '1px solid rgba(78,205,196,0.35)',
        color: '#4ECDC4',
    },
    bannerError: {
        background: 'rgba(255,107,107,0.12)',
        border: '1px solid rgba(255,107,107,0.35)',
        color: '#FF6B6B',
    },
    loadingWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        minHeight: '30vh',
    },
    loadingText: {
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 560px))',
        gap: '1.5rem',
    },
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(78,205,196,0.04)',
    },
    cardIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 10,
        background: 'rgba(78,205,196,0.12)',
        border: '1px solid rgba(78,205,196,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardTitle: {
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'var(--text-main)',
        margin: 0,
    },
    cardSubtitle: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        margin: '2px 0 0',
    },
    cardBody: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    cardFooter: {
        padding: '1rem 1.5rem 1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-main)',
    },
    fieldHint: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: 1.5,
    },
    input: {
        width: '100%',
        padding: '0.65rem 0.9rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        color: 'var(--text-main)',
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    divider: {
        height: 1,
        background: 'rgba(255,255,255,0.07)',
        margin: '1.25rem 0',
    },
    toggleRow: {
        display: 'flex',
        gap: '0.5rem',
    },
    toggleBtn: {
        padding: '0.5rem 1rem',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    toggleBtnActive: {
        background: 'rgba(78,205,196,0.15)',
        border: '1px solid rgba(78,205,196,0.5)',
        color: '#4ECDC4',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    inputAddon: {
        padding: '0.65rem 0.9rem',
        background: 'rgba(78,205,196,0.1)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        color: '#4ECDC4',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        minWidth: 52,
        justifyContent: 'center',
    },
    inputWithAddon: {
        flex: 1,
        padding: '0.65rem 0.9rem',
        background: 'rgba(255,255,255,0.05)',
        border: 'none',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
        outline: 'none',
    },
    previewBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 0.9rem',
        background: 'rgba(78,205,196,0.07)',
        border: '1px solid rgba(78,205,196,0.2)',
        borderRadius: 8,
    },
    previewLabel: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontWeight: 500,
    },
    previewValue: {
        fontSize: '0.88rem',
        color: '#4ECDC4',
        fontWeight: 600,
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.4rem',
        background: 'linear-gradient(135deg, #4ECDC4, #44A8B3)',
        border: 'none',
        borderRadius: 9,
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    saveBtnDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
};

export default SystemSettings;
