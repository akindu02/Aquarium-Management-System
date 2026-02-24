import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Check, X, LogOut, Mail, Shield } from 'lucide-react';
import { getUserData, updateUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { updateProfileAPI, changePasswordAPI, logoutAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ show, onClose, user, setUser, accentColor = '#4ECDC4', accentGradient = 'linear-gradient(135deg, #4ECDC4, #44A08D)', roleEmoji = '👤' }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (show) {
      setProfileName(user?.name || '');
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

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await updateProfileAPI({ name: profileName.trim() });
      if (res.success) {
        updateUserData({ name: profileName.trim() });
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

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await logoutAPI(refreshToken);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
      navigate('/signin');
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

  return (
    <>
      <div className="pm-overlay" />
      <div className="pm-container">
        <div className="pm-modal" ref={modalRef}>
          {/* Header */}
          <div className="pm-header">
            <div className="pm-avatar">{getInitials(user?.name)}</div>
            <div className="pm-header-info">
              <h3 className="pm-name">{user?.name || 'User'}</h3>
              <p className="pm-email">{user?.email}</p>
              <span className="pm-role-badge">{roleEmoji} {user?.role}</span>
            </div>
            <button className="pm-close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="pm-tabs">
            <button className={`pm-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={15} />
              <span>Profile</span>
            </button>
            <button className={`pm-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Lock size={15} />
              <span>Security</span>
            </button>
          </div>

          {/* Body */}
          <div className="pm-body">
            {activeTab === 'profile' && (
              <div className="pm-section">
                <div className="pm-field">
                  <label className="pm-label">Full Name</label>
                  <input
                    className="pm-input"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Email Address</label>
                  <div className="pm-input-disabled">
                    <Mail size={14} className="pm-input-icon" />
                    <span>{user?.email || '—'}</span>
                  </div>
                  <p className="pm-hint">Contact an administrator to change your email</p>
                </div>
                <div className="pm-field">
                  <label className="pm-label">Role</label>
                  <div className="pm-input-disabled">
                    <Shield size={14} className="pm-input-icon" />
                    <span style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                  </div>
                </div>
                {profileMsg && (
                  <div className={`pm-msg ${profileMsg.type}`}>
                    {profileMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
                    {profileMsg.text}
                  </div>
                )}
                <button className="pm-save-btn" onClick={handleSaveProfile} disabled={profileSaving || profileName.trim() === (user?.name || '')}>
                  {profileSaving ? (
                    <><span className="pm-spinner" /> Saving...</>
                  ) : (
                    <><Check size={15} /> Save Changes</>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="pm-section">
                <div className="pm-field">
                  <label className="pm-label">Current Password</label>
                  <div className="pm-pw-wrap">
                    <input
                      className="pm-input"
                      type={showPw.current ? 'text' : 'password'}
                      value={pwForm.current}
                      onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <button className="pm-pw-eye" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                      {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="pm-field">
                  <label className="pm-label">New Password</label>
                  <div className="pm-pw-wrap">
                    <input
                      className="pm-input"
                      type={showPw.newPw ? 'text' : 'password'}
                      value={pwForm.newPw}
                      onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <button className="pm-pw-eye" onClick={() => setShowPw(s => ({ ...s, newPw: !s.newPw }))}>
                      {showPw.newPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {pwForm.newPw && (
                    <div className="pm-strength">
                      <div className="pm-strength-track">
                        <div className="pm-strength-fill" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <span className="pm-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div className="pm-field">
                  <label className="pm-label">Confirm New Password</label>
                  <div className="pm-pw-wrap">
                    <input
                      className="pm-input"
                      type={showPw.confirm ? 'text' : 'password'}
                      value={pwForm.confirm}
                      onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <button className="pm-pw-eye" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                      {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.newPw && pwForm.confirm !== pwForm.newPw && (
                    <p className="pm-hint pm-hint-error">Passwords do not match</p>
                  )}
                </div>

                {pwMsg && (
                  <div className={`pm-msg ${pwMsg.type}`}>
                    {pwMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
                    {pwMsg.text}
                  </div>
                )}
                <button className="pm-save-btn pm-save-security" onClick={handleChangePassword} disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}>
                  {pwSaving ? (
                    <><span className="pm-spinner" /> Changing...</>
                  ) : (
                    <><Lock size={15} /> Change Password</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pm-footer">
            <button className="pm-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              Sign out of account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9998;
          animation: pmFadeIn 0.2s ease;
        }

        .pm-container {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          animation: pmFadeIn 0.2s ease;
        }

        @keyframes pmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pm-modal {
          width: 440px;
          max-width: 100%;
          max-height: 85vh;
          background: linear-gradient(180deg, #111928 0%, #0f1520 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          animation: pmSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        @keyframes pmSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .pm-header {
          padding: 1.5rem 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%);
        }

        .pm-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: ${accentGradient};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.15rem;
          color: white;
          flex-shrink: 0;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .pm-header-info {
          flex: 1;
          min-width: 0;
        }

        .pm-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main, #fff);
          margin: 0;
          line-height: 1.3;
        }

        .pm-email {
          font-size: 0.8rem;
          color: var(--text-muted, #8899a6);
          margin: 2px 0 8px;
        }

        .pm-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          background: ${accentColor}20;
          color: ${accentColor};
          text-transform: capitalize;
          letter-spacing: 0.3px;
        }

        .pm-close {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted, #8899a6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .pm-close:hover {
          background: rgba(255, 107, 107, 0.15);
          border-color: rgba(255, 107, 107, 0.3);
          color: #FF6B6B;
        }

        /* ── Tabs ── */
        .pm-tabs {
          display: flex;
          padding: 0 1.5rem;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .pm-tab {
          flex: 1;
          padding: 0.85rem 0.75rem;
          background: none;
          border: none;
          border-bottom: 2.5px solid transparent;
          color: var(--text-muted, #8899a6);
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .pm-tab:hover {
          color: var(--text-main, #fff);
          background: rgba(255, 255, 255, 0.02);
        }

        .pm-tab.active {
          color: ${accentColor};
          border-bottom-color: ${accentColor};
          font-weight: 600;
        }

        /* ── Body ── */
        .pm-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .pm-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .pm-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted, #8899a6);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .pm-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-main, #fff);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }

        .pm-input:focus {
          border-color: ${accentColor};
          background: rgba(255, 255, 255, 0.06);
        }

        .pm-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .pm-input-disabled {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          color: var(--text-muted, #8899a6);
          font-size: 0.92rem;
        }

        .pm-input-icon {
          opacity: 0.5;
          flex-shrink: 0;
        }

        .pm-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
          margin: 0;
        }

        .pm-hint-error {
          color: #FF6B6B;
        }

        /* ── Password ── */
        .pm-pw-wrap {
          position: relative;
        }

        .pm-pw-wrap .pm-input {
          padding-right: 2.75rem;
        }

        .pm-pw-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted, #8899a6);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.15s;
        }

        .pm-pw-eye:hover {
          color: ${accentColor};
        }

        .pm-strength {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2px;
        }

        .pm-strength-track {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }

        .pm-strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .pm-strength-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          min-width: 42px;
          text-align: right;
        }

        /* ── Messages ── */
        .pm-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          animation: pmFadeIn 0.2s ease;
        }

        .pm-msg.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .pm-msg.error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.2);
          color: #FF6B6B;
        }

        /* ── Buttons ── */
        .pm-save-btn {
          width: 100%;
          padding: 0.8rem 1.25rem;
          background: ${accentGradient};
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 0.5rem;
          transition: all 0.2s;
        }

        .pm-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px ${accentColor}40;
        }

        .pm-save-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .pm-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pm-save-security {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .pm-save-security:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
        }

        .pm-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: pmSpin 0.6s linear infinite;
        }

        @keyframes pmSpin {
          to { transform: rotate(360deg); }
        }

        /* ── Footer ── */
        .pm-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .pm-logout-btn {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 107, 107, 0.08);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 12px;
          color: #FF6B6B;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .pm-logout-btn:hover {
          background: rgba(255, 107, 107, 0.15);
          border-color: rgba(255, 107, 107, 0.35);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .pm-modal {
            width: 100%;
            max-height: 90vh;
            border-radius: 16px;
          }
          .pm-header { padding: 1.25rem; }
          .pm-body { padding: 1.25rem; }
          .pm-avatar { width: 48px; height: 48px; font-size: 1rem; }
        }
      `}</style>
    </>
  );
};

export default ProfileModal;
