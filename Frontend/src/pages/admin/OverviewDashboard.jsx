import React, { useState, useEffect, useRef } from 'react';
import {
  Coins, Users, CalendarClock, ShoppingCart, AlertTriangle, Package,
  Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  RefreshCw, Clock, CheckCircle, XCircle, Truck, Eye, BarChart3,
  UserCheck, UserPlus, Star, ChevronRight, Loader2
} from 'lucide-react';
import { getAdminDashboardStatsAPI } from '../../utils/api';

// ─── Helper: format currency ───────────────────
const fmtCurrency = (v) => {
  const num = Number(v) || 0;
  return `LKR ${num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Helper: relative time ─────────────────────
const relTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

// ─── Mini-bar chart (pure SVG) ─────────────────
const MiniBarChart = ({ data, height = 120, barColor = '#4ecdc4' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.revenue), 1);
  const barW = 100 / data.length;

  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d.revenue / max) * (height - 20);
        return (
          <g key={i}>
            <rect
              x={i * barW + barW * 0.15}
              y={height - h - 10}
              width={barW * 0.7}
              height={h}
              rx={3}
              fill={barColor}
              opacity={0.85}
            >
              <animate
                attributeName="height"
                from="0"
                to={h}
                dur="0.6s"
                fill="freeze"
                begin={`${i * 0.08}s`}
              />
              <animate
                attributeName="y"
                from={height - 10}
                to={height - h - 10}
                dur="0.6s"
                fill="freeze"
                begin={`${i * 0.08}s`}
              />
            </rect>
            <text
              x={i * barW + barW / 2}
              y={height - 1}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="6"
              fontFamily="inherit"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Donut chart (pure SVG) ────────────────────
const DonutChart = ({ data, size = 140 }) => {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  const colors = {
    'Pending': '#f59e0b', 'Processing': '#3b82f6', 'Shipped': '#8b5cf6',
    'Delivered': '#10b981', 'Cancelled': '#ef4444', 'Returned': '#f97316',
    'Confirmed': '#10b981', 'In Progress': '#3b82f6', 'Completed': '#10b981',
  };

  const radius = 50;
  const cx = 60;
  const cy = 60;
  let cumAngle = -90;

  const arcs = data.map((d) => {
    const angle = (d.count / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...d,
      color: colors[d.status] || '#6b7280',
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} opacity={0.9} stroke="rgba(17,25,40,0.8)" strokeWidth="1" />
        ))}
        <circle cx={cx} cy={cy} r={30} fill="rgba(17,25,40,0.95)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {arcs.map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: arc.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{arc.status}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', fontWeight: 600 }}>{arc.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Progress Bar ──────────────────────────────
const ProgressBar = ({ value, max, color = '#4ecdc4', label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
          <span style={{ color, fontWeight: 600 }}>{value}</span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: 3, background: color,
            width: `${pct}%`, transition: 'width 1s ease',
          }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════
const OverviewDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const mountRef = useRef(true);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getAdminDashboardStatsAPI();
      if (mountRef.current && res.success) {
        setStats(res.data);
        setError(null);
      }
    } catch (err) {
      if (mountRef.current) setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (mountRef.current) { setLoading(false); setRefreshing(false); }
    }
  };

  useEffect(() => {
    mountRef.current = true;
    fetchStats();
    // Auto-refresh every 60s
    const interval = setInterval(() => fetchStats(true), 60000);
    return () => { mountRef.current = false; clearInterval(interval); };
  }, []);

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="ov-loading">
        <Loader2 className="ov-spinner" size={40} />
        <p>Loading dashboard data…</p>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="ov-error">
        <AlertTriangle size={40} />
        <h3>Failed to load dashboard</h3>
        <p>{error}</p>
        <button className="ov-retry-btn" onClick={() => fetchStats()}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Activity type → icon
  const activityIcon = (type) => {
    if (type === 'order') return <ShoppingCart size={14} />;
    if (type === 'booking') return <CalendarClock size={14} />;
    if (type === 'user') return <UserPlus size={14} />;
    return <Activity size={14} />;
  };

  const activityColor = (type) => {
    if (type === 'order') return '#3b82f6';
    if (type === 'booking') return '#f59e0b';
    if (type === 'user') return '#10b981';
    return '#8b5cf6';
  };

  return (
    <>
      {/* ─── Header ─── */}
      <div className="ov-header">
        <div>
          <h1 className="ov-title">Overview Dashboard</h1>
          <p className="ov-subtitle">
            Real-time business insights &amp; performance metrics
          </p>
        </div>
        <button
          className={`ov-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          title="Refresh data"
        >
          <RefreshCw size={18} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ─── KPI Cards Row ─── */}
      <div className="ov-kpi-grid">
        {/* Total Revenue */}
        <div className="ov-kpi-card ov-kpi-revenue">
          <div className="ov-kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <Coins size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Total Revenue</span>
            <span className="ov-kpi-value">{fmtCurrency(stats.revenue.total)}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-green">
                <TrendingUp size={12} /> Today: {fmtCurrency(stats.revenue.today)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="ov-kpi-card ov-kpi-users">
          <div className="ov-kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
            <Users size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Total Users</span>
            <span className="ov-kpi-value">{stats.users.total}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-blue">
                <UserPlus size={12} /> +{stats.users.newThisMonth} this month
              </span>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="ov-kpi-card ov-kpi-bookings">
          <div className="ov-kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <CalendarClock size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Pending Bookings</span>
            <span className="ov-kpi-value">{stats.bookings.pending}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-amber">
                <Clock size={12} /> {stats.bookings.today} today
              </span>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="ov-kpi-card ov-kpi-orders">
          <div className="ov-kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            <ShoppingCart size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Active Orders</span>
            <span className="ov-kpi-value">{stats.orders.active}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-blue">
                <Truck size={12} /> {stats.orders.shipped} shipped
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="ov-kpi-card ov-kpi-stock">
          <div className="ov-kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Low Stock Items</span>
            <span className="ov-kpi-value">{stats.inventory.lowStockCount}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-red">
                <XCircle size={12} /> {stats.inventory.outOfStockCount} out of stock
              </span>
            </div>
          </div>
        </div>

        {/* Pending Restocks */}
        <div className="ov-kpi-card ov-kpi-restock">
          <div className="ov-kpi-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            <RefreshCw size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Pending Restocks</span>
            <span className="ov-kpi-value">{stats.pendingRestocks}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                <Package size={12} /> Awaiting supplier
              </span>
            </div>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="ov-kpi-card ov-kpi-today-bookings">
          <div className="ov-kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CalendarClock size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">Today's Bookings</span>
            <span className="ov-kpi-value">{stats.bookings.today}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag ov-kpi-tag-green">
                scheduled today
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="ov-kpi-card ov-kpi-monthly-rev">
          <div className="ov-kpi-icon" style={{ background: 'rgba(78,205,196,0.12)', color: '#4ecdc4' }}>
            <TrendingUp size={22} />
          </div>
          <div className="ov-kpi-body">
            <span className="ov-kpi-label">This Month</span>
            <span className="ov-kpi-value">{fmtCurrency(stats.revenue.thisMonth)}</span>
            <div className="ov-kpi-meta">
              <span className="ov-kpi-tag" style={{ background: 'rgba(78,205,196,0.1)', color: '#4ecdc4' }}>
                monthly revenue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Revenue Overview ─── */}
      <div className="ov-section-grid-2">
        {/* Monthly Revenue Chart */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3><BarChart3 size={18} /> Revenue Trend</h3>
            <span className="ov-card-badge">Last 6 months</span>
          </div>
          <div className="ov-chart-container">
            {stats.monthlyRevenue.length > 0 ? (
              <MiniBarChart data={stats.monthlyRevenue} height={140} />
            ) : (
              <div className="ov-empty-state">
                <BarChart3 size={32} />
                <p>No revenue data available</p>
              </div>
            )}
          </div>
          <div className="ov-revenue-summary">
            <div className="ov-rev-item">
              <span className="ov-rev-label">This Month</span>
              <span className="ov-rev-value">{fmtCurrency(stats.revenue.thisMonth)}</span>
            </div>
            <div className="ov-rev-divider" />
            <div className="ov-rev-item">
              <span className="ov-rev-label">Total Revenue</span>
              <span className="ov-rev-value">{fmtCurrency(stats.revenue.total)}</span>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3><ShoppingCart size={18} /> Order Distribution</h3>
            <span className="ov-card-badge">{stats.orders.total} total</span>
          </div>
          <div className="ov-chart-center">
            <DonutChart data={stats.orders.statusDistribution} />
          </div>
          <div className="ov-order-breakdown">
            <ProgressBar value={stats.orders.pending} max={stats.orders.total} color="#f59e0b" label="Pending" />
            <ProgressBar value={stats.orders.processing} max={stats.orders.total} color="#3b82f6" label="Processing" />
            <ProgressBar value={stats.orders.shipped} max={stats.orders.total} color="#8b5cf6" label="Shipped" />
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Users + Bookings ─── */}
      <div className="ov-section-grid-2">
        {/* User Breakdown */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3><Users size={18} /> User Breakdown</h3>
            <span className="ov-card-badge">{stats.users.active} active</span>
          </div>
          <div className="ov-user-grid">
            <div className="ov-user-stat">
              <div className="ov-user-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                <Users size={18} />
              </div>
              <div>
                <div className="ov-user-count">{stats.users.customers}</div>
                <div className="ov-user-label">Customers</div>
              </div>
            </div>
            <div className="ov-user-stat">
              <div className="ov-user-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                <Package size={18} />
              </div>
              <div>
                <div className="ov-user-count">{stats.users.suppliers}</div>
                <div className="ov-user-label">Suppliers</div>
              </div>
            </div>
            <div className="ov-user-stat">
              <div className="ov-user-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div className="ov-user-count">{stats.users.staff}</div>
                <div className="ov-user-label">Staff</div>
              </div>
            </div>
            <div className="ov-user-stat">
              <div className="ov-user-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                <Star size={18} />
              </div>
              <div>
                <div className="ov-user-count">{stats.users.admins}</div>
                <div className="ov-user-label">Admins</div>
              </div>
            </div>
          </div>
          <div className="ov-user-footer">
            <div>
              <span style={{ color: '#10b981' }}>● </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                {stats.users.active} active
              </span>
            </div>
            <div>
              <span style={{ color: '#ef4444' }}>● </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                {stats.users.inactive} inactive
              </span>
            </div>
          </div>
        </div>

        {/* Booking Distribution */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3><CalendarClock size={18} /> Booking Overview</h3>
          </div>
          <div className="ov-chart-center">
            {stats.bookingStatusDistribution && stats.bookingStatusDistribution.length > 0 ? (
              <DonutChart data={stats.bookingStatusDistribution} />
            ) : (
              <div className="ov-empty-state">
                <CalendarClock size={32} />
                <p>No booking data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Activity + Low Stock + Top Products ─── */}
      <div className="ov-section-grid-3">
        {/* Recent Activity */}
        <div className="ov-card ov-card-tall">
          <div className="ov-card-header">
            <h3><Activity size={18} /> Recent Activity</h3>
          </div>
          <div className="ov-activity-feed">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item, i) => (
                <div key={i} className="ov-activity-item">
                  <div className="ov-activity-icon-w" style={{ background: `${activityColor(item.type)}15`, color: activityColor(item.type) }}>
                    {activityIcon(item.type)}
                  </div>
                  <div className="ov-activity-body">
                    <p className="ov-activity-text">{item.text}</p>
                    <div className="ov-activity-meta">
                      <span className="ov-activity-time">{relTime(item.time)}</span>
                      {item.amount && (
                        <span className="ov-activity-amount">{fmtCurrency(item.amount)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ov-empty-state">
                <Activity size={28} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="ov-card ov-card-tall">
          <div className="ov-card-header">
            <h3><AlertTriangle size={18} /> Low Stock Alert</h3>
            <span className="ov-card-badge ov-badge-red">{stats.inventory.lowStockCount} items</span>
          </div>
          <div className="ov-stock-list">
            {stats.inventory.lowStockItems.length > 0 ? (
              stats.inventory.lowStockItems.map((item) => (
                <div key={item.id} className="ov-stock-item">
                  <div className="ov-stock-img">
                    {item.image ? (
                      <img src={`http://localhost:5001${item.image}`} alt={item.name} />
                    ) : (
                      <Package size={18} />
                    )}
                  </div>
                  <div className="ov-stock-info">
                    <p className="ov-stock-name">{item.name}</p>
                    <span className="ov-stock-cat">{item.category}</span>
                  </div>
                  <div className="ov-stock-qty" style={{ color: item.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                  </div>
                </div>
              ))
            ) : (
              <div className="ov-empty-state">
                <CheckCircle size={28} style={{ color: '#10b981' }} />
                <p>All items well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="ov-card ov-card-tall">
          <div className="ov-card-header">
            <h3><Star size={18} /> Top Products</h3>
          </div>
          <div className="ov-top-products">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={p.id} className="ov-top-product">
                  <div className="ov-top-rank" style={{ background: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>
                    #{i + 1}
                  </div>
                  <div className="ov-top-info">
                    <p className="ov-top-name">{p.name}</p>
                    <span className="ov-top-cat">{p.category}</span>
                  </div>
                  <div className="ov-top-stats">
                    <span className="ov-top-sold">{p.totalSold} sold</span>
                    <span className="ov-top-rev">{fmtCurrency(p.totalRevenue)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="ov-empty-state">
                <Star size={28} />
                <p>No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Quick Summary Cards ─── */}
      <div className="ov-quick-row">
        {/* Pending Refunds */}
        <div className="ov-quick-card">
          <div className="ov-quick-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>
            <ArrowDownRight size={20} />
          </div>
          <div>
            <span className="ov-quick-label">Pending Refunds</span>
            <span className="ov-quick-value">{stats.refunds.pending}</span>
            <span className="ov-quick-sub">{fmtCurrency(stats.refunds.pendingAmount)} total</span>
          </div>
        </div>



        {/* Total Orders */}
        <div className="ov-quick-card">
          <div className="ov-quick-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            <ShoppingCart size={20} />
          </div>
          <div>
            <span className="ov-quick-label">Total Orders</span>
            <span className="ov-quick-value">{stats.orders.total}</span>
            <span className="ov-quick-sub">all time</span>
          </div>
        </div>
      </div>

      {/* ── Inline Styles ── */}
      <style>{`
        /* ═══ Header ═══ */
        .ov-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .ov-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          background: linear-gradient(135deg, #4ecdc4, #44b3f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ov-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 1rem;
          margin: 0;
        }
        .ov-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          padding: 0.6rem 1.1rem;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.25s ease;
        }
        .ov-refresh-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(78,205,196,0.3);
          color: #4ecdc4;
        }
        .ov-refresh-btn.spinning svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ═══ Loading / Error ═══ */
        .ov-loading, .ov-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: rgba(255,255,255,0.5);
          gap: 1rem;
        }
        .ov-spinner {
          animation: spin 1s linear infinite;
          color: #4ecdc4;
        }
        .ov-error h3 { color: #ef4444; margin: 0; }
        .ov-retry-btn {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444; padding: 0.5rem 1rem; border-radius: 8px;
          cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
        }
        .ov-retry-btn:hover { background: rgba(239,68,68,0.2); }

        /* ═══ KPI Cards ═══ */
        .ov-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .ov-kpi-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .ov-kpi-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(78,205,196,0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ov-kpi-card:hover {
          transform: translateY(-4px);
          border-color: rgba(78,205,196,0.2);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.05);
        }
        .ov-kpi-card:hover::before { opacity: 1; }

        .ov-kpi-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ov-kpi-body {
          display: flex; flex-direction: column; gap: 0.2rem;
          min-width: 0;
        }
        .ov-kpi-label {
          font-size: 0.82rem; color: rgba(255,255,255,0.5);
          font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ov-kpi-value {
          font-size: 1.65rem; font-weight: 800;
          color: var(--text-main, #fff); line-height: 1.2;
        }
        .ov-kpi-meta { margin-top: 0.35rem; }
        .ov-kpi-tag {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; font-weight: 600;
          padding: 0.2rem 0.6rem; border-radius: 20px;
        }
        .ov-kpi-tag-green { background: rgba(16,185,129,0.1); color: #10b981; }
        .ov-kpi-tag-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .ov-kpi-tag-amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .ov-kpi-tag-red { background: rgba(239,68,68,0.1); color: #ef4444; }

        /* ═══ Section Grids ═══ */
        .ov-section-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .ov-section-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        /* ═══ Cards ═══ */
        .ov-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .ov-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.035);
        }
        .ov-card-tall { min-height: 380px; display: flex; flex-direction: column; }
        .ov-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ov-card-header h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.9);
        }
        .ov-card-badge {
          font-size: 0.72rem;
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          background: rgba(78,205,196,0.1);
          color: #4ecdc4;
          font-weight: 600;
        }
        .ov-badge-red {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
        }

        /* Chart containers */
        .ov-chart-container { padding: 0.5rem 0; }
        .ov-chart-center { display: flex; justify-content: center; padding: 1rem 0; }

        /* Revenue summary */
        .ov-revenue-summary {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ov-rev-item { display: flex; flex-direction: column; }
        .ov-rev-label { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-bottom: 0.2rem; }
        .ov-rev-value { font-size: 1.1rem; font-weight: 700; color: var(--text-main, #fff); }
        .ov-rev-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.08); }

        /* Order breakdown */
        .ov-order-breakdown { margin-top: 1rem; }

        /* ═══ User Breakdown ═══ */
        .ov-user-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .ov-user-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s;
        }
        .ov-user-stat:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }
        .ov-user-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ov-user-count { font-size: 1.35rem; font-weight: 700; color: var(--text-main, #fff); line-height: 1.2; }
        .ov-user-label { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
        .ov-user-footer {
          display: flex; gap: 1.5rem;
          margin-top: 1rem; padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ═══ Activity Feed ═══ */
        .ov-activity-feed {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          max-height: 320px;
          padding-right: 0.25rem;
        }
        .ov-activity-feed::-webkit-scrollbar { width: 3px; }
        .ov-activity-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        .ov-activity-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s;
        }
        .ov-activity-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
        }
        .ov-activity-icon-w {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ov-activity-body { min-width: 0; flex: 1; }
        .ov-activity-text {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.85);
          margin: 0 0 0.25rem 0;
          line-height: 1.35;
        }
        .ov-activity-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ov-activity-time {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
        }
        .ov-activity-amount {
          font-size: 0.72rem;
          color: #10b981;
          font-weight: 600;
        }

        /* ═══ Low Stock List ═══ */
        .ov-stock-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          overflow-y: auto;
          max-height: 320px;
        }
        .ov-stock-list::-webkit-scrollbar { width: 3px; }
        .ov-stock-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        .ov-stock-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s;
        }
        .ov-stock-item:hover {
          background: rgba(255,255,255,0.04);
        }
        .ov-stock-img {
          width: 38px; height: 38px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0;
          color: rgba(255,255,255,0.3);
        }
        .ov-stock-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .ov-stock-info { flex: 1; min-width: 0; }
        .ov-stock-name {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.85);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ov-stock-cat {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
        }
        .ov-stock-qty {
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ═══ Top Products ═══ */
        .ov-top-products {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .ov-top-product {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s;
        }
        .ov-top-product:hover {
          background: rgba(255,255,255,0.04);
        }
        .ov-top-rank {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ov-top-info { flex: 1; min-width: 0; }
        .ov-top-name {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.85);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ov-top-cat { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
        .ov-top-stats { text-align: right; flex-shrink: 0; }
        .ov-top-sold { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.6); font-weight: 600; }
        .ov-top-rev { display: block; font-size: 0.7rem; color: #10b981; }

        /* ═══ Quick Row ═══ */
        .ov-quick-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1rem;
        }
        .ov-quick-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          transition: all 0.25s;
        }
        .ov-quick-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }
        .ov-quick-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ov-quick-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 0.15rem;
        }
        .ov-quick-value {
          display: block;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main, #fff);
          line-height: 1.3;
        }
        .ov-quick-sub {
          display: block;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
        }

        /* ═══ Empty State ═══ */
        .ov-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: rgba(255,255,255,0.25);
          gap: 0.5rem;
          text-align: center;
        }
        .ov-empty-state p { margin: 0; font-size: 0.85rem; }

        /* ═══ Responsive ═══ */
        @media (max-width: 1200px) {
          .ov-section-grid-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 900px) {
          .ov-section-grid-2 { grid-template-columns: 1fr; }
          .ov-section-grid-3 { grid-template-columns: 1fr; }
          .ov-kpi-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .ov-kpi-grid { grid-template-columns: 1fr; }
          .ov-title { font-size: 1.6rem; }
          .ov-quick-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default OverviewDashboard;
