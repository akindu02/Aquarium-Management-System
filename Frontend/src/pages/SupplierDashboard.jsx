import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, Banknote, Bell, LogOut, History, ChevronRight, Package, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI } from '../utils/api';
import ProfileModal from '../components/ProfileModal';
import SupplierOrderRequests from './supplier/SupplierOrderRequests';
import SupplierOrderHistory from './supplier/SupplierOrderHistory';
import SupplierEarnings from './supplier/SupplierEarnings';
import SupplierRestock from './supplier/SupplierRestock';
import '../index.css';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(getUserData());
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_requests', label: 'New Order Request', icon: ClipboardList },
    { id: 'restock', label: 'Restock', icon: Package },
    { id: 'order_history', label: 'Order History', icon: History },
    { id: 'earnings', label: 'Performance', icon: Banknote },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent onNavigate={setActiveMenu} />;
      case 'new_requests':
        return <SupplierOrderRequests />;
      case 'restock':
        return <SupplierRestock />;
      case 'order_history':
        return <SupplierOrderHistory />;
      case 'earnings':
        return <SupplierEarnings />;
      default:
        return <DashboardContent onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="supplier-layout">
      {/* Sidebar */}
      <aside className={`supplier-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
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
      <main className="supplier-main">
        {/* Top Header with User Profile */}
        <header className="supplier-header">
          <div className="header-left"></div>
          <div className="header-right">
            <button className="notification-btn" title="Notifications">
              <Bell size={18} className="notification-icon" />
              <span className="notification-badge">5</span>
            </button>
            <div className="header-divider" />
            <div className="header-profile" onClick={() => setShowProfileModal(true)} title="Profile settings">
              <div className="header-avatar">
                {getInitials(user?.name)}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.name || 'Supplier'}</p>
                <p className="header-user-role">Supplier</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="supplier-content">
          {renderContent()}
        </div>
      </main>

      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        setUser={setUser}
        accentColor="#667eea"
        accentGradient="linear-gradient(135deg, #667eea, #764ba2)"
        roleEmoji="📦"
      />

      <style>{`
                .supplier-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg);
                }

                /* ===== SIDEBAR ===== */
                .supplier-sidebar {
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

                .supplier-sidebar.collapsed {
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
                .supplier-main {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s ease;
                    width: calc(100% - 280px);
                    max-width: calc(100% - 280px);
                }

                .supplier-sidebar.collapsed + .supplier-main {
                    margin-left: 80px;
                    width: calc(100% - 80px);
                    max-width: calc(100% - 80px);
                }

                /* Header */
                .supplier-header {
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
                    background: linear-gradient(135deg, #667eea, #764ba2);
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
                .supplier-content {
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

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .dashboard-card {
                    padding: 2rem;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(78, 205, 196, 0.15);
                    border-color: rgba(78, 205, 196, 0.3);
                }

                .dashboard-card h3 {
                    font-size: 1.25rem;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                }

                .dashboard-card p {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .card-arrow { color: var(--text-muted); opacity: 0; transition: all 0.2s; }
                .dashboard-card:hover .card-arrow { opacity: 1; transform: translateX(5px); }

                .card-stat {
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
                    .supplier-sidebar {
                        transform: translateX(-100%);
                    }

                    .supplier-sidebar.collapsed {
                        transform: translateX(-100%);
                    }

                    .supplier-main {
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
const DashboardContent = ({ onNavigate }) => (
  <>
    <div className="dashboard-welcome">
      <h1 className="dashboard-heading">Supplier Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of your pending requests, past orders, and earnings.
      </p>
    </div>

    <div className="dashboard-grid">
      {/* New Requests Summary */}
      <div className="dashboard-card" onClick={() => onNavigate('new_requests')}>
        <div className="card-header">
          <ClipboardList className="card-icon" style={{ color: "var(--color-primary)" }} />
          <ChevronRight size={20} className="card-arrow" />
        </div>
        <h3>Pending Requests</h3>
        <p>New stock requests from shop</p>
        <div className="card-stat">
          <span className="stat-number">4</span>
          <span className="stat-label">Action Required</span>
        </div>
      </div>

      {/* Order History Summary */}
      <div className="dashboard-card" onClick={() => onNavigate('order_history')}>
        <div className="card-header">
          <History className="card-icon" style={{ color: "#f59e0b" }} />
          <ChevronRight size={20} className="card-arrow" />
        </div>
        <h3>Order History</h3>
        <p>Completed and processed orders</p>
        <div className="card-stat">
          <span className="stat-number">128</span>
          <span className="stat-label">Total Orders</span>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="dashboard-card" onClick={() => onNavigate('earnings')}>
        <div className="card-header">
          <Banknote className="card-icon" style={{ color: "#10b981" }} />
          <ChevronRight size={20} className="card-arrow" />
        </div>
        <h3>Total Earnings</h3>
        <p>Revenue from sales</p>
        <div className="card-stat">
          <span className="stat-number">LKR 125 000</span>
          <span className="stat-label">This Month</span>
        </div>
      </div>
    </div>
  </>
);

export default SupplierDashboard;
