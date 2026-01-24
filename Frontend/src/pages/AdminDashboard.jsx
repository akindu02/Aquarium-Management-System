import React, { useState } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Bell, Settings, LogOut, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI } from '../utils/api';
import '../index.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const user = getUserData();

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
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'products', label: 'Products / Inventory', icon: Package },
    { id: 'orders', label: 'Orders / Transactions', icon: ShoppingCart },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages / Notifications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <PlaceholderContent title="Users Management" description="Manage all system users, roles, and permissions" />;
      case 'products':
        return <PlaceholderContent title="Products / Inventory" description="Manage aquarium products, fish, and stock levels" />;
      case 'orders':
        return <PlaceholderContent title="Orders / Transactions" description="Track and manage all orders and transactions" />;
      case 'reports':
        return <PlaceholderContent title="Reports & Analytics" description="View performance metrics and generate reports" />;
      case 'messages':
        return <PlaceholderContent title="Messages / Notifications" description="Manage communications and system alerts" />;
      case 'settings':
        return <PlaceholderContent title="Settings" description="Configure system preferences and features" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
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
      <main className="admin-main">
        {/* Top Header with User Profile */}
        <header className="admin-header">
          <div className="header-left"></div>
          <div className="header-right">
            <button className="notification-btn" title="Notifications">
              <Bell className="notification-icon" />
              <span className="notification-badge">3</span>
            </button>
            <div className="header-profile">
              <div className="header-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.firstName} {user?.lastName}</p>
                <p className="header-user-role">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {renderContent()}
        </div>
      </main>

      <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg);
                }

                /* ===== SIDEBAR ===== */
                .admin-sidebar {
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

                .admin-sidebar.collapsed {
                    width: 80px;
                }

                /* Logo Section */
                .sidebar-logo {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .text-primary {
                    color: var(--color-primary);
                }

                /* Admin Profile */
                .admin-profile {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .profile-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.2rem;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }

                .profile-info {
                    overflow: hidden;
                }

                .profile-name {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 1rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-role {
                    font-size: 0.85rem;
                    color: #FF6B6B;
                    font-weight: 500;
                }

                /* Navigation */
                .sidebar-nav {
                    flex: 1;
                    padding: 1rem 0;
                    overflow-y: auto;
                }

                .nav-section-title {
                    padding: 0 1.5rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    letter-spacing: 1.5px;
                    margin-bottom: 0.75rem;
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

                .nav-icon {
                    width: 20px;
                    height: 20px;
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
                .admin-main {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s ease;
                }

                .admin-sidebar.collapsed + .admin-main {
                    margin-left: 80px;
                }

                /* Header */
                .admin-header {
                    background: rgba(17, 25, 40, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .sidebar-toggle {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    font-size: 1.25rem;
                    color: var(--text-main);
                    cursor: pointer;
                    padding: 0.5rem 0.75rem;
                    transition: all 0.2s;
                }

                .sidebar-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                /* Notification Button */
                .notification-btn {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .notification-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .notification-icon {
                    color: var(--text-main);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FF6B6B;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Header Profile */
                .header-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .header-profile:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                .header-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
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
                .admin-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
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

                .card-icon {
                    width: 42px;
                    height: 42px;
                    margin-bottom: 1rem;
                }

                .notification-icon { width: 18px; height: 18px; }
                .logout-icon { width: 18px; height: 18px; }

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

                .placeholder-icon {
                    font-size: 5rem;
                    margin-bottom: 1.5rem;
                    opacity: 0.8;
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
                    .admin-sidebar {
                        transform: translateX(-100%);
                    }

                    .admin-sidebar.collapsed {
                        transform: translateX(-100%);
                    }

                    .admin-main {
                        margin-left: 0;
                    }

                    .dashboard-heading {
                        font-size: 1.75rem;
                    }

                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = () => (
  <>
    <div className="dashboard-welcome">
      <h1 className="dashboard-heading">Admin Dashboard</h1>
      <p className="dashboard-subtitle">
        Welcome to the admin control center. Manage your aquarium business from here.
      </p>
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <Users className="card-icon" style={{ color: "var(--color-primary)" }} />
        <h3>User Management</h3>
        <p>Manage all users, roles, and permissions</p>
        <div className="card-stat">
          <span className="stat-number">1,234</span>
          <span className="stat-label">Total Users</span>
        </div>
      </div>

      <div className="dashboard-card">
        <BarChart3 className="card-icon" style={{ color: "#a855f7" }} />
        <h3>Analytics</h3>
        <p>View system-wide analytics and reports</p>
        <div className="card-stat">
          <span className="stat-number">98%</span>
          <span className="stat-label">System Health</span>
        </div>
      </div>

      <div className="dashboard-card">
        <Package className="card-icon" style={{ color: "#f59e0b" }} />
        <h3>Inventory</h3>
        <p>Manage aquarium products and stock</p>
        <div className="card-stat">
          <span className="stat-number">456</span>
          <span className="stat-label">Products</span>
        </div>
      </div>

      <div className="dashboard-card">
        <ShoppingCart className="card-icon" style={{ color: "#10b981" }} />
        <h3>Orders</h3>
        <p>Track and manage customer orders</p>
        <div className="card-stat">
          <span className="stat-number">89</span>
          <span className="stat-label">Pending Orders</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Revenue</h3>
        <p>Monitor sales and revenue</p>
        <div className="card-stat">
          <span className="stat-number">$24.5K</span>
          <span className="stat-label">This Month</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Reviews</h3>
        <p>Customer feedback and ratings</p>
        <div className="card-stat">
          <span className="stat-number">4.8</span>
          <span className="stat-label">Avg Rating</span>
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

export default AdminDashboard;
