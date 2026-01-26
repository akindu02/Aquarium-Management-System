import React, { useState } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

    // Dummy Data
    const bookings = [
        {
            id: 'BK-2023-001',
            serviceType: 'Tank Cleaning (Standard)',
            date: '2023-11-15',
            time: '10:00 AM',
            address: '123 Main St, Colombo',
            status: 'upcoming',
            price: 2500,
            technician: 'Assigned Soon'
        },
        {
            id: 'BK-2023-002',
            serviceType: 'Water Quality Test',
            date: '2023-11-20',
            time: '02:00 PM',
            address: '123 Main St, Colombo',
            status: 'pending',
            price: 1500,
            technician: 'Pending'
        },
        {
            id: 'BK-2023-003',
            serviceType: 'Filter Installation',
            date: '2023-10-10',
            time: '09:30 AM',
            address: '123 Main St, Colombo',
            status: 'completed',
            price: 3000,
            technician: 'Kamal Perera'
        },
        {
            id: 'BK-2023-004',
            serviceType: 'Regular Maintenance',
            date: '2023-09-25',
            time: '11:00 AM',
            address: '123 Main St, Colombo',
            status: 'cancelled',
            price: 2500,
            technician: 'N/A'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'upcoming': return <Clock size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return booking.status === 'upcoming' || booking.status === 'pending';
        return booking.status === filter;
    });

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <div>
                    <h2 className="page-title">My Bookings</h2>
                    <p className="page-subtitle">Manage your service appointments</p>
                </div>
                <button className="book-new-btn" onClick={() => navigate('/services')}>
                    <Plus size={18} />
                    Book New Service
                </button>
            </div>

            {/* Filters */}
            <div className="bookings-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Bookings
                </button>
                <button
                    className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
                <button
                    className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            {/* Bookings List */}
            <div className="bookings-list">
                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <h3>No bookings found</h3>
                        <p>You don't have any bookings in this category.</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-main-info">
                                <div className="booking-header-row">
                                    <h3 className="service-type">{booking.serviceType}</h3>
                                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                                        {getStatusIcon(booking.status)}
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>
                                <div className="booking-id">ID: {booking.id}</div>

                                <div className="booking-details-grid">
                                    <div className="detail-item">
                                        <Calendar size={16} className="detail-icon" />
                                        <span>{booking.date}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Clock size={16} className="detail-icon" />
                                        <span>{booking.time}</span>
                                    </div>
                                    <div className="detail-item address">
                                        <MapPin size={16} className="detail-icon" />
                                        <span>{booking.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-actions">

                                {(booking.status === 'upcoming' || booking.status === 'pending') && (
                                    <button className="cancel-btn">Cancel Booking</button>
                                )}
                                <button className="details-btn">
                                    View Details <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .bookings-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .bookings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .page-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-top: 0.25rem;
                }

                .book-new-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .book-new-btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                }

                /* Filters */
                .bookings-filters {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .filter-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .filter-btn:hover {
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.05);
                }

                .filter-btn.active {
                    background: rgba(78, 205, 196, 0.15);
                    color: var(--color-primary);
                    font-weight: 600;
                }

                /* Bookings List */
                .bookings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .booking-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    transition: all 0.2s;
                }

                .booking-card:hover {
                    border-color: rgba(78, 205, 196, 0.3);
                    background: rgba(255, 255, 255, 0.05);
                }

                .booking-main-info {
                    flex: 1;
                }

                .booking-header-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }

                .service-type {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0;
                }

                .booking-id {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    font-family: monospace;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border: 1px solid;
                }

                .booking-details-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .detail-icon {
                    opacity: 0.7;
                }

                /* Actions Side */
                .booking-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.75rem;
                    min-width: 150px;
                }

                .price-tag {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .cancel-btn {
                    background: transparent;
                    color: #ef4444;
                    border: 1px solid #ef4444;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                .details-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    background: transparent;
                    color: var(--text-muted);
                    border: none;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .details-btn:hover {
                    color: var(--text-main);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    color: var(--text-muted);
                    text-align: center;
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .empty-state h3 {
                    margin: 1rem 0 0.5rem 0;
                    color: var(--text-main);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .booking-card {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .booking-actions {
                        width: 100%;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    
                    .booking-header-row {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyBookings;
