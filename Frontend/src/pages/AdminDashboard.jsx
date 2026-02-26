import React, { useState } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Bell, Settings, LogOut, CalendarClock, AlertTriangle, Clock, CheckCircle, Activity, Coins, ChevronRight, RefreshCw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI } from '../utils/api';
import ProfileModal from '../components/ProfileModal';
import UserManagement from './admin/UserManagement';
import BookingManagement from './admin/BookingManagement';
import InventoryManagement from './admin/InventoryManagement';
import OrderManagement from './admin/OrderManagement';
import ReportsAnalytics from './admin/ReportsAnalytics';
import ProductRestock from './staff/ProductRestock';
import '../index.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(getUserData());
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
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
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'products', label: 'Products / Inventory', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'restock', label: 'Product Restock', icon: RefreshCw },
    { id: 'bookings', label: 'Bookings', icon: CalendarClock },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'products':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'restock':
        return <ProductRestock />;
      case 'reports':
        return <ReportsAnalytics />;
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
              <Bell size={18} className="notification-icon" />
              <span className="notification-badge">3</span>
            </button>
            <div className="header-divider" />
            <div className="header-profile" onClick={() => setShowProfileModal(true)} title="Profile settings">
              <div className="header-avatar">
                {getInitials(user?.name)}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.name || 'Admin'}</p>
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

      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        setUser={setUser}
        accentColor="#FF6B6B"
        accentGradient="linear-gradient(135deg, #FF6B6B, #FF8E53)"
        roleEmoji="👑"
      />

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
                    width: calc(100% - 280px);
                    max-width: calc(100% - 280px);
                }

                .admin-sidebar.collapsed + .admin-main {
                    margin-left: 80px;
                    width: calc(100% - 80px);
                    max-width: calc(100% - 80px);
                }

                /* Header */
                .admin-header {
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
            `}</style>
    </div>
  );
};

// Dashboard Content Component
// Dashboard Content Component
const DashboardContent = () => {
  // Dummy Data for Dashboard Overview
  const dashboardStats = [
    { label: 'Total Revenue', value: 'LKR 450,000', sub: 'Total earnings', icon: Coins, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Pending Bookings', value: '12', sub: 'Requires attention', icon: CalendarClock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Active Orders', value: '8', sub: 'Processing & Shipped', icon: ShoppingCart, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Low Stock Items', value: '5', sub: 'Restock immediately', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  ];

  const recentActivity = [
    { id: 1, text: 'New order #ORD-5008 placed by Mahesh', time: '10 mins ago', type: 'order' },
    { id: 2, text: 'Booking #BK-201 confirmed for Kasun', time: '1 hour ago', type: 'booking' },
    { id: 3, text: 'Inventory alert: Goldfish Food low stock', time: '2 hours ago', type: 'alert' },
    { id: 4, text: 'New user "Dilshan" registered', time: '5 hours ago', type: 'user' },
  ];

  const urgentTasks = [
    { id: 1, title: 'Confirm Tank Cleaning for Nimali', type: 'Booking', priority: 'High' },
    { id: 2, title: 'Ship Order #ORD-5002', type: 'Order', priority: 'Medium' },
    { id: 3, title: 'Restock Neon Tetra', type: 'Inventory', priority: 'High' },
  ];

  return (
    <>
      <div className="dashboard-welcome">
        <h1 className="dashboard-heading">Overview Dashboard</h1>
        <p className="dashboard-subtitle">
          Key metrics and daily activities at a glance.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="dashboard-stats-grid">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="db-stat-card">
            <div className="db-stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="db-stat-value">{stat.value}</div>
              <div className="db-stat-label">{stat.label}</div>
              <div className="db-stat-sub">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Sections */}
      <div className="dashboard-activity-grid">
        {/* Recent Activity */}
        <div className="db-section">
          <div className="db-section-header">
            <h3><Activity size={18} /> Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot"></div>
                <div>
                  <div className="activity-text">{item.text}</div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Actions */}
        <div className="db-section">
          <div className="db-section-header">
            <h3><AlertTriangle size={18} /> Actions Required</h3>
          </div>
          <div className="task-list">
            {urgentTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <span className={`task-badge ${task.type.toLowerCase()}`}>{task.type}</span>
                </div>
                <button className="btn-action-sm">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .db-stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s;
        }
        .db-stat-card:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.05); }

        .db-stat-icon {
          width: 50px; height: 50px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }

        .db-stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-main); line-height: 1.2; }
        .db-stat-label { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem; }
        .db-stat-sub { font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; }

        .dashboard-activity-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        .db-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .db-section-header {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;
          padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .db-section-header h3 { font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem; }

        .activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item { display: flex; gap: 1rem; align-items: flex-start; }
        .activity-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary);
          margin-top: 0.4rem; flex-shrink: 0;
        }
        .activity-text { font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .activity-time { font-size: 0.8rem; color: var(--text-muted); }

        .task-list { display: flex; flex-direction: column; gap: 1rem; }
        .task-item {
          display: flex; justifying-content: space-between; align-items: center;
          background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 0.75rem;
        }
        .task-info h4 { margin: 0 0 0.25rem 0; font-size: 0.95rem; }
        .task-badge { font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.1); color: var(--text-muted); }
        .task-badge.booking { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .task-badge.order { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .task-badge.inventory { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .btn-action-sm {
          background: transparent; border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted); padding: 0.25rem 0.75rem; border-radius: 6px;
          cursor: pointer; font-size: 0.8rem;
        }
        .btn-action-sm:hover { border-color: var(--color-primary); color: var(--color-primary); }

        @media (max-width: 900px) {
          .dashboard-activity-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

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
