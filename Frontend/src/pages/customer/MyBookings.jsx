import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, MapPin, Phone, AlertCircle, CheckCircle,
    XCircle, ChevronRight, Plus, Loader2, RefreshCw, X, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import Swal from 'sweetalert2';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_META = {
    Pending:       { label: 'Pending',     color: 'badge-yellow', accent: '#f59e0b', Icon: Clock },
    Confirmed:     { label: 'Confirmed',   color: 'badge-blue',   accent: '#3b82f6', Icon: CheckCircle },
    'In Progress': { label: 'In Progress', color: 'badge-purple', accent: '#8b5cf6', Icon: AlertCircle },
    Completed:     { label: 'Completed',   color: 'badge-green',  accent: '#22c55e', Icon: CheckCircle },
    Cancelled:     { label: 'Cancelled',   color: 'badge-red',    accent: '#ef4444', Icon: XCircle },
};

const formatDate = (iso) => {
    if (!iso) return 'â€”';
    return new Date(iso).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
};

const formatTime = (iso) => {
    if (!iso) return 'â€”';
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// â”€â”€â”€ Booking Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;
    const meta = STATUS_META[booking.status] || STATUS_META.Pending;
    const { Icon } = meta;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="booking-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><X size={22} /></button>

                <h3 className="detail-modal-title">{booking.service_type}</h3>
                <span className={`status-badge ${meta.color}`}>
                    <Icon size={14} /> {meta.label}
                </span>

                <div className="detail-grid">
                    <div className="detail-row">
                        <span className="detail-label">Booking ID</span>
                        <span className="detail-value mono">BK-{String(booking.booking_id).padStart(4, '0')}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDate(booking.start_time || booking.booking_date)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Time</span>
                        <span className="detail-value">
                            {booking.start_time
                                ? `${formatTime(booking.start_time)} â€“ ${formatTime(booking.end_time)}`
                                : formatTime(booking.booking_date)}
                        </span>
                    </div>
                    {booking.base_price && (
                        <div className="detail-row">
                            <span className="detail-label">Base Price</span>
                            <span className="detail-value primary">Rs. {parseFloat(booking.base_price).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{booking.service_phone || 'â€”'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">City</span>
                        <span className="detail-value">{booking.service_city || 'â€”'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{booking.service_address || 'â€”'}</span>
                    </div>
                    {booking.notes && (
                        <div className="detail-row">
                            <span className="detail-label">Notes</span>
                            <span className="detail-value">{booking.notes}</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">Booked On</span>
                        <span className="detail-value">{formatDate(booking.created_at)}</span>
                    </div>
                </div>

                <button className="modal-close-action" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [cancellingId, setCancellingId] = useState(null);
    const [detailBooking, setDetailBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/bookings/my');
            setBookings(data.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancel = async (booking) => {
        const result = await Swal.fire({
            title: 'Cancel Booking?',
            html: `Are you sure you want to cancel your <strong>${booking.service_type}</strong> booking on <strong>${formatDate(booking.start_time || booking.booking_date)}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it',
            cancelButtonText: 'Keep it',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#4ecdc4',
            background: '#1a1f2e',
            color: '#fff',
        });

        if (!result.isConfirmed) return;

        setCancellingId(booking.booking_id);
        try {
            await apiRequest(`/bookings/${booking.booking_id}/cancel`, { method: 'PATCH' });
            setBookings((prev) =>
                prev.map((b) =>
                    b.booking_id === booking.booking_id ? { ...b, status: 'Cancelled' } : b
                )
            );
            Swal.fire({
                icon: 'success',
                title: 'Booking Cancelled',
                text: 'Your booking has been cancelled successfully.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4',
                timer: 2500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Could Not Cancel',
                text: err.message || 'Failed to cancel booking.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
            });
        } finally {
            setCancellingId(null);
        }
    };

    const FILTERS = [
        { key: 'all',       label: 'All' },
        { key: 'upcoming',  label: 'Upcoming' },
        { key: 'active',    label: 'In Progress' },
        { key: 'Completed', label: 'Completed' },
        { key: 'Cancelled', label: 'Cancelled' },
    ];

    const filteredBookings = bookings.filter((b) => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return ['Pending', 'Confirmed'].includes(b.status);
        if (filter === 'active') return b.status === 'In Progress';
        return b.status === filter;
    });

    return (
        <div className="bookings-container">
            {/* Header */}
            <div className="bookings-header">
                <div>
                    <h2 className="page-title">My Bookings</h2>
                    <p className="page-subtitle">Manage your service appointments</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="refresh-btn" onClick={fetchBookings} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                    <button className="book-new-btn" onClick={() => navigate('/services')}>
                        <Plus size={18} />
                        Book New Service
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bookings-filters">
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`filter-btn ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {label}
                        {key === 'all' && bookings.length > 0 && (
                            <span className="filter-count">{bookings.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <Loader2 size={36} className="spin" />
                    <p>Loading your bookingsâ€¦</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={36} />
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={fetchBookings}>Try Again</button>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} />
                    <h3>{filter === 'all' ? 'No bookings yet' : 'No bookings found'}</h3>
                    <p>
                        {filter === 'all'
                            ? 'Book your first aquarium service to get started.'
                            : 'No bookings match this filter.'}
                    </p>
                    {filter === 'all' && (
                        <button className="book-new-btn mt-4" onClick={() => navigate('/services')}>
                            <Plus size={18} /> Book a Service
                        </button>
                    )}
                </div>
            ) : (
                <div className="bookings-list">
                    {filteredBookings.map((booking) => {
                        const meta = STATUS_META[booking.status] || STATUS_META.Pending;
                        const { Icon } = meta;
                        const isCancelling = cancellingId === booking.booking_id;
                        const canCancel = ['Pending', 'Confirmed'].includes(booking.status);

                        return (
                            <div key={booking.booking_id} className="booking-card">
                                <div className="bk-card-accent" style={{ background: meta.accent }} />
                                <div className="bk-card-body">
                                    <div className="bk-card-top">
                                        <div className="bk-card-title-row">
                                            <h3 className="bk-service-type">{booking.service_type}</h3>
                                            <span className={`bk-status-badge ${meta.color}`}>
                                                <Icon size={12} />{meta.label}
                                            </span>
                                        </div>
                                        <p className="bk-booking-id">#{String(booking.booking_id).padStart(4, '0')}</p>
                                    </div>

                                    <div className="bk-info-grid">
                                        <div className="bk-info-item">
                                            <Calendar size={14} className="bk-info-icon" />
                                            <span>{formatDate(booking.start_time || booking.booking_date)}</span>
                                        </div>
                                        <div className="bk-info-item">
                                            <Clock size={14} className="bk-info-icon" />
                                            <span>
                                                {booking.start_time
                                                    ? `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
                                                    : formatTime(booking.booking_date)}
                                            </span>
                                        </div>
                                        {booking.service_city && (
                                            <div className="bk-info-item">
                                                <Building size={14} className="bk-info-icon" />
                                                <span>{booking.service_city}</span>
                                            </div>
                                        )}
                                        {booking.service_address && (
                                            <div className="bk-info-item">
                                                <MapPin size={14} className="bk-info-icon" />
                                                <span>{booking.service_address}</span>
                                            </div>
                                        )}
                                        {booking.service_phone && (
                                            <div className="bk-info-item">
                                                <Phone size={14} className="bk-info-icon" />
                                                <span>{booking.service_phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bk-card-footer">
                                        <button className="bk-details-btn" onClick={() => setDetailBooking(booking)}>
                                            View Details <ChevronRight size={14} />
                                        </button>
                                        {canCancel && (
                                            <button
                                                className="bk-cancel-btn"
                                                onClick={() => handleCancel(booking)}
                                                disabled={isCancelling}
                                            >
                                                {isCancelling ? <Loader2 size={13} className="spin" /> : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            <BookingDetailModal
                booking={detailBooking}
                onClose={() => setDetailBooking(null)}
            />

            <style>{`
                .bookings-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .bookings-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
                .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
                .page-subtitle { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.25rem; }
                .book-new-btn { display: flex; align-items: center; gap: 0.5rem; background: var(--color-primary, #4ecdc4); color: #fff; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .book-new-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
                .refresh-btn { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .refresh-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.1); }
                .bookings-filters { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .filter-btn { background: transparent; border: none; color: var(--text-muted); padding: 0.45rem 1rem; border-radius: 20px; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 0.4rem; }
                .filter-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
                .filter-btn.active { background: rgba(78,205,196,0.15); color: #4ecdc4; font-weight: 600; }
                .filter-count { background: rgba(78,205,196,0.2); color: #4ecdc4; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 10px; font-weight: 700; }
                .loading-state, .error-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; background: rgba(255,255,255,0.02); border-radius: 12px; color: var(--text-muted); text-align: center; border: 1px dashed rgba(255,255,255,0.1); gap: 0.75rem; }
                .error-state h3, .empty-state h3 { margin: 0; color: var(--text-main); }
                .retry-btn { margin-top: 0.5rem; background: rgba(78,205,196,0.15); color: #4ecdc4; border: 1px solid rgba(78,205,196,0.3); padding: 0.5rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .bookings-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
                .booking-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: row; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
                .booking-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.16); }
                .mt-4 { margin-top: 1rem; }
                /* ── Card BK styles ── */
                .bk-card-accent { width: 5px; flex-shrink: 0; }
                .bk-card-body { flex: 1; padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.8rem; min-width: 0; }
                .bk-card-top { display: flex; flex-direction: column; gap: 0.1rem; }
                .bk-card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
                .bk-service-type { font-size: 0.98rem; font-weight: 700; color: var(--text-main); margin: 0; }
                .bk-booking-id { font-size: 0.7rem; color: var(--text-muted); font-family: monospace; margin: 0; }
                .bk-status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.18rem 0.6rem; border-radius: 50px; font-size: 0.68rem; font-weight: 700; border: 1px solid; white-space: nowrap; }
                .badge-yellow { color: #f59e0b; background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); }
                .badge-blue { color: #60a5fa; background: rgba(96,165,250,0.12); border-color: rgba(96,165,250,0.3); }
                .badge-purple { color: #a78bfa; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.3); }
                .badge-green { color: #4ade80; background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.3); }
                .badge-red { color: #f87171; background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); }
                .bk-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem 0.75rem; }
                .bk-info-item { display: flex; align-items: flex-start; gap: 0.35rem; color: var(--text-muted); font-size: 0.8rem; line-height: 1.4; }
                .bk-info-icon { opacity: 0.5; flex-shrink: 0; margin-top: 1px; }
                .bk-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.7rem; border-top: 1px solid rgba(255,255,255,0.07); margin-top: auto; }
                .bk-details-btn { display: inline-flex; align-items: center; gap: 0.2rem; background: transparent; border: none; color: #4ecdc4; font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; transition: opacity 0.2s; }
                .bk-details-btn:hover { opacity: 0.7; }
                .bk-cancel-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.28rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .bk-cancel-btn:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
                .bk-cancel-btn:disabled { opacity: 0.45; cursor: not-allowed; }
                /* Detail Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
                .booking-detail-modal { background: #1a1f2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px; position: relative; display: flex; flex-direction: column; gap: 1rem; max-height: 90vh; overflow-y: auto; }
                .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .modal-close-btn:hover { background: rgba(255,255,255,0.12); color: var(--text-main); }
                .detail-modal-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0; padding-right: 2.5rem; }
                .detail-grid { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; }
                .detail-row { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.9rem; }
                .detail-label { color: var(--text-muted); flex-shrink: 0; }
                .detail-value { color: var(--text-main); text-align: right; word-break: break-word; }
                .detail-value.primary { color: #4ecdc4; font-weight: 600; }
                .detail-value.mono { font-family: monospace; }
                .modal-close-action { width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-main); cursor: pointer; font-weight: 600; transition: all 0.2s; margin-top: 0.5rem; }
                .modal-close-action:hover { background: rgba(255,255,255,0.1); }
                @media (max-width: 640px) {
                    .bookings-list { grid-template-columns: 1fr; }
                    .bk-info-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default MyBookings;
