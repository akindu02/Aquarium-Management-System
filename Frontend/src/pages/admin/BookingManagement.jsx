import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Check, X, Clock, Eye, AlertCircle, MapPin, User, ChevronDown, CheckCircle, Plus, Trash2, Pencil, Wrench, Sparkles, Hammer } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiRequest } from '../../utils/api';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedBooking, setSelectedBooking] = useState(null); // For Modal

    // New State for Time Slot Management
    const [viewMode, setViewMode] = useState('bookings'); // 'bookings' or 'slots'
    const [managedSlots, setManagedSlots] = useState([
        { id: 1, service: 'Maintenance', date: '2026-01-28', start: '09:00', end: '11:00', status: 'Available' },
        { id: 2, service: 'Cleaning', date: '2026-01-29', start: '13:00', end: '16:00', status: 'Booked' },
    ]);
    const [newSlot, setNewSlot] = useState({
        service: 'Maintenance',
        date: '',
        start: '',
        end: ''
    });

    const [editSlot, setEditSlot] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Time Slot Filters
    const [slotSearchTerm, setSlotSearchTerm] = useState('');
    const [filterSlotService, setFilterSlotService] = useState('All');
    const [filterSlotStatus, setFilterSlotStatus] = useState('All');
    const [filterSlotDate, setFilterSlotDate] = useState('');

    useEffect(() => {
        fetchTimeSlots();
        fetchBookings();
        
        // Check expired slots every minute
        const interval = setInterval(() => {
            checkAndUpdateExpiredSlots();
        }, 60000); // Check every 60 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check expired slots whenever managedSlots changes
        if (managedSlots.length > 0) {
            checkAndUpdateExpiredSlots();
        }
    }, [managedSlots]);

    const fetchTimeSlots = async () => {
        try {
            const data = await apiRequest('/bookings/slots');
            if (data.success) {
                setManagedSlots(data.data);
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    };

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const data = await apiRequest('/bookings');
            if (data.success) {
                // Map DB fields to UI fields
                const mapped = data.data.map(b => ({
                    id: `BK-${String(b.booking_id).padStart(4, '0')}`,
                    booking_id: b.booking_id,
                    customer: b.customer_name || 'Unknown',
                    email: b.customer_email || '',
                    phone: b.service_phone || '',
                    service: b.service_type || '',
                    serviceType: b.service_type || '',
                    date: b.start_time
                        ? new Date(b.start_time).toLocaleDateString('en-CA')
                        : new Date(b.booking_date).toLocaleDateString('en-CA'),
                    time: b.start_time
                        ? `${new Date(b.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                        : '',
                    location: [b.service_address, b.service_city].filter(Boolean).join(', ') || '—',
                    status: b.status,
                    notes: b.notes || '',
                    created: new Date(b.created_at).toLocaleDateString('en-CA'),
                    price: b.base_price ? parseFloat(b.base_price) : null,
                }));
                setBookings(mapped);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const checkAndUpdateExpiredSlots = async () => {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

        const expiredSlots = managedSlots.filter(slot => {
            // Only check slots that are "Available" (not booked)
            if (slot.status !== 'Available') return false;

            // Check if the slot date is before today
            if (slot.date < currentDate) return true;

            // If slot date is today, check if end time has passed
            if (slot.date === currentDate && slot.end <= currentTime) return true;

            return false;
        });

        // Update expired slots to "Unavailable"
        if (expiredSlots.length > 0) {
            for (const slot of expiredSlots) {
                try {
                    await apiRequest(`/bookings/slots/${slot.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            ...slot,
                            status: 'Unavailable'
                        })
                    });
                } catch (error) {
                    console.error(`Error updating expired slot ${slot.id}:`, error);
                }
            }
            // Refresh the slots list after updating
            fetchTimeSlots();
        }
    };

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.start || !newSlot.end) return;

        if (newSlot.date < getTodayDate()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Date',
                text: 'You cannot add time slots for past dates. Please select today or a future date.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4'
            });
            return;
        }

        if (newSlot.end <= newSlot.start) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Time Range',
                text: 'End time must be after the start time.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4'
            });
            return;
        }

        try {
            const data = await apiRequest('/bookings/slots', {
                method: 'POST',
                body: JSON.stringify(newSlot)
            });

            if (data.success) {
                fetchTimeSlots();
                setNewSlot({ ...newSlot, date: '', start: '', end: '' }); // Reset form
                Swal.fire({
                    icon: 'success',
                    title: 'Time Slot Added!',
                    text: 'The new time slot has been created successfully.',
                    background: '#1a1f2e',
                    color: '#fff',
                    confirmButtonColor: '#4ecdc4',
                    timer: 2000,
                    showConfirmButton: false,
                });
                setViewMode('slots'); // Switch to slots view
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add time slot.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#f71a1a'
            });
        }
    };

    const handleDeleteSlot = (id) => {
        Swal.fire({
            title: 'Remove Time Slot?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel',
            background: '#1a1f2e',
            color: '#fff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = await apiRequest(`/bookings/slots/${id}`, {
                        method: 'DELETE'
                    });
                    if (data.success) {
                        setManagedSlots(managedSlots.filter(slot => slot.id !== id));
                        Swal.fire({
                            icon: 'success',
                            title: 'Removed!',
                            text: 'Time slot has been deleted.',
                            background: '#1a1f2e',
                            color: '#fff',
                            confirmButtonColor: '#4ecdc4',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                } catch (error) {
                    console.error('Error deleting slot:', error);
                }
            }
        });
    };

    const handleEditSlot = (slot) => {
        setEditSlot({ ...slot });
        setShowEditModal(true);
    };

    const handleUpdateSlot = async (e) => {
        e.preventDefault();

        if (editSlot.date < getTodayDate()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Date',
                text: 'You cannot set a time slot to a past date. Please select today or a future date.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4'
            });
            return;
        }

        if (editSlot.end <= editSlot.start) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Time Range',
                text: 'End time must be after the start time.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4'
            });
            return;
        }

        try {
            const data = await apiRequest(`/bookings/slots/${editSlot.id}`, {
                method: 'PUT',
                body: JSON.stringify(editSlot)
            });
            if (data.success) {
                fetchTimeSlots();
                setShowEditModal(false);
                setEditSlot(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Slot Updated!',
                    text: 'The time slot has been updated successfully.',
                    background: '#1a1f2e',
                    color: '#fff',
                    confirmButtonColor: '#4ecdc4',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.message || 'Failed to update time slot.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#f71a1a'
            });
        }
    };

    // Status Badge Colors
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':     return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '#f59e0b' };
            case 'Confirmed':   return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '#3b82f6' };
            case 'In Progress': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '#a855f7' };
            case 'Completed':   return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b981' };
            case 'Cancelled':   return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '#9ca3af' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '#fff' };
        }
    };

    // Filter Logic (serviceType is now the raw service_type string from DB)
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = filterService === 'All' || (b.serviceType || '').toLowerCase().includes(filterService.toLowerCase());
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesService && matchesStatus;
    });

    // Time Slot Filter Logic
    const filteredSlots = managedSlots.filter(slot => {
        const matchesSearch = slot.service.toLowerCase().includes(slotSearchTerm.toLowerCase()) ||
            slot.date.includes(slotSearchTerm.toLowerCase());
        const matchesService = filterSlotService === 'All' || slot.service === filterSlotService;
        const matchesStatus = filterSlotStatus === 'All' || slot.status === filterSlotStatus;
        const matchesDate = !filterSlotDate || slot.date === filterSlotDate;
        return matchesSearch && matchesService && matchesStatus && matchesDate;
    });

    // Actions — call API then update local state
    const updateStatus = async (id, uiStatus) => {
        // Map UI action labels to DB enum values
        const DB_STATUS_MAP = {
            Accepted:    'Confirmed',
            Rejected:    'Cancelled',
            Confirmed:   'Confirmed',
            'In Progress': 'In Progress',
            Completed:   'Completed',
            Cancelled:   'Cancelled',
        };
        const dbStatus = DB_STATUS_MAP[uiStatus] || uiStatus;
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;
        try {
            await apiRequest(`/bookings/${booking.booking_id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: dbStatus }),
            });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: dbStatus } : b));
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: err.message || 'Could not update booking status.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
            });
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterService('All');
        setFilterStatus('All');
    };

    const clearSlotFilters = () => {
        setSlotSearchTerm('');
        setFilterSlotService('All');
        setFilterSlotStatus('All');
        setFilterSlotDate('');
    };

    // Modal Content
    const renderModal = () => {
        if (!selectedBooking) return null;
        const statusStyle = getStatusStyle(selectedBooking.status);

        return (
            <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Booking Details</h3>
                        <button className="modal-close" onClick={() => setSelectedBooking(null)}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        <div className="detail-header">
                            <div>
                                <h2 className="detail-id">{selectedBooking.id}</h2>
                                <span className="status-badge large" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                    {selectedBooking.status}
                                </span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-section">
                                <h4><User size={16} /> Customer Info</h4>
                                <p><strong>Name:</strong> {selectedBooking.customer}</p>
                                <p><strong>Email:</strong> {selectedBooking.email}</p>
                                <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                            </div>
                            <div className="detail-section">
                                <h4><MapPin size={16} /> Location & Service</h4>
                                <p><strong>Address:</strong> {selectedBooking.location}</p>
                                <p><strong>Service:</strong> {selectedBooking.service}</p>
                                <p><strong>Tank Info:</strong> {selectedBooking.tankSize}</p>
                            </div>
                            <div className="detail-section">
                                <h4><Clock size={16} /> Timing</h4>
                                <p><strong>Date:</strong> {selectedBooking.date}</p>
                                <p><strong>Slot:</strong> {selectedBooking.time}</p>
                                <p><strong>Created:</strong> {selectedBooking.created}</p>
                            </div>
                            <div className="detail-section">
                                <h4><AlertCircle size={16} /> Notes</h4>
                                <p className="notes-text">{selectedBooking.notes}</p>
                            </div>
                        </div>

                        {selectedBooking.status === 'Pending' && (
                            <div className="modal-actions-footer">
                                <button className="btn-reject" onClick={() => { updateStatus(selectedBooking.id, 'Cancelled'); setSelectedBooking(null); }}>Cancel</button>
                                <button className="btn-accept" onClick={() => { updateStatus(selectedBooking.id, 'Confirmed'); setSelectedBooking(null); }}>Confirm Booking</button>
                            </div>
                        )}
                        {selectedBooking.status === 'Confirmed' && (
                            <div className="modal-actions-footer">
                                <button className="btn-complete" onClick={() => { updateStatus(selectedBooking.id, 'In Progress'); setSelectedBooking(null); }}>Mark In Progress</button>
                            </div>
                        )}
                        {selectedBooking.status === 'In Progress' && (
                            <div className="modal-actions-footer">
                                <button className="btn-complete" onClick={() => { updateStatus(selectedBooking.id, 'Completed'); setSelectedBooking(null); }}>Mark Completed</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="booking-management">
            <div className="bm-header">
                <div>
                    <h2 className="bm-title">Bookings</h2>
                    <p className="bm-subtitle">Manage service requests and schedules</p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bm-toolbar">
                <div className="bm-tabs">
                    <button
                        className={`bm-tab ${viewMode === 'bookings' ? 'active' : ''}`}
                        onClick={() => setViewMode('bookings')}
                    >
                        Booking Requests
                    </button>
                    <button
                        className={`bm-tab ${viewMode === 'slots' ? 'active' : ''}`}
                        onClick={() => setViewMode('slots')}
                    >
                        Manage Time Slots
                    </button>
                    <button
                        className={`bm-tab ${viewMode === 'add-slot' ? 'active' : ''}`}
                        onClick={() => setViewMode('add-slot')}
                    >
                        Add New Time Slot
                    </button>
                </div>

                {viewMode === 'bookings' && (
                    <div className="bm-filter-group">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search Customer or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="select-wrapper">
                            <select value={filterService} onChange={e => setFilterService(e.target.value)}>
                                <option value="All">All Services</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Installation">Installation</option>
                                <option value="Setup">Setup</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        <div className="select-wrapper">
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        <button className="btn-clear" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}

                {viewMode === 'slots' && (
                    <div className="bm-filter-group">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search Service or Date..."
                                value={slotSearchTerm}
                                onChange={e => setSlotSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="select-wrapper">
                            <select value={filterSlotService} onChange={e => setFilterSlotService(e.target.value)}>
                                <option value="All">All Services</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Installation">Installation</option>
                                <option value="Setup">Setup</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        <div className="select-wrapper">
                            <select value={filterSlotStatus} onChange={e => setFilterSlotStatus(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Available">Available</option>
                                <option value="Booked">Booked</option>
                                <option value="Under Process">Under Process</option>
                                <option value="Completed">Completed</option>
                                <option value="Unavailable">Unavailable</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        <div className="date-input">
                            <span className="date-label">Date:</span>
                            <input
                                type="date"
                                value={filterSlotDate}
                                onChange={e => setFilterSlotDate(e.target.value)}
                            />
                        </div>

                        <button className="btn-clear" onClick={clearSlotFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {viewMode === 'bookings' ? (
                <div className="bm-table-container">
                    <table className="bm-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Date & Time</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(booking => {
                                const statusStyle = getStatusStyle(booking.status);
                                return (
                                    <tr key={booking.id}>
                                        <td className="font-mono">{booking.id}</td>
                                        <td>
                                            <div className="td-customer">
                                                <div className="td-avatar">{booking.customer[0]}</div>
                                                <span>{booking.customer}</span>
                                            </div>
                                        </td>
                                        <td>{booking.service}</td>
                                        <td>
                                            <div className="td-datetime">
                                                <span>{booking.date}</span>
                                                <small>{booking.time}</small>
                                            </div>
                                        </td>
                                        <td className="truncate-cell" title={booking.location}>{booking.location}</td>
                                        <td>
                                            <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn-icon view" title="View Details" onClick={() => setSelectedBooking(booking)}>
                                                    <Eye size={16} />
                                                </button>

                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button className="btn-icon accept" title="Confirm" onClick={() => updateStatus(booking.id, 'Confirmed')}>
                                                            <Check size={16} />
                                                        </button>
                                                        <button className="btn-icon reject" title="Cancel" onClick={() => updateStatus(booking.id, 'Cancelled')}>
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === 'Confirmed' && (
                                                    <button className="btn-icon complete" title="Mark In Progress" onClick={() => updateStatus(booking.id, 'In Progress')}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}

                                                {booking.status === 'In Progress' && (
                                                    <button className="btn-icon complete" title="Mark Completed" onClick={() => updateStatus(booking.id, 'Completed')}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : viewMode === 'add-slot' ? (
                <div className="add-slot-view-container">
                    <div className="add-slot-panel" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        <h3>Add New Time Slot</h3>
                        <form onSubmit={handleAddSlot} className="slot-form">
                            <div className="form-group">
                                <label>Service Type</label>
                                <div className="select-wrapper">
                                    <select
                                        value={newSlot.service}
                                        onChange={e => setNewSlot({ ...newSlot, service: e.target.value })}
                                    >
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Installation">Installation</option>

                                    </select>
                                    <ChevronDown size={14} className="select-arrow" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newSlot.date}
                                    min={getTodayDate()}
                                    onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={newSlot.start}
                                        onChange={e => setNewSlot({ ...newSlot, start: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={newSlot.end}
                                        onChange={e => setNewSlot({ ...newSlot, end: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-add-slot">
                                <Plus size={18} /> Add Slot
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="slots-view-container">
                    <div className="slots-list-panel">
                        <div className="panel-header">
                            <div>
                                <h3>Existing Time Slots</h3>
                                <p className="panel-subtitle">Manage availability and assigned slots</p>
                            </div>
                            <div className="total-slots-badge">
                                {filteredSlots.length} {filteredSlots.length !== managedSlots.length && `of ${managedSlots.length}`} Slot{filteredSlots.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="slots-table-wrapper nice-scrollbar">
                            <table className="bm-table slot-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Time Range</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSlots.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8">
                                                <div className="empty-state">
                                                    <Calendar size={48} opacity={0.2} />
                                                    <p>{managedSlots.length === 0 ? 'No time slots have been created yet.' : 'No time slots match your filters.'}</p>
                                                    <button 
                                                        className="btn-link"
                                                        onClick={() => managedSlots.length === 0 ? setViewMode('add-slot') : clearSlotFilters()}
                                                    >
                                                        {managedSlots.length === 0 ? 'Create your first slot' : 'Clear filters'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSlots.map(slot => (
                                            <tr key={slot.id} className="slot-row">
                                                <td>
                                                    <div className="service-cell">
                                                        <div className={`service-icon-box ${
                                                            slot.service.toLowerCase().includes('maintenance') ? 'maintenance-icon' :
                                                            slot.service.toLowerCase().includes('clean') ? 'cleaning-icon' :
                                                            slot.service.toLowerCase().includes('installation') ? 'installation-icon' :
                                                            slot.service.toLowerCase().includes('setup') ? 'setup-icon' : ''
                                                        }`}>
                                                            {slot.service.toLowerCase().includes('maintenance') ? <Wrench size={16} /> :
                                                             slot.service.toLowerCase().includes('clean') ? <Sparkles size={16} /> : 
                                                             slot.service.toLowerCase().includes('installation') ? <Hammer size={16} /> :
                                                             slot.service.toLowerCase().includes('setup') ? <Plus size={16} /> : 
                                                             <Clock size={16} />}
                                                        </div>
                                                        <span>{slot.service}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="date-cell">
                                                        <Calendar size={14} className="cell-icon" />
                                                        <span>{slot.date}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="time-cell">
                                                        <Clock size={14} className="cell-icon" />
                                                        <span>{slot.start} - {slot.end}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${slot.status?.toLowerCase().replace(' ', '-')} modern-badge`}>
                                                        {slot.status === 'Available' && <span className="status-dot green"></span>}
                                                        {slot.status === 'Booked' && <span className="status-dot red"></span>}
                                                        {slot.status === 'Under Process' && <span className="status-dot yellow"></span>}
                                                        {slot.status === 'Completed' && <span className="status-dot blue"></span>}
                                                        {slot.status === 'Unavailable' && <span className="status-dot gray"></span>}
                                                        {slot.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn-icon edit glass-btn"
                                                            title="Edit Slot"
                                                            onClick={() => handleEditSlot(slot)}
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            className="btn-icon reject glass-btn"
                                                            title="Delete Slot"
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Time Slot Modal */}
            {showEditModal && editSlot && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content slot-edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Edit Time Slot</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update the slot details below</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateSlot} className="slot-form">
                                <div className="form-group">
                                    <label>Service Type</label>
                                    <div className="select-wrapper" style={{ display: 'block' }}>
                                        <select
                                            value={editSlot.service}
                                            onChange={e => setEditSlot({ ...editSlot, service: e.target.value })}
                                        >
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Cleaning">Cleaning</option>
                                            <option value="Installation">Installation</option>
                                            <option value="Setup">Setup</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={editSlot.date}
                                        min={getTodayDate()}
                                        onChange={e => setEditSlot({ ...editSlot, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            value={editSlot.start}
                                            onChange={e => setEditSlot({ ...editSlot, start: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="time"
                                            value={editSlot.end}
                                            onChange={e => setEditSlot({ ...editSlot, end: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <div className="select-wrapper" style={{ display: 'block' }}>
                                        <select
                                            value={editSlot.status}
                                            onChange={e => setEditSlot({ ...editSlot, status: e.target.value })}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Booked">Booked</option>
                                            <option value="Under Process">Under Process</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions-footer" style={{ paddingTop: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button type="button" className="btn-reject" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-accept">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {renderModal()}

            <style>{`
                .bm-header {
                    margin-bottom: 2rem;
                }
                .bm-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .bm-subtitle {
                    color: var(--text-muted);
                }

                /* Toolbar */
                .bm-toolbar {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1rem;
                    border-radius: 1rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .bm-filter-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    align-items: center;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0 0.75rem;
                    color: var(--text-muted);
                    width: 220px;
                }

                .search-box input {
                    background: transparent;
                    border: none;
                    padding: 0.6rem;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                }

                .select-wrapper {
                    position: relative;
                }

                .select-arrow {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    color: var(--text-muted);
                }

                select {
                    appearance: none;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0.6rem 2rem 0.6rem 1rem;
                    color: var(--text-main);
                    cursor: pointer;
                    outline: none;
                }

                select:focus {
                    border-color: var(--color-primary);
                }

                .date-input {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0.1rem 0.5rem;
                }

                .date-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-right: 0.5rem;
                }

                .date-input input {
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    padding: 0.5rem 0;
                    outline: none;
                }

                .btn-clear {
                    background: transparent;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    color: var(--text-muted);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-clear:hover {
                    border-color: var(--text-muted);
                    color: var(--text-main);
                }

                /* Table */
                .bm-table-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    overflow-x: auto;
                }

                .bm-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 900px;
                }

                .bm-table th {
                    text-align: left;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .bm-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: var(--text-main);
                    vertical-align: middle;
                }

                .font-mono {
                    font-family: monospace;
                    color: var(--color-primary);
                }

                .td-customer {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 500;
                }

                .td-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .td-datetime {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.9rem;
                }
                
                .td-datetime small {
                    color: var(--text-muted);
                }

                .truncate-cell {
                    max-width: 150px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .td-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-icon.view { background: rgba(255, 255, 255, 0.1); color: var(--text-main); }
                .btn-icon.accept { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .btn-icon.reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .btn-icon.complete { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .btn-icon.edit { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }

                .btn-icon:hover { transform: scale(1.1); }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 200;
                }

                .modal-content {
                    background: #1a1f2e;
                    width: 600px;
                    max-width: 90%;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 { color: var(--text-main); margin: 0; }

                .modal-close {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                }
                .modal-close:hover { color: var(--text-main); }

                .modal-body {
                    padding: 1.5rem;
                }

                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .detail-id { color: var(--color-primary); margin: 0 0 0.5rem 0; font-family: monospace; }
                .detail-price { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }

                .status-badge.large { font-size: 0.9rem; padding: 0.35rem 1rem; }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .detail-section h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }

                .detail-section p {
                    margin: 0.35rem 0;
                    color: var(--text-main);
                    font-size: 0.95rem;
                }

                .notes-text {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-style: italic;
                    color: var(--text-muted) !important;
                }

                .modal-actions-footer {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .btn-reject, .btn-accept, .btn-complete {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                }

                .btn-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
                .btn-accept { background: #10b981; color: white; }
                .btn-complete { background: #3b82f6; color: white; }

                .btn-reject:hover { background: rgba(239, 68, 68, 0.2); }
                .btn-accept:hover { filter: brightness(1.1); }
                
                /* Tabs */
                .bm-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    width: 100%;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 1rem;
                }

                .bm-tab {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1rem;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }

                .bm-tab:hover { color: var(--text-main); }
                
                .bm-tab.active {
                    color: var(--color-primary);
                }

                .bm-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -17px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--color-primary);
                }

                /* Slot Management Styles */
                .slots-view-container, .add-slot-view-container {
                    width: 100%;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 1rem;
                }

                .panel-subtitle {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0.25rem 0 0 0;
                }

                .total-slots-badge {
                    background: rgba(6, 182, 212, 0.1);
                    color: var(--color-primary);
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid rgba(6, 182, 212, 0.2);
                }

                .add-slot-panel, .slots-list-panel {
                    background: linear-gradient(145deg, rgba(20, 24, 39, 0.8) 0%, rgba(15, 18, 30, 0.9) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    overflow: visible;
                }

                .slots-table-wrapper {
                    overflow-x: auto;
                    border-radius: 0.5rem;
                }

                .nice-scrollbar::-webkit-scrollbar { height: 8px; }
                .nice-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
                .nice-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .nice-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                .slot-table { min-width: 800px; }
                .slot-table th { background: rgba(0,0,0,0.2); color: #94a3b8; font-weight: 600; padding: 1.2rem 1rem; }
                .slot-table td { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .slot-row { transition: all 0.2s; }
                .slot-row:hover { background: rgba(255,255,255,0.02); }

                .service-cell { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
                .service-icon-box { 
                    width: 32px; height: 32px; 
                    border-radius: 8px; 
                    background: rgba(255,255,255,0.05); 
                    display: flex; align-items: center; justify-content: center;
                    color: var(--color-primary);
                }

                /* Service Type Specific Icons */
                .maintenance-icon {
                    background: rgba(251, 191, 36, 0.1);
                    color: #fbbf24;
                }

                .cleaning-icon {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                }

                .installation-icon {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .setup-icon {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }

                .date-cell, .time-cell { display: flex; align-items: center; gap: 0.5rem; color: #cbd5e1; }
                .cell-icon { color: #64748b; }

                .modern-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.85rem;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-dot { width: 6px; height: 6px; border-radius: 50%; }
                .status-dot.green { background: #10b981; box-shadow: 0 0 8px #10b981; }
                .status-dot.red { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
                .status-dot.yellow { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
                .status-dot.gray { background: #9ca3af; }
                .status-dot.blue { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; } /* Added for Completed */

                .glass-btn {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .glass-btn:hover { background: rgba(255,255,255,0.1); }

                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; color: var(--text-muted); }
                .empty-state p { margin: 1rem 0; font-size: 1.1rem; }
                .btn-link { background: none; border: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; font-weight: 500; }

                .add-slot-panel h3 {
                    margin-top: 0;
                    margin-bottom: 2rem;
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .slots-list-panel h3 {
                    margin-top: 0;
                    margin-bottom: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .slot-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .slot-form label {
                    display: block;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }

                .slot-form input, .slot-form select {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 1rem;
                    color: white;
                    outline: none;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    color-scheme: dark; /* Forces browser date/time pickers to use dark theme */
                }
                
                .slot-form select option {
                    background-color: #1a1f2e;
                    color: white;
                    padding: 10px;
                }

                .slot-form input:focus, .slot-form select:focus { 
                    border-color: var(--color-primary); 
                    background: rgba(0, 0, 0, 0.4);
                    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .btn-add-slot {
                    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 1rem;
                    letter-spacing: 0.5px;
                    box-shadow: 0 10px 20px -5px rgba(6, 182, 212, 0.4);
                }

                .btn-add-slot:hover { 
                    filter: brightness(1.1); 
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px -5px rgba(6, 182, 212, 0.5);
                }

                .btn-add-slot:active {
                    transform: translateY(-1px);
                }

                .status-badge.available { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .status-badge.booked { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .status-badge.under-process { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.completed { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.maintenance { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.unavailable { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

                .slot-edit-modal { max-width: 520px !important; }
                .slot-edit-modal .modal-body { padding: 1.5rem; }
                .slot-form .form-group { margin-bottom: 0; }
                .slot-form .select-wrapper select { width: 100%; padding: 0.9rem 2.5rem 0.9rem 1rem; border-radius: 0.75rem; }

                .text-center { text-align: center; color: var(--text-muted); }

                @media (max-width: 1024px) {
                    .add-slot-panel, .slots-list-panel {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingManagement;
