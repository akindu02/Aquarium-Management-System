import React, { useState, useRef, useEffect } from 'react';
import { UserRound, Lock, KeyRound, Eye, EyeOff, Check, CheckCircle2, XCircle, X, Mail, Shield } from 'lucide-react';
import { getUserData, updateUserData } from '../utils/auth';
import { updateProfileAPI, changePasswordAPI } from '../utils/api';

const ProfileModal = ({ show, onClose, user, setUser, accentColor = '#06b6d4', accentGradient = 'linear-gradient(135deg, #06b6d4, #3b82f6)', roleEmoji = '👤' }) => {

  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (show) {
      setProfileName(user?.name || '');
      setProfileEmail(user?.email || '');
      setProfileMsg(null);
      setPwMsg(null);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPw({ current: false, newPw: false, confirm: false });
      setActiveTab('profile');
    }
  }, [show, user?.name]);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (show) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show, onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const isCustomer = user?.role === 'customer';

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;
    if (isCustomer && !profileEmail.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updateData = { name: profileName.trim() };
      if (isCustomer && profileEmail.trim() !== (user?.email || '')) {
        updateData.email = profileEmail.trim();
      }
      const res = await updateProfileAPI(updateData);
      if (res.success) {
        const updatedFields = { name: profileName.trim() };
        if (res.user?.email) updatedFields.email = res.user.email;
        updateUserData(updatedFields);
        setUser(getUserData());
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Update failed' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) return;
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await changePasswordAPI(pwForm.current, pwForm.newPw);
      if (res.success) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setPwForm({ current: '', newPw: '', confirm: '' });
        setShowPw({ current: false, newPw: false, confirm: false });
      } else {
        setPwMsg({ type: 'error', text: res.message || 'Failed to change password' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPwSaving(false);
    }
  };



  const getStrength = () => {
    const len = pwForm.newPw.length;
    if (len === 0) return { width: '0%', color: '#333', label: '' };
    if (len < 6) return { width: '25%', color: '#FF6B6B', label: 'Weak' };
    if (len < 8) return { width: '55%', color: '#f59e0b', label: 'Fair' };
    const hasUpper = /[A-Z]/.test(pwForm.newPw);
    const hasNum = /[0-9]/.test(pwForm.newPw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwForm.newPw);
    if (hasUpper && hasNum && hasSpecial) return { width: '100%', color: '#10b981', label: 'Strong' };
    return { width: '75%', color: accentColor, label: 'Good' };
  };

  if (!show) return null;

  const strength = getStrength();
  const nameUnchanged = profileName.trim() === (user?.name || '');
  const emailUnchanged = !isCustomer || profileEmail.trim().toLowerCase() === (user?.email || '').toLowerCase();
  const nothingChanged = nameUnchanged && emailUnchanged;

  return (
    <>
      <div className="pm-overlay" />
      <div className="pm-container">
        <div className="pm-modal" ref={modalRef}>

          {/* Header */}
          <div className="pm-header">
            <div className="pm-avatar">{getInitials(user?.name)}</div>
            <div className="pm-header-info">
              <p className="pm-name">{user?.name || 'User'}</p>
              <p className="pm-email">{user?.email}</p>
              <span className="pm-role-badge">{user?.role}</span>
            </div>
            <button className="pm-close" onClick={onClose}><X size={16} /></button>
          </div>

          {/* Tabs */}
          <div className="pm-tabs">
            <button className={`pm-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <UserRound size={14} /> Profile
            </button>
            <button className={`pm-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <KeyRound size={14} /> Security
            </button>
          </div>

          {/* Body */}
          <div className="pm-body">
            {activeTab === 'profile' && (
              <div className="pm-section">
                <div className="pm-field">
                  <label className="pm-label">Full Name</label>
                  <div className="pm-input-wrap">
                    <UserRound size={14} className="pm-input-icon" />
                    <input className="pm-input pm-input-iconic" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your full name" />
                  </div>
                </div>
                <div className="pm-field">
                  <label className="pm-label">Email</label>
                  {isCustomer ? (
                    <div className="pm-input-wrap">
                      <Mail size={14} className="pm-input-icon" />
                      <input className="pm-input pm-input-iconic" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="Your email address" type="email" />
                    </div>
                  ) : (
                    <>
                      <div className="pm-input-ro">
                        <Mail size={14} /><span>{user?.email || '—'}</span>
                      </div>
                      <p className="pm-hint">Contact an administrator to change your email</p>
                    </>
                  )}
                </div>
                <div className="pm-field">
                  <label className="pm-label">Role</label>
                  <div className="pm-input-ro">
                    <Shield size={14} /><span style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                  </div>
                </div>
                {profileMsg && (
                  <div className={`pm-msg ${profileMsg.type}`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {profileMsg.text}
                  </div>
                )}
                <button className="pm-btn" onClick={handleSaveProfile} disabled={profileSaving || nothingChanged}>
                  {profileSaving ? <><span className="pm-spinner" /> Saving...</> : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="pm-section">
                {[
                  { key: 'current', label: 'Current Password', placeholder: 'Current password' },
                  { key: 'newPw',   label: 'New Password',     placeholder: 'New password (min. 6)' },
                  { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
                ].map(({ key, label, placeholder }) => (
                  <div className="pm-field" key={key}>
                    <label className="pm-label">{label}</label>
                    <div className="pm-pw-wrap">
                      <input className="pm-input" type={showPw[key] ? 'text' : 'password'}
                        value={pwForm[key]} placeholder={placeholder}
                        onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} />
                      <button className="pm-pw-eye" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}>
                        {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {key === 'newPw' && pwForm.newPw && (
                      <div className="pm-strength">
                        <div className="pm-strength-track">
                          <div className="pm-strength-fill" style={{ width: strength.width, background: strength.color }} />
                        </div>
                        <span className="pm-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                    {key === 'confirm' && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                      <p className="pm-hint pm-hint-err">Passwords do not match</p>
                    )}
                  </div>
                ))}
                {pwMsg && (
                  <div className={`pm-msg ${pwMsg.type}`}>
                    {pwMsg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {pwMsg.text}
                  </div>
                )}
                <button className="pm-btn pm-btn-sec" onClick={handleChangePassword}
                  disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}>
                  {pwSaving ? <><span className="pm-spinner" /> Updating...</> : <><Lock size={14} /> Change Password</>}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .pm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index: 9998;
          animation: pmFade 0.18s ease;
        }
        .pm-container {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 1.5rem;
        }
        @keyframes pmFade { from { opacity: 0; } to { opacity: 1; } }

        .pm-modal {
          width: 420px; max-width: 100%; max-height: 86vh;
          background: #0f1621;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: pmUp 0.22s cubic-bezier(0.3,1,0.4,1);
          overflow: hidden;
        }
        @keyframes pmUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .pm-header {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 1.25rem 1.25rem 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .pm-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .pm-header-info { flex: 1; min-width: 0; }
        .pm-name { font-size: 0.98rem; font-weight: 600; color: #f1f5f9; margin: 0 0 2px; }
        .pm-email { font-size: 0.78rem; color: #64748b; margin: 0 0 6px; }
        .pm-role-badge {
          display: inline-block; padding: 2px 10px; border-radius: 99px;
          font-size: 0.7rem; font-weight: 600;
          background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);
          color: #06b6d4; text-transform: capitalize;
        }
        .pm-close {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .pm-close:hover { background: rgba(239,68,68,0.1); color: #f87171; }

        /* Tabs */
        .pm-tabs {
          display: flex; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        .pm-tab {
          flex: 1; padding: 0.7rem; background: none; border: none;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          color: #64748b; cursor: pointer; font-size: 0.84rem; font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: color 0.15s, border-color 0.15s;
        }
        .pm-tab:hover { color: #94a3b8; }
        .pm-tab.active { color: #06b6d4; border-bottom-color: #06b6d4; font-weight: 600; }

        /* Body */
        .pm-body {
          flex: 1; overflow-y: auto; padding: 1.1rem 1.25rem;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent;
        }
        .pm-section { display: flex; flex-direction: column; gap: 0.85rem; }
        .pm-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .pm-label {
          font-size: 0.71rem; font-weight: 600; color: #475569;
          text-transform: uppercase; letter-spacing: 0.7px;
        }
        .pm-input {
          width: 100%; padding: 0.65rem 0.9rem; box-sizing: border-box;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; color: #e2e8f0; font-size: 0.88rem; font-family: inherit;
          outline: none; transition: border-color 0.15s;
        }
        .pm-input:focus { border-color: rgba(6,182,212,0.45); }
        .pm-input::placeholder { color: #334155; }

        /* Icon-wrapped editable input */
        .pm-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .pm-input-icon {
          position: absolute; left: 10px; color: #475569; pointer-events: none; flex-shrink: 0;
        }
        .pm-input-iconic { padding-left: 2.1rem; }

        /* Read-only row */
        .pm-input-ro {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.65rem 0.9rem; border-radius: 9px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          color: #475569; font-size: 0.88rem;
        }

        .pm-hint { font-size: 0.73rem; color: #334155; margin: 0; }
        .pm-hint-err { color: #f87171; }

        /* Password */
        .pm-pw-wrap { position: relative; }
        .pm-pw-wrap .pm-input { padding-right: 2.5rem; }
        .pm-pw-eye {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #475569; cursor: pointer; padding: 3px;
          display: flex; transition: color 0.15s;
        }
        .pm-pw-eye:hover { color: #94a3b8; }

        /* Strength bar */
        .pm-strength { display: flex; align-items: center; gap: 0.6rem; margin-top: 3px; }
        .pm-strength-track {
          flex: 1; height: 3px; background: rgba(255,255,255,0.07);
          border-radius: 2px; overflow: hidden;
        }
        .pm-strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease; }
        .pm-strength-label { font-size: 0.68rem; font-weight: 600; min-width: 36px; text-align: right; text-transform: uppercase; letter-spacing: 0.4px; }

        /* Messages */
        .pm-msg {
          display: flex; align-items: center; gap: 7px;
          padding: 0.6rem 0.85rem; border-radius: 8px;
          font-size: 0.82rem; font-weight: 500;
        }
        .pm-msg.success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); color: #34d399; }
        .pm-msg.error   { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.15);  color: #f87171; }

        /* Buttons */
        .pm-btn {
          width: 100%; padding: 0.68rem; border: none; border-radius: 9px;
          background: #0891b2; color: #fff;
          font-size: 0.87rem; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          margin-top: 0.25rem; transition: background 0.15s, opacity 0.15s;
        }
        .pm-btn:hover:not(:disabled) { background: #06b6d4; }
        .pm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pm-btn-sec { background: #2563eb; }
        .pm-btn-sec:hover:not(:disabled) { background: #3b82f6; }

        .pm-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
          border-radius: 50%; animation: pmSpin 0.55s linear infinite;
        }
        @keyframes pmSpin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .pm-modal { width: 100%; max-height: 90vh; border-radius: 14px 14px 0 0; }
          .pm-container { align-items: flex-end; padding: 0; }
        }
      `}</style>
    </>
  );
};

export default ProfileModal;

