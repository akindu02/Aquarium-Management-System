import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, clearAuthData, getRefreshToken } from '../utils/auth';
import { logoutAPI } from '../utils/api';
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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
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

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-section">
                        <span className="role-icon">{config.icon}</span>
                        <h2 className="sidebar-title">{isSidebarOpen && config.title}</h2>
                    </div>
                </div>

                <div className="sidebar-user">
                    {isSidebarOpen && (
                        <>
                            <div className="user-avatar">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div className="user-info">
                                <p className="user-name">{user?.firstName} {user?.lastName}</p>
                                <p className="user-role">{role}</p>
                            </div>
                        </>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {isSidebarOpen && <p className="nav-section-title">MAIN MENU</p>}
                    {/* Navigation items will be passed as children or could be defined here */}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <span className="logout-icon">🚪</span>
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {isSidebarOpen ? '☰' : '☰'}
                    </button>
                    <div className="header-right">
                        <div className="user-greeting">
                            Welcome, <strong>{user?.firstName}</strong>!
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="dashboard-content">
                    {children}
                </div>
            </main>

            <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg);
        }

        .dashboard-sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        .dashboard-sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .role-icon {
          font-size: 2rem;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
        }

        .sidebar-user {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
          color: white;
          flex-shrink: 0;
        }

        .user-info {
          overflow: hidden;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
        }

        .nav-section-title {
          padding: 0 1.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 10px;
          color: #FF6B6B;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
        }

        .logout-btn:hover {
          background: rgba(255, 107, 107, 0.2);
          transform: translateY(-2px);
        }

        .logout-icon {
          font-size: 1.25rem;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .dashboard-sidebar.closed + .dashboard-main {
          margin-left: 80px;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-main);
          cursor: pointer;
          padding: 0.5rem;
          transition: transform 0.2s;
        }

        .sidebar-toggle:hover {
          transform: scale(1.1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-greeting {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .user-greeting strong {
          color: var(--text-main);
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }

          .dashboard-sidebar.open {
            transform: translateX(0);
          }

          .dashboard-main {
            margin-left: 0;
          }

          .dashboard-sidebar.closed + .dashboard-main {
            margin-left: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
