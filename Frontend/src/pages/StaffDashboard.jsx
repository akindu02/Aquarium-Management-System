import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Package, Bell, LogOut, CheckCircle2, AlertTriangle, CalendarClock, Store, Banknote, ChevronRight, RefreshCcw, Globe } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI, getStaffDashboardStatsAPI } from '../utils/api';
import ProfileModal from '../components/ProfileModal';
import BookingManagement from './admin/BookingManagement';
import InventoryManagement from './admin/InventoryManagement';
import PointOfSale from './staff/PointOfSale';
import StaffOrderManagement from './staff/StaffOrderManagement';
import ProductRestock from './staff/ProductRestock';
import '../index.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(getUserData());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [stats, setStats] = useState({
    totalDailySales: 0,
    todayTransactionsCount: 0,
    pendingOrdersCount: 0,
    todayBookingsCount: 0,
    lowStockCount: 0,
    onlineSalesRevenue: 0,
    onlineOrdersCount: 0,
    pendingRestocksCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getStaffDashboardStatsAPI();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchStats();
    }
  }, [activeMenu]);

  const getInitials = (name) => { if (!name) return '?'; const p = name.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : p[0][0].toUpperCase(); };

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale', icon: Store },
    { id: 'products', label: 'Products / Inventory', icon: Package },
    { id: 'orders', label: 'Process Orders', icon: ClipboardList },
    { id: 'restock', label: 'Product Restock', icon: AlertTriangle },
    { id: 'bookings', label: 'Service Bookings', icon: CalendarClock },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent onNavigate={setActiveMenu} stats={stats} loading={loadingStats} onRefresh={fetchStats} />;
      case 'pos':
        return <PointOfSale />;
      case 'products':
        return <InventoryManagement />;
      case 'orders':
        return <StaffOrderManagement />;
      case 'restock':
        return <ProductRestock />;
      case 'bookings':
        return <BookingManagement />;
      default:
        return <DashboardContent onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="staff-layout">
      {/* Sidebar */}
      <aside className={`staff-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo / System Name */}
        <div className="sidebar-logo">
          <span className="logo">Methu<span className="text-primary">Aquarium</span></span>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-nav">
          {!isSidebarCollapsed && <p className="nav-section-title">MAIN MENU</p>}
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                    onClick={() => setActiveMenu(item.id)}
                    title={item.label}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="staff-main">
        {/* Top Header with User Profile */}
        <header className="staff-header">
          <div className="header-left"></div>
          <div className="header-right">
            <button className="notification-btn" title="Notifications">
              <Bell size={18} className="notification-icon" />
              <span className="notification-badge">7</span>
            </button>
            <div className="header-divider" />
            <div className="header-profile" onClick={() => setShowProfileModal(true)} title="Profile settings">
              <div className="header-avatar">
                {getInitials(user?.name)}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.name || 'Staff'}</p>
                
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="staff-content">
          {renderContent()}
        </div>
      </main>

      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        setUser={setUser}
        accentColor="#4ECDC4"
        accentGradient="linear-gradient(135deg, #4ECDC4, #44A08D)"
        roleEmoji="👨‍💼"
      />

      <style>{`
                .staff-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg);
                }

                /* ===== SIDEBAR ===== */
                .staff-sidebar {
                    width: 280px;
                    background: linear-gradient(180deg, rgba(20, 30, 48, 0.98) 0%, rgba(17, 25, 40, 0.98) 100%);
                    backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                    transition: width 0.3s ease;
                }

                .staff-sidebar.collapsed {
                    width: 80px;
                }

                /* Logo Section */
                .sidebar-logo {
                    height: 72px;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    flex-shrink: 0;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .text-primary {
                    color: var(--color-primary);
                }

                /* Navigation */
                .sidebar-nav {
                    flex: 1;
                    padding: 2rem 0 1rem 0;
                    overflow-y: auto;
                }

                .nav-section-title {
                    padding: 0 1.5rem;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.35);
                    letter-spacing: 2px;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                }

                .nav-menu {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .nav-item {
                    width: 100%;
                    padding: 0.875rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-main);
                }

                .nav-item.active {
                    background: linear-gradient(90deg, rgba(78, 205, 196, 0.15) 0%, transparent 100%);
                    color: var(--color-primary);
                    border-left: 3px solid var(--color-primary);
                }

                .nav-label {
                    font-weight: 500;
                }

                /* Sidebar Footer */
                .sidebar-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .logout-btn {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    justify-content: center;
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    border-radius: 10px;
                    color: #FF6B6B;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .logout-btn:hover {
                    background: rgba(255, 107, 107, 0.2);
                    transform: translateY(-2px);
                }

                /* ===== MAIN CONTENT ===== */
                .staff-main {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s ease;
                    width: calc(100% - 280px);
                    max-width: calc(100% - 280px);
                }

                .staff-sidebar.collapsed + .staff-main {
                    margin-left: 80px;
                    width: calc(100% - 80px);
                    max-width: calc(100% - 80px);
                }

                /* Header */
                .staff-header {
                    background: rgba(17, 25, 40, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    height: 72px;
                    padding: 0 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    flex-shrink: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                /* Notification Button */
                .notification-btn {
                    position: relative;
                    background: none;
                    border: none;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-muted);
                    border-radius: 8px;
                    transition: color 0.15s;
                }

                .notification-btn:hover {
                    color: var(--text-main);
                }

                .notification-icon {
                    color: inherit;
                }

                .notification-badge {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    min-width: 16px;
                    height: 16px;
                    padding: 0 4px;
                    border-radius: 8px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.62rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                }

                .header-divider {
                    width: 1px;
                    height: 28px;
                    background: rgba(255, 255, 255, 0.08);
                }

                /* Header Profile */
                .header-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding: 4px 6px;
                    background: none;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .header-profile:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .header-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: white;
                }

                .header-user-info {
                    text-align: left;
                }

                .header-user-name {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    line-height: 1.2;
                }

                .header-user-role {
                    font-size: 0.75rem;
                    color: var(--color-primary);
                    font-weight: 500;
                }

                /* Content Area */
                .staff-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100%;
                }

                /* ===== DASHBOARD CONTENT STYLES ===== */
                .dashboard-welcome {
                    margin-bottom: 2rem;
                }

                .dashboard-heading {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .dashboard-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                .loading-opacity {
                    opacity: 0.6;
                    pointer-events: none;
                    filter: blur(1px);
                }

                .refresh-btn:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }

                .refresh-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    margin-top: 1rem;
                    transition: all 0.3s ease;
                }

                .primary-card {
                    grid-column: span 2;
                    min-height: 140px;
                }

                .action-card {
                    grid-column: span 1;
                    min-height: 110px;
                }

                .dashboard-card {
                    padding: 0.85rem;
                    border-radius: 12px;
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .dashboard-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.02) 100%);
                    pointer-events: none;
                }

                .dashboard-card:hover {
                    transform: translateY(-4px);
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(78, 205, 196, 0.3);
                    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.4);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                }

                .card-icon-new {
                  width: 18px;
                  height: 18px;
                }

                .dashboard-card:hover .icon-wrapper {
                    transform: scale(1.1) rotate(-5deg);
                }

                .online-bg { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .store-bg { background: rgba(78, 205, 196, 0.15); color: var(--color-primary); }
                .pending-bg { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .booking-bg { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .alert-bg { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .restock-bg { background: rgba(20, 184, 166, 0.15); color: #14b8a6; }

                .card-body { position: relative; z-index: 1; }

                .context-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 0.15rem;
                    display: block;
                }

                .dashboard-card h3 {
                    font-size: 1rem;
                    color: var(--text-main);
                    margin-bottom: 0.1rem;
                    letter-spacing: -0.01em;
                }

                .dashboard-card p {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .description-small {
                    font-size: 0.7rem !important;
                    margin-bottom: 0 !important;
                }

                .stat-row {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                }

                .stat-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1;
                    display: block;
                }

                .stat-subtext {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }

                .stat-minimal {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.2rem;
                }

                .stat-value-large {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1;
                }

                .badge {
                    padding: 0.2rem 0.4rem;
                    border-radius: 6px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .online-badge { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
                .store-badge { background: rgba(78, 205, 196, 0.1); color: var(--color-primary); border: 1px solid rgba(78, 205, 196, 0.2); }
                .pending-badge { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
                .booking-badge { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
                .alert-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                .restock-badge { background: rgba(20, 184, 166, 0.1); color: #14b8a6; border: 1px solid rgba(20, 184, 166, 0.2); }

                .card-arrow { color: var(--text-muted); opacity: 0; transition: all 0.2s; }
                .dashboard-card:hover .card-arrow { opacity: 1; color: var(--color-primary); }

                /* Mobile overrides for designer grid */
                @media (max-width: 1200px) {
                    .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
                    .primary-card { grid-column: span 2; }
                    .action-card { grid-column: span 1; }
                }

                @media (max-width: 640px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .primary-card, .action-card { grid-column: span 1; }
                }
                    display: flex;
                    flex-direction: column;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-primary);
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Placeholder Content Styles */
                .placeholder-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    text-align: center;
                }

                .placeholder-title {
                    font-size: 2rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 0.75rem;
                }

                .placeholder-description {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    max-width: 400px;
                }

                .placeholder-note {
                    margin-top: 2rem;
                    padding: 1rem 2rem;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid rgba(78, 205, 196, 0.3);
                    border-radius: 10px;
                    color: var(--color-primary);
                    font-size: 0.9rem;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .staff-sidebar {
                        transform: translateX(-100%);
                    }

                    .staff-sidebar.collapsed {
                        transform: translateX(-100%);
                    }

                    .staff-main {
                        margin-left: 0;
                        width: 100%;
                        max-width: 100%;
                    }

                    .dashboard-heading {
                        font-size: 1.75rem;
                    }

                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
        .nav-icon { width: 20px; height: 20px; flex-shrink: 0; }
        .notification-icon { width: 18px; height: 18px; }
        .logout-icon { width: 18px; height: 18px; }
        .card-icon { width: 42px; height: 42px; margin-bottom: 1rem; opacity: 0.9; }
      `}</style>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ onNavigate, stats, loading, onRefresh }) => (
  <>
    <div className="dashboard-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <h1 className="dashboard-heading">Staff Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of today's store activities and tasks.
        </p>
      </div>
      <button 
        className="refresh-btn" 
        onClick={onRefresh} 
        disabled={loading}
        title="Sync with real data"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          marginTop: '-1rem'
        }}
      >
        <RefreshCcw size={16} className={loading ? 'spin' : ''} />
        {loading ? 'Syncing...' : 'Sync Data'}
      </button>
    </div>

    <div className={`dashboard-grid ${loading ? 'loading-opacity' : ''}`}>
      {/* Primary Row: High-Level Sales Overview */}
      <div className="dashboard-card primary-card online-card" onClick={() => onNavigate('orders')}>
        <div className="card-top">
          <div className="icon-wrapper online-bg">
            <Globe size={24} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Operational Performance</span>
          <h3>Total Online Sales</h3>
          <p>Historical revenue from all customer orders</p>
          <div className="stat-row">
            <div className="stat-group">
              <span className="stat-value">
                LKR {stats.onlineSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="stat-subtext">Total Revenue</span>
            </div>
            <div className="badge online-badge">{stats.onlineOrdersCount} Lifetime Orders</div>
          </div>
        </div>
      </div>

      <div className="dashboard-card primary-card store-card" onClick={() => onNavigate('pos')}>
        <div className="card-top">
          <div className="icon-wrapper store-bg">
            <Store size={24} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Daily Activities</span>
          <h3>POS Sales Today</h3>
          <p>Revenue generated today via walk-ins</p>
          <div className="stat-row">
            <div className="stat-group">
              <span className="stat-value">
                LKR {stats.totalDailySales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="stat-subtext">Today's Earnings</span>
            </div>
            <div className="badge store-badge">{stats.todayTransactionsCount} Transactions</div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Action Items */}
      <div className="dashboard-card action-card pending-card" onClick={() => onNavigate('orders')}>
        <div className="card-top">
          <div className="icon-wrapper pending-bg">
            <ClipboardList size={20} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Logistics</span>
          <h3>Active Shipments</h3>
          <div className="stat-minimal">
            <span className="stat-value-large">{stats.pendingOrdersCount}</span>
            <div className="badge pending-badge">Action Required</div>
          </div>
          <p className="description-small">Pending customer & supplier orders</p>
        </div>
      </div>

      <div className="dashboard-card action-card booking-card" onClick={() => onNavigate('bookings')}>
        <div className="card-top">
          <div className="icon-wrapper booking-bg">
            <CalendarClock size={20} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Maintenance</span>
          <h3>Service Bookings</h3>
          <div className="stat-minimal">
            <span className="stat-value-large">{stats.todayBookingsCount}</span>
            <div className="badge booking-badge">Today</div>
          </div>
          <p className="description-small">Upcoming maintenance & services</p>
        </div>
      </div>

      <div className="dashboard-card action-card alert-card" onClick={() => onNavigate('products')}>
        <div className="card-top">
          <div className="icon-wrapper alert-bg">
            <AlertTriangle size={20} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Inventory</span>
          <h3>Low Stock Items</h3>
          <div className="stat-minimal">
            <span className="stat-value-large">{stats.lowStockCount}</span>
            <div className="badge alert-badge">Restock Needed</div>
          </div>
          <p className="description-small">Products below safety threshold</p>
        </div>
      </div>

      <div className="dashboard-card action-card restock-card" onClick={() => onNavigate('restock')}>
        <div className="card-top">
          <div className="icon-wrapper restock-bg">
            <Bell size={20} className="card-icon-new" />
          </div>
          <ChevronRight size={18} className="card-arrow" />
        </div>
        <div className="card-body">
          <span className="context-label">Supply Chain</span>
          <h3>Restock Requests</h3>
          <div className="stat-minimal">
            <span className="stat-value-large">{stats.pendingRestocksCount}</span>
            <div className="badge restock-badge">Waiting</div>
          </div>
          <p className="description-small">Pending requests to suppliers</p>
        </div>
      </div>
    </div>
  </>
);

// Placeholder Content for other menu items
const PlaceholderContent = ({ title, description }) => (
  <div className="placeholder-content">
    <h2 className="placeholder-title">{title}</h2>
    <p className="placeholder-description">{description}</p>
    <div className="placeholder-note">
      [!] This section is under development
    </div>
  </div>
);

export default StaffDashboard;
