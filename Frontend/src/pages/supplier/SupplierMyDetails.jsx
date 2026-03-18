import React, { useState, useEffect, useCallback } from 'react';
import { User, Building2, Phone, MapPin, Mail, Edit3, Save, X, CheckCircle, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { getSupplierDetailsAPI, updateSupplierDetailsAPI } from '../../utils/api';

const SupplierMyDetails = () => {
    const [details, setDetails]       = useState({ name: '', email: '', company_name: '', phone: '', address: '' });
    const [form, setForm]             = useState({ company_name: '', phone: '', address: '' });
    const [isEditing, setIsEditing]   = useState(false);
    const [isLoading, setIsLoading]   = useState(true);
    const [isSaving, setIsSaving]     = useState(false);
    const [errors, setErrors]         = useState({});

    /* ── Fetch ── */
    const fetchDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getSupplierDetailsAPI();
            if (res.success) {
                setDetails(res.data);
                setForm({
                    company_name: res.data.company_name || '',
                    phone:        res.data.phone        || '',
                    address:      res.data.address      || '',
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Failed to Load',
                text: err.message || 'Could not load your details.',
                background: '#1a1f2e', color: '#fff', confirmButtonColor: '#667eea',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!form.phone.trim())   e.phone   = 'Phone number is required.';
        else if (!/^(?:(?:\+|00)94|0)[0-9]{9}$/.test(form.phone.trim().replace(/\s/g, '')))
                                  e.phone   = 'Enter a valid Sri Lankan phone number (e.g. 0712345678 or +94712345678).';
        if (!form.address.trim()) e.address = 'Address is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Handlers ── */
    const handleEdit = () => {
        setForm({
            company_name: details.company_name || '',
            phone:        details.phone        || '',
            address:      details.address      || '',
        });
        setErrors({});
        setIsEditing(true);
    };

    const handleCancel = () => {
        setErrors({});
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setIsSaving(true);
            const res = await updateSupplierDetailsAPI(form);
            if (res.success) {
                setDetails(prev => ({ ...prev, ...res.data }));
                setIsEditing(false);
                Swal.fire({
                    icon: 'success', title: 'Saved!',
                    text: 'Your details have been updated successfully.',
                    background: '#1a1f2e', color: '#fff', confirmButtonColor: '#667eea',
                    timer: 2000, showConfirmButton: false,
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Save Failed',
                text: err.message || 'Could not save your details.',
                background: '#1a1f2e', color: '#fff', confirmButtonColor: '#667eea',
            });
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Helpers ── */
    const getInitials = (name) => {
        if (!name) return '?';
        return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="smd-loading">
                <Loader size={32} className="smd-spinner" />
                <p>Loading your details...</p>
            </div>
        );
    }

    return (
        <div className="smd-container">
            {/* ── Page Header ── */}
            <div className="smd-page-header">
                <div>
                    <h2 className="smd-title">My Details</h2>
                    <p className="smd-subtitle">Manage your supplier profile and company information</p>
                </div>
                {!isEditing && (
                    <button className="smd-edit-btn" onClick={handleEdit}>
                        <Edit3 size={16} />
                        Edit Details
                    </button>
                )}
            </div>

            <div className="smd-body">
                {/* ── Left: Avatar Card ── */}
                <div className="smd-avatar-card">
                    <div className="smd-avatar">
                        {getInitials(details.name)}
                    </div>
                    <h3 className="smd-avatar-name">{details.name || '—'}</h3>
                    <span className="smd-role-badge">Supplier</span>
                    <div className="smd-avatar-meta">
                        <Mail size={14} />
                        <span>{details.email || '—'}</span>
                    </div>
                    {details.company_name && (
                        <div className="smd-avatar-meta">
                            <Building2 size={14} />
                            <span>{details.company_name}</span>
                        </div>
                    )}
                    <div className="smd-verified-tag">
                        <CheckCircle size={13} />
                        Verified Supplier
                    </div>
                </div>

                {/* ── Right: Form Card ── */}
                <div className="smd-form-card">
                    <h4 className="smd-form-section-title">
                        {isEditing ? 'Edit Company Information' : 'Company Information'}
                    </h4>

                    {/* Account Info (read-only always) */}
                    <div className="smd-field-group smd-readonly-group">
                        <div className="smd-field">
                            <label className="smd-label"><User size={14} /> Full Name</label>
                            <div className="smd-readonly-value">{details.name || '—'}</div>
                        </div>
                        <div className="smd-field">
                            <label className="smd-label"><Mail size={14} /> Email Address</label>
                            <div className="smd-readonly-value">{details.email || '—'}</div>
                        </div>
                    </div>

                    <div className="smd-divider" />

                    {/* Editable Fields */}
                    <div className="smd-field-group">
                        {/* Company Name */}
                        <div className="smd-field smd-field-full">
                            <label className="smd-label"><Building2 size={14} /> Company Name <span className="smd-optional">(optional)</span></label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="company_name"
                                    className={`smd-input ${errors.company_name ? 'smd-input-error' : ''}`}
                                    placeholder="e.g. Aqua Supplies Ltd."
                                    value={form.company_name}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="smd-readonly-value">
                                    {details.company_name || <span className="smd-empty">Not provided</span>}
                                </div>
                            )}
                            {errors.company_name && <p className="smd-error-msg">{errors.company_name}</p>}
                        </div>

                        {/* Phone */}
                        <div className="smd-field">
                            <label className="smd-label"><Phone size={14} /> Phone Number <span className="smd-required">*</span></label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    className={`smd-input ${errors.phone ? 'smd-input-error' : ''}`}
                                    placeholder="e.g. 0712345678 or +94712345678"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="smd-readonly-value">
                                    {details.phone || <span className="smd-empty">Not provided</span>}
                                </div>
                            )}
                            {errors.phone && <p className="smd-error-msg">{errors.phone}</p>}
                        </div>

                        {/* Address */}
                        <div className="smd-field smd-field-full">
                            <label className="smd-label"><MapPin size={14} /> Business Address <span className="smd-required">*</span></label>
                            {isEditing ? (
                                <textarea
                                    name="address"
                                    rows={3}
                                    className={`smd-input smd-textarea ${errors.address ? 'smd-input-error' : ''}`}
                                    placeholder="e.g. No. 45, Marine Drive, Colombo 03"
                                    value={form.address}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="smd-readonly-value smd-multiline">
                                    {details.address || <span className="smd-empty">Not provided</span>}
                                </div>
                            )}
                            {errors.address && <p className="smd-error-msg">{errors.address}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="smd-actions">
                            <button className="smd-cancel-btn" onClick={handleCancel} disabled={isSaving}>
                                <X size={16} /> Cancel
                            </button>
                            <button className="smd-save-btn" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader size={16} className="smd-spinner-sm" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* ── Layout ── */
                .smd-container {
                    padding: 0;
                    width: 100%;
                    max-width: 100%;
                }

                .smd-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    gap: 1rem;
                    color: rgba(255,255,255,0.5);
                }

                /* ── Page Header ── */
                .smd-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .smd-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 0.4rem 0;
                }

                .smd-subtitle {
                    color: rgba(255,255,255,0.5);
                    margin: 0;
                    font-size: 0.95rem;
                }

                .smd-edit-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1.4rem;
                    background: rgba(102, 126, 234, 0.15);
                    border: 1px solid rgba(102, 126, 234, 0.4);
                    border-radius: 10px;
                    color: #a5b4fc;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .smd-edit-btn:hover {
                    background: rgba(102, 126, 234, 0.28);
                    border-color: rgba(102, 126, 234, 0.7);
                    color: #fff;
                    transform: translateY(-1px);
                }

                /* ── Body ── */
                .smd-body {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }

                @media (max-width: 900px) {
                    .smd-body { grid-template-columns: 1fr; }
                }

                /* ── Avatar Card ── */
                .smd-avatar-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1.25rem;
                    padding: 2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.6rem;
                    text-align: center;
                }

                .smd-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 0 0 4px rgba(102,126,234,0.2);
                }

                .smd-avatar-name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    margin: 0;
                }

                .smd-role-badge {
                    display: inline-block;
                    padding: 0.2rem 0.75rem;
                    background: rgba(102, 126, 234, 0.15);
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    border-radius: 20px;
                    color: #a5b4fc;
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                }

                .smd-avatar-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.85rem;
                    word-break: break-all;
                }

                .smd-verified-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    margin-top: 0.75rem;
                    padding: 0.35rem 0.9rem;
                    background: rgba(16,185,129,0.1);
                    border: 1px solid rgba(16,185,129,0.25);
                    border-radius: 20px;
                    color: #10b981;
                    font-size: 0.78rem;
                    font-weight: 600;
                }

                /* ── Form Card ── */
                .smd-form-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1.25rem;
                    padding: 2rem;
                }

                .smd-form-section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.7);
                    margin: 0 0 1.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    font-size: 0.8rem;
                }

                .smd-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.07);
                    margin: 1.5rem 0;
                }

                /* ── Field Groups ── */
                .smd-field-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }

                .smd-readonly-group {
                    opacity: 0.7;
                }

                .smd-field-full {
                    grid-column: 1 / -1;
                }

                .smd-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .smd-label {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.45);
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }

                .smd-required {
                    color: #f87171;
                    font-size: 0.85rem;
                }

                .smd-optional {
                    color: rgba(255,255,255,0.3);
                    font-weight: 400;
                    text-transform: none;
                    letter-spacing: 0;
                    font-size: 0.78rem;
                }

                /* ── Read-only Value ── */
                .smd-readonly-value {
                    font-size: 1rem;
                    color: rgba(255,255,255,0.9);
                    padding: 0.6rem 0.9rem;
                    background: rgba(0,0,0,0.15);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.06);
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                }

                .smd-multiline {
                    align-items: flex-start;
                    white-space: pre-wrap;
                }

                .smd-empty {
                    color: rgba(255,255,255,0.25);
                    font-style: italic;
                    font-size: 0.9rem;
                }

                /* ── Input ── */
                .smd-input {
                    width: 100%;
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    color: #fff;
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }

                .smd-input:focus {
                    border-color: rgba(102, 126, 234, 0.6);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
                }

                .smd-input::placeholder { color: rgba(255,255,255,0.25); }

                .smd-input-error {
                    border-color: rgba(248, 113, 113, 0.6) !important;
                    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1) !important;
                }

                .smd-textarea { resize: vertical; min-height: 90px; }

                .smd-error-msg {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #f87171;
                }

                /* ── Action Buttons ── */
                .smd-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    flex-wrap: wrap;
                }

                .smd-cancel-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.7rem 1.5rem;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 10px;
                    color: rgba(255,255,255,0.6);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .smd-cancel-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.06);
                    color: #fff;
                    border-color: rgba(255,255,255,0.3);
                }

                .smd-save-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.7rem 1.75rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                    box-shadow: 0 4px 15px rgba(102,126,234,0.3);
                }

                .smd-save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102,126,234,0.45);
                }

                .smd-save-btn:disabled,
                .smd-cancel-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* ── Spinner ── */
                @keyframes smd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .smd-spinner    { animation: smd-spin 1s linear infinite; color: rgba(255,255,255,0.4); }
                .smd-spinner-sm { animation: smd-spin 0.8s linear infinite; }
            `}</style>
        </div>
    );
};

export default SupplierMyDetails;
