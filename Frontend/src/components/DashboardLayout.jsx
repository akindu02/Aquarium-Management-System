import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken, updateUserData } from '../utils/auth';
import { logoutAPI, updateProfileAPI, changePasswordAPI } from '../utils/api';
import { User, Lock, LogOut, ChevronRight, Eye, EyeOff, Check, X, Menu, Settings } from 'lucide-react';
import '../index.css';

/**
 * DashboardLayout - Shared layout for all role-based dashboards
 * @param {Object} props
 * @param {React.Component} props.children - Dashboard content
 * @param {string} props.role - User role (customer, staff, supplier, admin)
 */
const DashboardLayout = ({ children, role }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(getUserData());

    // ── Profile panel state ───────────────────────────────────
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    // Password form
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    const panelRef = useRef(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowProfilePanel(false);
            }
        };
        if (showProfilePanel) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showProfilePanel]);

    // Open profile panel
    const openProfile = () => {
        setProfileName(user?.name || '');
        setProfileMsg(null);
        setPwForm({ current: '', next: '', confirm: '' });
        setShowPw({ current: false, next: false, confirm: false });
        setPwMsg(null);
        setActiveTab('profile');
        setShowProfilePanel(true);
    };

    // Save profile name
    const handleSaveProfile = async () => {
        const trimmed = profileName.trim();
        if (!trimmed) { setProfileMsg({ type: 'error', text: 'Name cannot be empty' }); return; }
        setProfileSaving(true);
        try {
            const res = await updateProfileAPI({ name: trimmed });
            if (res.success) {
                updateUserData({ name: res.user.name });
                setUser(prev => ({ ...prev, name: res.user.name }));
                setProfileMsg({ type: 'success', text: 'Profile updated!' });
            } else {
                setProfileMsg({ type: 'error', text: res.message || 'Update failed' });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Something went wrong' });
        } finally {
            setProfileSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!pwForm.current) { setPwMsg({ type: 'error', text: 'Enter current password' }); return; }
        if (pwForm.next.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' }); return; }
        if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return; }
        setPwSaving(true);
        try {
            const res = await changePasswordAPI(pwForm.current, pwForm.next);
            if (res.success) {
                setPwMsg({ type: 'success', text: 'Password changed successfully!' });
                setPwForm({ current: '', next: '', confirm: '' });
                setShowPw({ current: false, next: false, confirm: false });
            } else {
                setPwMsg({ type: 'error', text: res.message || 'Failed to change password' });
            }
        } catch (err) {
            setPwMsg({ type: 'error', text: err.message || 'Something went wrong' });
        } finally {
            setPwSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                await logoutAPI(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthData();
            navigate('/signin');
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    const roleConfig = {
        admin: {
            title: 'Admin Dashboard',
            color: '#FF6B6B',
            icon: '👑',
        },
        staff: {
            title: 'Staff Dashboard',
            color: '#4ECDC4',
            icon: '👨‍💼',
        },
        supplier: {
            title: 'Supplier Dashboard',
            color: '#95E1D3',
            icon: '📦',
        },
        customer: {
            title: 'Customer Dashboard',
            color: '#F38181',
            icon: '👤',
        },
    };

    const config = roleConfig[role] || roleConfig.customer;

    const roleBadgeColor = {
        admin:    { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: 'rgba(255,107,107,0.3)' },
        staff:    { bg: 'rgba(78,205,196,0.15)',  color: '#4ecdc4', border: 'rgba(78,205,196,0.3)' },
        supplier: { bg: 'rgba(149,225,211,0.15)', color: '#95e1d3', border: 'rgba(149,225,211,0.3)' },
        customer: { bg: 'rgba(243,129,129,0.15)', color: '#f38181', border: 'rgba(243,129,129,0.3)' },
    }[role] || { bg: 'rgba(78,205,196,0.15)', color: '#4ecdc4', border: 'rgba(78,205,196,0.3)' };

    return (
        <div className="dashboard-layout">
            {/* ── Sidebar ── */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-section">
                        <span className="role-icon">{config.icon}</span>
                        <h2 className="sidebar-title">{isSidebarOpen && config.title}</h2>
                    </div>
                </div>

                {/* Clickable user card → opens profile panel */}
                <div
                    className={`sidebar-user ${isSidebarOpen ? 'sidebar-user--expanded' : ''}`}
                    onClick={openProfile}
                    title="Edit profile"
                >
                    <div className="user-avatar" style={{ '--role-color': config.color }}>
                        {getInitials(user?.name)}
                    </div>
                    {isSidebarOpen && (
                        <div className="user-info">
                            <p className="user-name">{user?.name || 'User'}</p>
                            <span className="user-role-badge" style={{ background: roleBadgeColor.bg, color: roleBadgeColor.color, border: `1px solid ${roleBadgeColor.border}` }}>
                                {role}
                            </span>
                        </div>
                    )}
                    {isSidebarOpen && <ChevronRight size={15} className="sidebar-user-arrow" />}
                </div>

                <nav className="sidebar-nav">
                    {isSidebarOpen && <p className="nav-section-title">MAIN MENU</p>}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={18} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
                        <Menu size={22} />
                    </button>
                    <div className="header-right">
                        <div className="header-greeting">
                            Welcome back, <strong>{user?.name?.split(' ')[0] || 'User'}</strong>
                        </div>
                        <button className="header-avatar-btn" onClick={openProfile} title="Profile settings">
                            <div className="header-avatar" style={{ '--role-color': config.color }}>
                                {getInitials(user?.name)}
                            </div>
                            <div className="header-avatar-info">
                                <span className="header-avatar-name">{user?.name || 'User'}</span>
                                <span className="header-avatar-role">{role}</span>
                            </div>
                            <Settings size={14} className="header-settings-icon" />
                        </button>
                    </div>
                </header>
                <div className="dashboard-content">{children}</div>
            </main>

            {/* ══ PROFILE SETTINGS PANEL ══ */}
            {showProfilePanel && (
                <div className="profile-overlay">
                    <div className="profile-panel" ref={panelRef}>
                        {/* Panel Header */}
                        <div className="pp-header">
                            <div className="pp-header-left">
                                <div className="pp-avatar" style={{ '--role-color': config.color }}>
                                    {getInitials(user?.name)}
                                </div>
                                <div>
                                    <div className="pp-username">{user?.name || 'User'}</div>
                                    <div className="pp-email">{user?.email || ''}</div>
                                    <span className="pp-role-badge" style={{ background: roleBadgeColor.bg, color: roleBadgeColor.color, border: `1px solid ${roleBadgeColor.border}` }}>
                                        {config.icon} {role}
                                    </span>
                                </div>
                            </div>
                            <button className="pp-close" onClick={() => setShowProfilePanel(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="pp-tabs">
                            <button
                                className={`pp-tab ${activeTab === 'profile' ? 'pp-tab--active' : ''}`}
                                onClick={() => { setActiveTab('profile'); setProfileMsg(null); }}
                            >
                                <User size={15} /> Profile
                            </button>
                            <button
                                className={`pp-tab ${activeTab === 'security' ? 'pp-tab--active' : ''}`}
                                onClick={() => { setActiveTab('security'); setPwMsg(null); }}
                            >
                                <Lock size={15} /> Security
                            </button>
                        </div>

                        {/* ── Profile Tab ── */}
                        {activeTab === 'profile' && (
                            <div className="pp-body">
                                <div className="pp-section-title">Personal Information</div>
                                <div className="pp-field">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={e => { setProfileName(e.target.value); setProfileMsg(null); }}
                                        placeholder="Your full name"
                                        className="pp-input"
                                        maxLength={200}
                                        autoFocus
                                    />
                                </div>
                                <div className="pp-field">
                                    <label>Email Address</label>
                                    <input type="email" value={user?.email || ''} disabled className="pp-input pp-input--disabled" />
                                    <span className="pp-hint">Contact an admin to change your email.</span>
                                </div>
                                <div className="pp-field">
                                    <label>Account Role</label>
                                    <div className="pp-role-display" style={{ background: roleBadgeColor.bg, color: roleBadgeColor.color, borderColor: roleBadgeColor.border }}>
                                        {config.icon} <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{role}</span>
                                    </div>
                                </div>
                                {profileMsg && (
                                    <div className={`pp-msg pp-msg--${profileMsg.type}`}>
                                        {profileMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
                                        {profileMsg.text}
                                    </div>
                                )}
                                <button
                                    className="pp-save-btn"
                                    onClick={handleSaveProfile}
                                    disabled={profileSaving || profileName.trim() === (user?.name || '')}
                                >
                                    {profileSaving ? <span className="pp-spinner" /> : <Check size={15} />}
                                    {profileSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}

                        {/* ── Security Tab ── */}
                        {activeTab === 'security' && (
                            <div className="pp-body">
                                <div className="pp-section-title">Change Password</div>
                                {[
                                    { key: 'current', label: 'Current Password' },
                                    { key: 'next',    label: 'New Password' },
                                    { key: 'confirm', label: 'Confirm New Password' },
                                ].map(({ key, label }) => (
                                    <div className="pp-field" key={key}>
                                        <label>{label}</label>
                                        <div className="pp-pw-wrap">
                                            <input
                                                type={showPw[key] ? 'text' : 'password'}
                                                value={pwForm[key]}
                                                onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwMsg(null); }}
                                                placeholder={label}
                                                className="pp-input"
                                            />
                                            <button className="pp-pw-eye" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))} type="button">
                                                {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pwForm.next && (
                                    <div className="pp-strength">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="pp-strength-bar" style={{
                                                background: pwForm.next.length >= i * 3
                                                    ? (pwForm.next.length >= 12 ? '#4ade80' : pwForm.next.length >= 8 ? '#fb923c' : '#f87171')
                                                    : 'rgba(255,255,255,0.1)'
                                            }} />
                                        ))}
                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                                            {pwForm.next.length < 8 ? 'Weak' : pwForm.next.length < 12 ? 'Fair' : 'Strong'}
                                        </span>
                                    </div>
                                )}
                                {pwMsg && (
                                    <div className={`pp-msg pp-msg--${pwMsg.type}`}>
                                        {pwMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
                                        {pwMsg.text}
                                    </div>
                                )}
                                <button
                                    className="pp-save-btn pp-save-btn--security"
                                    onClick={handleChangePassword}
                                    disabled={pwSaving}
                                >
                                    {pwSaving ? <span className="pp-spinner" /> : <Lock size={15} />}
                                    {pwSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        )}

                        {/* Panel Footer */}
                        <div className="pp-footer">
                            <button className="pp-logout-btn" onClick={handleLogout}>
                                <LogOut size={15} /> Sign out of account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .dashboard-layout { display:flex; min-height:100vh; background:var(--color-bg); }

        /* ── SIDEBAR ── */
        .dashboard-sidebar {
          width:280px; background:rgba(255,255,255,0.03); backdrop-filter:blur(10px);
          border-right:1px solid rgba(255,255,255,0.08); transition:width 0.3s ease;
          display:flex; flex-direction:column; position:fixed; height:100vh; z-index:100; overflow:hidden;
        }
        .dashboard-sidebar.closed { width:80px; }
        .sidebar-header { padding:1.75rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
        .logo-section { display:flex; align-items:center; gap:1rem; }
        .role-icon { font-size:1.75rem; flex-shrink:0; }
        .sidebar-title { font-size:1.1rem; font-weight:700; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .sidebar-user {
          padding:0.9rem 1rem; border-bottom:1px solid rgba(255,255,255,0.07);
          display:flex; align-items:center; gap:0.85rem; cursor:pointer; flex-shrink:0;
          transition:background 0.2s; position:relative; min-height:64px;
        }
        .sidebar-user:hover { background:rgba(255,255,255,0.05); }
        .sidebar-user--expanded { padding-right:2.5rem; }
        .sidebar-user-arrow {
          position:absolute; right:0.9rem; top:50%; transform:translateY(-50%);
          color:var(--text-muted); opacity:0; transition:opacity 0.2s;
        }
        .sidebar-user:hover .sidebar-user-arrow { opacity:1; }

        .user-avatar {
          width:40px; height:40px; border-radius:50%;
          background:linear-gradient(135deg, var(--role-color, var(--color-primary)), rgba(255,255,255,0.08));
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:0.9rem; color:#fff; flex-shrink:0;
          border:2px solid rgba(255,255,255,0.13); letter-spacing:0.5px;
          box-shadow:0 0 0 3px rgba(255,255,255,0.03);
        }
        .user-info { overflow:hidden; min-width:0; }
        .user-name { font-weight:600; font-size:0.9rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0 0 0.3rem; }
        .user-role-badge { display:inline-block; padding:0.15rem 0.55rem; border-radius:50px; font-size:0.68rem; font-weight:700; text-transform:capitalize; letter-spacing:0.04em; }

        .sidebar-nav { flex:1; padding:1.5rem 0; overflow-y:auto; }
        .nav-section-title { padding:0 1.5rem; font-size:0.68rem; font-weight:700; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:1rem; }

        .sidebar-footer { padding:1rem; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
        .logout-btn {
          width:100%; padding:0.7rem 1rem; background:rgba(255,107,107,0.08);
          border:1px solid rgba(255,107,107,0.2); border-radius:10px; color:#ff6b6b;
          font-weight:600; cursor:pointer; transition:all 0.2s;
          display:flex; align-items:center; gap:0.75rem; justify-content:center; font-size:0.88rem;
        }
        .logout-btn:hover { background:rgba(255,107,107,0.18); transform:translateY(-1px); }

        /* ── HEADER ── */
        .dashboard-main { flex:1; margin-left:280px; transition:margin-left 0.3s ease; display:flex; flex-direction:column; }
        .dashboard-sidebar.closed + .dashboard-main { margin-left:80px; }
        .dashboard-header {
          background:rgba(255,255,255,0.02); backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,0.07); padding:0.8rem 2rem;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:50;
        }
        .sidebar-toggle {
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; color:var(--text-main); cursor:pointer; padding:0.45rem;
          display:flex; align-items:center; justify-content:center; transition:all 0.2s;
        }
        .sidebar-toggle:hover { background:rgba(255,255,255,0.1); }
        .header-right { display:flex; align-items:center; gap:1rem; }
        .header-greeting { color:var(--text-muted); font-size:0.88rem; }
        .header-greeting strong { color:var(--text-main); }

        .header-avatar-btn {
          display:flex; align-items:center; gap:0.6rem;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
          border-radius:50px; padding:0.3rem 0.8rem 0.3rem 0.3rem;
          cursor:pointer; transition:all 0.2s; text-align:left;
        }
        .header-avatar-btn:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.18); transform:translateY(-1px); }
        .header-avatar {
          width:30px; height:30px; border-radius:50%;
          background:linear-gradient(135deg, var(--role-color, var(--color-primary)), rgba(255,255,255,0.1));
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:0.7rem; color:#fff; flex-shrink:0;
          border:1.5px solid rgba(255,255,255,0.15); letter-spacing:0.5px;
        }
        .header-avatar-info { display:flex; flex-direction:column; gap:1px; }
        .header-avatar-name { font-size:0.8rem; font-weight:600; color:var(--text-main); line-height:1; }
        .header-avatar-role { font-size:0.68rem; color:var(--text-muted); text-transform:capitalize; line-height:1; }
        .header-settings-icon { color:var(--text-muted); }
        .dashboard-content { flex:1; padding:2rem; overflow-y:auto; }

        /* ── PROFILE PANEL ── */
        .profile-overlay {
          position:fixed; inset:0; z-index:300;
          background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);
          animation:pp-fadein 0.18s ease;
        }
        @keyframes pp-fadein { from{opacity:0} to{opacity:1} }
        @keyframes pp-slidein {
          from{transform:translateX(100%);opacity:0}
          to{transform:translateX(0);opacity:1}
        }
        .profile-panel {
          position:absolute; top:0; right:0; width:380px; max-width:100%; height:100%;
          background:#0f1520; border-left:1px solid rgba(255,255,255,0.08);
          display:flex; flex-direction:column; overflow-y:auto;
          animation:pp-slidein 0.28s cubic-bezier(0.34,1.1,0.64,1);
          box-shadow:-24px 0 60px rgba(0,0,0,0.55);
        }

        .pp-header {
          display:flex; align-items:flex-start; justify-content:space-between;
          padding:1.75rem 1.5rem 1.5rem;
          background:linear-gradient(135deg,#0b1121 0%,#162035 100%);
          border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0;
        }
        .pp-header-left { display:flex; align-items:flex-start; gap:1rem; }
        .pp-avatar {
          width:54px; height:54px; border-radius:50%;
          background:linear-gradient(135deg,var(--role-color,var(--color-primary)),rgba(255,255,255,0.08));
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:1.15rem; color:#fff; flex-shrink:0;
          border:2.5px solid rgba(255,255,255,0.15);
          box-shadow:0 0 0 5px rgba(255,255,255,0.04);
          letter-spacing:0.5px;
        }
        .pp-username { font-size:0.98rem; font-weight:700; color:#fff; line-height:1.3; margin-bottom:0.2rem; }
        .pp-email { font-size:0.76rem; color:rgba(255,255,255,0.4); margin-bottom:0.5rem; }
        .pp-role-badge { display:inline-block; padding:0.18rem 0.7rem; border-radius:50px; font-size:0.68rem; font-weight:700; text-transform:capitalize; letter-spacing:0.04em; }
        .pp-close {
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.09);
          color:rgba(255,255,255,0.45); width:28px; height:28px; border-radius:50%;
          cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .pp-close:hover { background:rgba(239,68,68,0.2); color:#f87171; border-color:rgba(239,68,68,0.3); }

        .pp-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
        .pp-tab {
          flex:1; padding:0.85rem; background:transparent; border:none;
          color:var(--text-muted); font-size:0.83rem; font-weight:600;
          cursor:pointer; transition:all 0.2s;
          display:flex; align-items:center; justify-content:center; gap:6px;
          border-bottom:2px solid transparent;
        }
        .pp-tab:hover { color:var(--text-main); background:rgba(255,255,255,0.02); }
        .pp-tab--active { color:var(--color-primary); border-bottom-color:var(--color-primary); background:rgba(78,205,196,0.04); }

        .pp-body { padding:1.5rem; display:flex; flex-direction:column; gap:1.1rem; flex:1; }
        .pp-section-title { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text-muted); }

        .pp-field { display:flex; flex-direction:column; gap:0.4rem; }
        .pp-field label { font-size:0.8rem; font-weight:600; color:var(--text-muted); }
        .pp-input {
          padding:0.65rem 0.9rem; background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.09); border-radius:9px;
          color:var(--text-main); font-size:0.88rem; outline:none;
          transition:border-color 0.2s, background 0.2s; font-family:inherit;
          width:100%; box-sizing:border-box;
        }
        .pp-input:focus { border-color:var(--color-primary); background:rgba(78,205,196,0.04); }
        .pp-input--disabled { opacity:0.4; cursor:not-allowed; }
        .pp-hint { font-size:0.7rem; color:var(--text-muted); }
        .pp-role-display { padding:0.55rem 1rem; border-radius:9px; border:1px solid; font-size:0.88rem; display:flex; align-items:center; gap:0.5rem; }

        .pp-pw-wrap { position:relative; }
        .pp-pw-wrap .pp-input { padding-right:2.5rem; }
        .pp-pw-eye {
          position:absolute; right:0.75rem; top:50%; transform:translateY(-50%);
          background:transparent; border:none; color:var(--text-muted);
          cursor:pointer; display:flex; align-items:center; padding:0; transition:color 0.15s;
        }
        .pp-pw-eye:hover { color:var(--text-main); }

        .pp-strength { display:flex; align-items:center; gap:5px; margin-top:-0.2rem; }
        .pp-strength-bar { height:4px; flex:1; border-radius:4px; transition:background 0.3s; }

        .pp-msg { display:flex; align-items:center; gap:6px; padding:0.6rem 0.9rem; border-radius:9px; font-size:0.82rem; font-weight:600; }
        .pp-msg--success { background:rgba(74,222,128,0.1); color:#4ade80; border:1px solid rgba(74,222,128,0.2); }
        .pp-msg--error   { background:rgba(248,113,113,0.1); color:#f87171; border:1px solid rgba(248,113,113,0.2); }

        .pp-save-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          padding:0.8rem; border:none; border-radius:10px;
          background:linear-gradient(135deg,var(--color-primary),#38a89d);
          color:#000; font-weight:700; font-size:0.88rem; cursor:pointer;
          transition:all 0.2s; margin-top:0.25rem;
          box-shadow:0 4px 15px rgba(78,205,196,0.18);
        }
        .pp-save-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(78,205,196,0.28); }
        .pp-save-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
        .pp-save-btn--security { background:linear-gradient(135deg,#7c3aed,#5b21b6); color:#fff; box-shadow:0 4px 15px rgba(124,58,237,0.18); }
        .pp-save-btn--security:hover { box-shadow:0 6px 20px rgba(124,58,237,0.28); }

        .pp-spinner {
          width:13px; height:13px; border:2px solid rgba(0,0,0,0.2);
          border-top-color:#000; border-radius:50%;
          animation:pp-spin 0.7s linear infinite; display:inline-block;
        }
        @keyframes pp-spin { to{transform:rotate(360deg)} }

        .pp-footer { padding:1.1rem 1.5rem; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
        .pp-logout-btn {
          display:flex; align-items:center; gap:8px; width:100%; padding:0.7rem;
          background:rgba(255,107,107,0.07); border:1px solid rgba(255,107,107,0.18);
          border-radius:10px; color:#ff6b6b; font-weight:600; font-size:0.85rem;
          cursor:pointer; transition:all 0.2s; justify-content:center;
        }
        .pp-logout-btn:hover { background:rgba(255,107,107,0.16); transform:translateY(-1px); }

        @media (max-width:768px) {
          .dashboard-sidebar { transform:translateX(-100%); }
          .dashboard-sidebar.open { transform:translateX(0); }
          .dashboard-main { margin-left:0 !important; }
          .header-greeting { display:none; }
          .profile-panel { width:100%; }
        }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
