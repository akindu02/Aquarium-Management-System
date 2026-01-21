import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
    return (
        <DashboardLayout role="admin">
            <div className="dashboard-welcome">
                <h1 className="dashboard-heading">Admin Dashboard</h1>
                <p className="dashboard-subtitle">
                    Manage users, system settings, and overall operations
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card glass">
                    <div className="card-icon">👥</div>
                    <h3>User Management</h3>
                    <p>Manage all users, roles, and permissions</p>
                    <div className="card-stat">
                        <span className="stat-number">1,234</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">📊</div>
                    <h3>Analytics</h3>
                    <p>View system-wide analytics and reports</p>
                    <div className="card-stat">
                        <span className="stat-number">98%</span>
                        <span className="stat-label">System Health</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">⚙️</div>
                    <h3>System Settings</h3>
                    <p>Configure system preferences and features</p>
                    <div className="card-stat">
                        <span className="stat-number">15</span>
                        <span className="stat-label">Active Modules</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">🐠</div>
                    <h3>Inventory</h3>
                    <p>Manage aquarium products and stock</p>
                    <div className="card-stat">
                        <span className="stat-number">456</span>
                        <span className="stat-label">Products</span>
                    </div>
                </div>
            </div>

            <style>{`
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
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .dashboard-card h3 {
          font-size: 1.5rem;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .dashboard-card p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .card-stat {
          display: flex;
          flex-direction: column;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .dashboard-heading {
            font-size: 2rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </DashboardLayout>
    );
};

export default AdminDashboard;
