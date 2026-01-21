import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const CustomerDashboard = () => {
    return (
        <DashboardLayout role="customer">
            <div className="dashboard-welcome">
                <h1 className="dashboard-heading">Customer Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome to your aquarium management portal
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card glass">
                    <div className="card-icon">🛒</div>
                    <h3>My Orders</h3>
                    <p>Track your orders and purchases</p>
                    <div className="card-stat">
                        <span className="stat-number">3</span>
                        <span className="stat-label">Active Orders</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">🐠</div>
                    <h3>My Aquariums</h3>
                    <p>Manage your aquarium setups</p>
                    <div className="card-stat">
                        <span className="stat-number">2</span>
                        <span className="stat-label">Registered Tanks</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">❤️</div>
                    <h3>Wishlist</h3>
                    <p>Items you've saved for later</p>
                    <div className="card-stat">
                        <span className="stat-number">8</span>
                        <span className="stat-label">Saved Items</span>
                    </div>
                </div>

                <div className="dashboard-card glass">
                    <div className="card-icon">💬</div>
                    <h3>Support</h3>
                    <p>Get help from our team</p>
                    <div className="card-stat">
                        <span className="stat-number">1</span>
                        <span className="stat-label">Open Tickets</span>
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

export default CustomerDashboard;
