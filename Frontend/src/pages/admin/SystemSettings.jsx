import React, { useState, useEffect } from 'react';
import {
    Settings, ShoppingBag, DollarSign, Percent, Save,
    RefreshCw, AlertCircle, CheckCircle, MapPin, Phone, Mail,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getAdminSettingsAPI, updateAdminSettingsAPI } from '../../utils/api';

const DEFAULT_CONTACT = {
    contact_address: 'No 50, Kumaradasa Mawatha, Matara',
    contact_phone:   '041-2236848 / 074-3143109',
    contact_email:   'methuaquarium@gmail.com',
};

const SystemSettings = () => {
    const [sales, setSales] = useState({
        shipping_fee:          '',
        online_discount_type:  'percentage',
        online_discount_value: '',
    });
    const [contact, setContact] = useState({
        contact_address: '',
        contact_phone:   '',
        contact_email:   '',
    });

    const [loading,      setLoading]      = useState(true);
    const [savingSales,  setSavingSales]  = useState(false);
    const [savingContact,setSavingContact]= useState(false);
    const [salesMsg,     setSalesMsg]     = useState(null);
    const [contactMsg,   setContactMsg]   = useState(null);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res  = await getAdminSettingsAPI();
            const data = res.data || {};
            setSales({
                shipping_fee:          data.shipping_fee          ?? '0.00',
                online_discount_type:  data.online_discount_type  ?? 'percentage',
                online_discount_value: data.online_discount_value ?? '0.00',
            });
            setContact({
                contact_address: data.contact_address ?? DEFAULT_CONTACT.contact_address,
                contact_phone:   data.contact_phone   ?? DEFAULT_CONTACT.contact_phone,
                contact_email:   data.contact_email   ?? DEFAULT_CONTACT.contact_email,
            });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load settings.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#4ecdc4' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Sales save ── */
    const handleSaveSales = async () => {
        const shippingNum = parseFloat(sales.shipping_fee);
        const discountNum = parseFloat(sales.online_discount_value);
        if (isNaN(shippingNum) || shippingNum < 0) { setSalesMsg({ type: 'error', text: 'Shipping fee must be a non-negative number.' }); return; }
        if (isNaN(discountNum) || discountNum < 0)  { setSalesMsg({ type: 'error', text: 'Discount value must be a non-negative number.' }); return; }
        if (sales.online_discount_type === 'percentage' && discountNum > 100) { setSalesMsg({ type: 'error', text: 'Percentage discount cannot exceed 100%.' }); return; }

        setSavingSales(true);
        try {
            await updateAdminSettingsAPI({
                shipping_fee:          shippingNum.toFixed(2),
                online_discount_type:  sales.online_discount_type,
                online_discount_value: discountNum.toFixed(2),
            });
            setSalesMsg({ type: 'success', text: 'Online sales settings saved.' });
        } catch {
            setSalesMsg({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSavingSales(false);
        }
    };

    /* ── Contact save ── */
    const handleSaveContact = async () => {
        if (!contact.contact_address.trim()) { setContactMsg({ type: 'error', text: 'Address cannot be empty.' }); return; }
        if (!contact.contact_phone.trim())   { setContactMsg({ type: 'error', text: 'Phone cannot be empty.' });   return; }
        if (!contact.contact_email.trim())   { setContactMsg({ type: 'error', text: 'Email cannot be empty.' });   return; }

        setSavingContact(true);
        try {
            await updateAdminSettingsAPI({
                contact_address: contact.contact_address.trim(),
                contact_phone:   contact.contact_phone.trim(),
                contact_email:   contact.contact_email.trim(),
            });
            setContactMsg({ type: 'success', text: 'Contact details saved. Footer will reflect changes on next load.' });
        } catch {
            setContactMsg({ type: 'error', text: 'Failed to save contact details.' });
        } finally {
            setSavingContact(false);
        }
    };

    const Banner = ({ msg }) => msg ? (
        <div className={`ss-banner ${msg.type === 'success' ? 'ss-banner-ok' : 'ss-banner-err'}`}>
            {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{msg.text}</span>
        </div>
    ) : null;

    return (
        <div className="system-settings">

            {/* ── Header ── */}
            <div className="ss-header">
                <div className="ss-header-left">
                    <div className="ss-icon-wrap">
                        <Settings size={20} color="#4ECDC4" />
                    </div>
                    <div>
                        <h2 className="ss-title">System Settings</h2>
                        <p className="ss-subtitle">Configure platform-wide behaviour and store contact details</p>
                    </div>
                </div>
                <button className="ss-refresh-btn" onClick={fetchSettings} disabled={loading} title="Reload settings">
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="ss-loading">
                    <RefreshCw size={28} color="#4ECDC4" className="spin" />
                    <p>Loading settings…</p>
                </div>
            ) : (
                <div className="ss-grid">

                    {/* ── Card 1: Online Sales ── */}
                    <div className="ss-card">
                        <div className="ss-card-header">
                            <div className="ss-card-icon">
                                <ShoppingBag size={18} color="#4ECDC4" />
                            </div>
                            <div>
                                <h3 className="ss-card-title">Online Sales</h3>
                                <p className="ss-card-sub">Shipping and discount settings applied at checkout</p>
                            </div>
                        </div>

                        <div className="ss-card-body">
                            <Banner msg={salesMsg} />

                            {/* Shipping Fee */}
                            <div className="ss-field">
                                <label className="ss-label">
                                    <DollarSign size={13} className="ss-label-icon" /> Shipping Fee (LKR)
                                </label>
                                <p className="ss-hint">Flat charge added to every online order. Set to 0 for free shipping.</p>
                                <input
                                    type="number" min="0" step="0.01"
                                    className="ss-input"
                                    value={sales.shipping_fee}
                                    placeholder="e.g. 350.00"
                                    onChange={e => { setSales(p => ({ ...p, shipping_fee: e.target.value })); setSalesMsg(null); }}
                                />
                            </div>

                            <div className="ss-divider" />

                            {/* Discount */}
                            <div className="ss-field">
                                <label className="ss-label">
                                    <Percent size={13} className="ss-label-icon" /> Online Order Discount
                                </label>
                                <p className="ss-hint">Applied to every online order subtotal. Set to 0 to disable.</p>

                                <div className="ss-toggle-row">
                                    <button
                                        className={`ss-toggle-btn${sales.online_discount_type === 'percentage' ? ' active' : ''}`}
                                        onClick={() => { setSales(p => ({ ...p, online_discount_type: 'percentage' })); setSalesMsg(null); }}
                                    >Percentage (%)</button>
                                    <button
                                        className={`ss-toggle-btn${sales.online_discount_type === 'amount' ? ' active' : ''}`}
                                        onClick={() => { setSales(p => ({ ...p, online_discount_type: 'amount' })); setSalesMsg(null); }}
                                    >Fixed Amount (LKR)</button>
                                </div>

                                <div className="ss-input-addon-wrap">
                                    <span className="ss-input-addon">
                                        {sales.online_discount_type === 'percentage' ? '%' : 'LKR'}
                                    </span>
                                    <input
                                        type="number" min="0" step="0.01"
                                        max={sales.online_discount_type === 'percentage' ? 100 : undefined}
                                        className="ss-input-addon-field"
                                        value={sales.online_discount_value}
                                        placeholder={sales.online_discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 500.00'}
                                        onChange={e => { setSales(p => ({ ...p, online_discount_value: e.target.value })); setSalesMsg(null); }}
                                    />
                                </div>

                                {parseFloat(sales.online_discount_value) > 0 && (
                                    <div className="ss-preview">
                                        <span className="ss-preview-label">Preview:</span>
                                        <span className="ss-preview-val">
                                            {sales.online_discount_type === 'percentage'
                                                ? `${sales.online_discount_value}% off subtotal`
                                                : `LKR ${parseFloat(sales.online_discount_value).toFixed(2)} off subtotal`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ss-card-footer">
                            <button className="ss-save-btn" onClick={handleSaveSales} disabled={savingSales}>
                                {savingSales
                                    ? <><RefreshCw size={14} className="spin" /> Saving…</>
                                    : <><Save size={14} /> Save Changes</>}
                            </button>
                        </div>
                    </div>

                    {/* ── Card 2: Contact Information ── */}
                    <div className="ss-card">
                        <div className="ss-card-header">
                            <div className="ss-card-icon" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                                <Phone size={18} color="#a855f7" />
                            </div>
                            <div>
                                <h3 className="ss-card-title">Contact Information</h3>
                                <p className="ss-card-sub">Displayed in the website footer and PDF reports</p>
                            </div>
                        </div>

                        <div className="ss-card-body">
                            <Banner msg={contactMsg} />

                            {/* Address */}
                            <div className="ss-field">
                                <label className="ss-label">
                                    <MapPin size={13} className="ss-label-icon" style={{ color: '#a855f7' }} /> Address
                                </label>
                                <input
                                    type="text"
                                    className="ss-input"
                                    value={contact.contact_address}
                                    placeholder="e.g. No 50, Kumaradasa Mawatha, Matara"
                                    onChange={e => { setContact(p => ({ ...p, contact_address: e.target.value })); setContactMsg(null); }}
                                />
                            </div>

                            {/* Phone */}
                            <div className="ss-field">
                                <label className="ss-label">
                                    <Phone size={13} className="ss-label-icon" style={{ color: '#a855f7' }} /> Phone Number(s)
                                </label>
                                <p className="ss-hint">Use " / " to separate multiple numbers.</p>
                                <input
                                    type="text"
                                    className="ss-input"
                                    value={contact.contact_phone}
                                    placeholder="e.g. 041-2236848 / 074-3143109"
                                    onChange={e => { setContact(p => ({ ...p, contact_phone: e.target.value })); setContactMsg(null); }}
                                />
                            </div>

                            {/* Email */}
                            <div className="ss-field">
                                <label className="ss-label">
                                    <Mail size={13} className="ss-label-icon" style={{ color: '#a855f7' }} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    className="ss-input"
                                    value={contact.contact_email}
                                    placeholder="e.g. methuaquarium@gmail.com"
                                    onChange={e => { setContact(p => ({ ...p, contact_email: e.target.value })); setContactMsg(null); }}
                                />
                            </div>
                        </div>

                        <div className="ss-card-footer">
                            <button
                                className="ss-save-btn"
                                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                                onClick={handleSaveContact}
                                disabled={savingContact}
                            >
                                {savingContact
                                    ? <><RefreshCw size={14} className="spin" /> Saving…</>
                                    : <><Save size={14} /> Save Contact</>}
                            </button>
                        </div>
                    </div>

                </div>
            )}

            <style>{`
                .system-settings { display: flex; flex-direction: column; gap: 0; }

                /* Header */
                .ss-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 2rem;
                }
                .ss-header-left { display: flex; align-items: center; gap: 1rem; }
                .ss-icon-wrap {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.25);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .ss-title {
                    font-size: 1.75rem; font-weight: 700; color: var(--text-main);
                    margin: 0 0 0.2rem;
                }
                .ss-subtitle { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

                .ss-refresh-btn {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px; color: rgba(255,255,255,0.6); cursor: pointer;
                    padding: 0.5rem; display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .ss-refresh-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

                /* Loading */
                .ss-loading {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 1rem; min-height: 30vh; color: var(--text-muted); font-size: 0.95rem;
                }

                /* Grid */
                .ss-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
                    gap: 1.5rem;
                    align-items: start;
                }

                /* Card */
                .ss-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px; overflow: hidden;
                }
                .ss-card-header {
                    display: flex; align-items: center; gap: 0.9rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    background: rgba(78,205,196,0.04);
                }
                .ss-card-icon {
                    width: 38px; height: 38px; border-radius: 10px;
                    background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.2);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .ss-card-title { font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin: 0; }
                .ss-card-sub   { font-size: 0.82rem; color: var(--text-muted); margin: 2px 0 0; }

                .ss-card-body {
                    padding: 1.5rem; display: flex; flex-direction: column; gap: 0;
                }
                .ss-card-footer {
                    padding: 1rem 1.5rem 1.5rem; display: flex; justify-content: flex-end;
                }

                /* Banner */
                .ss-banner {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.65rem 1rem; border-radius: 8px; font-size: 0.88rem;
                    margin-bottom: 1rem;
                }
                .ss-banner-ok  { background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.3); color: #4ECDC4; }
                .ss-banner-err { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: #FF6B6B; }

                /* Fields */
                .ss-field { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1.25rem; }
                .ss-field:last-child { margin-bottom: 0; }
                .ss-label {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.9rem; font-weight: 600; color: var(--text-main);
                }
                .ss-label-icon { color: #4ECDC4; flex-shrink: 0; }
                .ss-hint { font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.5; }
                .ss-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.25rem 0 1.25rem; }

                /* Inputs */
                .ss-input {
                    width: 100%; padding: 0.65rem 0.9rem;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 8px; color: var(--text-main); font-size: 0.95rem;
                    outline: none; box-sizing: border-box; transition: border-color 0.2s;
                }
                .ss-input:focus { border-color: rgba(78,205,196,0.5); }

                /* Discount type toggle */
                .ss-toggle-row { display: flex; gap: 0.5rem; }
                .ss-toggle-btn {
                    padding: 0.45rem 0.9rem;
                    border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
                    background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5);
                    font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
                }
                .ss-toggle-btn.active {
                    background: rgba(78,205,196,0.15); border-color: rgba(78,205,196,0.5); color: #4ECDC4;
                }

                /* Input with prefix addon */
                .ss-input-addon-wrap {
                    display: flex; align-items: stretch;
                    border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; overflow: hidden;
                }
                .ss-input-addon {
                    padding: 0.65rem 0.9rem;
                    background: rgba(78,205,196,0.1); border-right: 1px solid rgba(255,255,255,0.1);
                    color: #4ECDC4; font-size: 0.9rem; font-weight: 600;
                    display: flex; align-items: center; min-width: 52px; justify-content: center;
                }
                .ss-input-addon-field {
                    flex: 1; padding: 0.65rem 0.9rem;
                    background: rgba(255,255,255,0.05); border: none;
                    color: var(--text-main); font-size: 0.95rem; outline: none;
                }

                /* Preview */
                .ss-preview {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.55rem 0.9rem;
                    background: rgba(78,205,196,0.07); border: 1px solid rgba(78,205,196,0.2);
                    border-radius: 8px;
                }
                .ss-preview-label { font-size: 0.82rem; color: var(--text-muted); font-weight: 500; }
                .ss-preview-val   { font-size: 0.88rem; color: #4ECDC4; font-weight: 600; }

                /* Save button */
                .ss-save-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.65rem 1.4rem;
                    background: linear-gradient(135deg, #4ECDC4, #44A8B3);
                    border: none; border-radius: 9px; color: #fff;
                    font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
                }
                .ss-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ss-save-btn:not(:disabled):hover { opacity: 0.9; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default SystemSettings;
