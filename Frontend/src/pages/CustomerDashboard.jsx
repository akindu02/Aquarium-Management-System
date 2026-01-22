import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI } from '../utils/api';
import '../index.css';

const CustomerDashboard = () => {
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
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'browse', label: 'Browse Products' },
    { id: 'orders', label: 'My Orders' },
    { id: 'aquariums', label: 'My Aquariums' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Account Settings' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'browse':
        return <PlaceholderContent title="Browse Products" description="Explore our wide range of aquarium fish, plants, and accessories" />;
      case 'orders':
        return <PlaceholderContent title="My Orders" description="Track and manage your order history" />;
      case 'aquariums':
        return <PlaceholderContent title="My Aquariums" description="Manage your aquarium setups and track their health" />;
      case 'wishlist':
        return <PlaceholderContent title="Wishlist" description="View and manage your saved items" />;
      case 'messages':
        return <PlaceholderContent title="Messages" description="Chat with our support team and suppliers" />;
      case 'settings':
        return <PlaceholderContent title="Account Settings" description="Update your profile and preferences" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="customer-layout">
      {/* Sidebar */}
      <aside className={`customer-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo / System Name */}
        <div className="sidebar-logo">
          <span className="logo">Methu<span className="text-primary">Aquarium</span></span>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-nav">
          {!isSidebarCollapsed && <p className="nav-section-title">MAIN MENU</p>}
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                  title={item.label}
                >
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="customer-main">
        {/* Top Header with User Profile */}
        <header className="customer-header">
          <div className="header-left"></div>
          <div className="header-right">
            <button className="notification-btn" title="Notifications">
              <span className="notification-icon">N</span>
              <span className="notification-badge">2</span>
            </button>
            <div className="header-profile">
              <div className="header-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.firstName} {user?.lastName}</p>
                <p className="header-user-role">Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="customer-content">
          {renderContent()}
        </div>
      </main>

      <style>{`
                .customer-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--color-bg);
                }

                /* ===== SIDEBAR ===== */
                .customer-sidebar {
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

                .customer-sidebar.collapsed {
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
                .customer-main {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s ease;
                }

                .customer-sidebar.collapsed + .customer-main {
                    margin-left: 80px;
                }

                /* Header */
                .customer-header {
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
                    background: linear-gradient(135deg, #4ECDC4, #44A08D);
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
                .customer-content {
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
                    .customer-sidebar {
                        transform: translateX(-100%);
                    }

                    .customer-sidebar.collapsed {
                        transform: translateX(-100%);
                    }

                    .customer-main {
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
      <h1 className="dashboard-heading">Welcome Back!</h1>
      <p className="dashboard-subtitle">
        Explore our aquarium products and manage your orders.
      </p>
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>My Orders</h3>
        <p>Track your recent and past orders</p>
        <div className="card-stat">
          <span className="stat-number">5</span>
          <span className="stat-label">Active Orders</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>My Aquariums</h3>
        <p>Manage your aquarium setups</p>
        <div className="card-stat">
          <span className="stat-number">3</span>
          <span className="stat-label">Registered Aquariums</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Wishlist</h3>
        <p>Items you've saved for later</p>
        <div className="card-stat">
          <span className="stat-number">12</span>
          <span className="stat-label">Saved Items</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Loyalty Points</h3>
        <p>Earn and redeem rewards</p>
        <div className="card-stat">
          <span className="stat-number">2,450</span>
          <span className="stat-label">Available Points</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Recent Activity</h3>
        <p>Your latest interactions</p>
        <div className="card-stat">
          <span className="stat-number">8</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Support</h3>
        <p>Get help from our team</p>
        <div className="card-stat">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Available</span>
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

export default CustomerDashboard;
