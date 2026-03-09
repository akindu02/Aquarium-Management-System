import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Check, X, Clock, Eye, AlertCircle, MapPin, User, ChevronDown, CheckCircle, Plus, Trash2, Pencil } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiRequest } from '../../utils/api';

const BookingManagement = () => {
    // Dummy Data
    const initialBookings = [
        { id: 'BK-1001', customer: 'Kasun Perera', email: 'kasun@gmail.com', phone: '0712345678', service: 'Aquarium Maintenance', serviceType: 'Maintenance', date: '2025-10-15', time: '10:00 - 12:00', location: '123 Beach Rd, Matara', price: 3500, status: 'Pending', assignedTo: 'Unassigned', notes: 'Tank has algae issue', tankSize: '50 Gallon', created: '2025-10-10' },
        { id: 'BK-1002', customer: 'Nimali Silva', email: 'nimali@yahoo.com', phone: '0765432109', service: 'Deep Cleaning', serviceType: 'Cleaning', date: '2025-10-16', time: '14:00 - 16:00', location: '45 Galle Rd, Colombo', price: 5500, status: 'Accepted', assignedTo: 'Kamal Perera', notes: 'Fragile corals present', tankSize: '100 Gallon', created: '2025-10-11' },
        { id: 'BK-1003', customer: 'Saman Kumara', email: 'saman@hotmail.com', phone: '0771122334', service: 'Fish Tank Setup', serviceType: 'Setup', date: '2025-10-17', time: '09:00 - 13:00', location: '88 Main St, Kandy', price: 12000, status: 'Completed', assignedTo: 'Nimal Silva', notes: 'New installation', tankSize: '30 Gallon', created: '2025-10-09' },
        { id: 'BK-1004', customer: 'Chathuri Bandara', email: 'chathuri@gmail.com', phone: '0755566778', service: 'Filter Replacement', serviceType: 'Maintenance', date: '2025-10-18', time: '11:00 - 12:00', location: '12 Flower Rd, Galle', price: 2500, status: 'Cancelled', assignedTo: '-', notes: 'Customer cancelled via call', tankSize: '20 Gallon', created: '2025-10-12' },
        { id: 'BK-1005', customer: 'Ruwan Dissanayake', email: 'ruwan@outlook.com', phone: '0709988776', service: 'Water Testing', serviceType: 'Maintenance', date: '2025-10-19', time: '15:30 - 16:00', location: '56 Lake Dr, Nuwara Eliya', price: 1500, status: 'Rejected', assignedTo: '-', notes: 'Out of service area', tankSize: 'N/A', created: '2025-10-13' },
        { id: 'BK-1006', customer: 'Dilshan Fernando', email: 'dilshan@gmail.com', phone: '0722233445', service: 'Aquarium Maintenance', serviceType: 'Maintenance', date: '2025-10-20', time: '08:00 - 10:00', location: '78 Hill St, Badulla', price: 3500, status: 'Pending', assignedTo: 'Unassigned', notes: 'Check pump noise', tankSize: '75 Gallon', created: '2025-10-14' },
        { id: 'BK-1007', customer: 'Anoma Rathnayake', email: 'anoma@yahoo.com', phone: '0788899000', service: 'Deep Cleaning', serviceType: 'Cleaning', date: '2025-10-21', time: '13:00 - 16:00', location: '34 Sea view, Negombo', price: 6000, status: 'Pending', assignedTo: 'Unassigned', notes: 'Needs urgent cleaning', tankSize: '120 Gallon', created: '2025-10-15' },
        { id: 'BK-1008', customer: 'Mahesh Gunawardena', email: 'mahesh@gmail.com', phone: '0711122233', service: 'Plantation Setup', serviceType: 'Setup', date: '2025-10-22', time: '10:00 - 14:00', location: '90 Garden Ln, Kurunegala', price: 8500, status: 'Accepted', assignedTo: 'Sunil Perera', notes: 'Aquascaping required', tankSize: '60 Gallon', created: '2025-10-16' },
    ];

    const [bookings, setBookings] = useState(initialBookings);
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

    useEffect(() => {
        fetchTimeSlots();
    }, []);

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

    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.start || !newSlot.end) return;

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
            case 'Pending': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '#f59e0b' };
            case 'Accepted': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '#3b82f6' };
            case 'Completed': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b981' };
            case 'Rejected': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '#ef4444' };
            case 'Cancelled': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '#9ca3af' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '#fff' };
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = filterService === 'All' || b.serviceType === filterService;
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesService && matchesStatus;
    });

    // Actions
    const updateStatus = (id, newStatus) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterService('All');
        setFilterStatus('All');
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
                                <button className="btn-reject" onClick={() => { updateStatus(selectedBooking.id, 'Rejected'); setSelectedBooking(null); }}>Reject</button>
                                <button className="btn-accept" onClick={() => { updateStatus(selectedBooking.id, 'Accepted'); setSelectedBooking(null); }}>Accept Booking</button>
                            </div>
                        )}
                        {selectedBooking.status === 'Accepted' && (
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
                                <option value="Accepted">Accepted</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        <button className="btn-clear" onClick={clearFilters}>
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
                                                        <button className="btn-icon accept" title="Accept" onClick={() => updateStatus(booking.id, 'Accepted')}>
                                                            <Check size={16} />
                                                        </button>
                                                        <button className="btn-icon reject" title="Reject" onClick={() => updateStatus(booking.id, 'Rejected')}>
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === 'Accepted' && (
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
                <div className="slot-management-container">
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
                <div className="slot-management-container">
                    <div className="slots-list-panel" style={{ width: '100%' }}>
                        <h3>Existing Slots</h3>
                        <div className="slots-table-wrapper">
                            <table className="bm-table">
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
                                    {managedSlots.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">No slots added yet.</td>
                                        </tr>
                                    ) : (
                                        managedSlots.map(slot => (
                                            <tr key={slot.id}>
                                                <td>{slot.service}</td>
                                                <td>{slot.date}</td>
                                                <td>{slot.start} - {slot.end}</td>
                                                <td>
                                                    <span className={`status-badge ${slot.status?.toLowerCase()}`}>
                                                        {slot.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn-icon edit"
                                                            title="Edit Slot"
                                                            onClick={() => handleEditSlot(slot)}
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            className="btn-icon reject"
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
                                            <option value="Maintenance">Maintenance</option>
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
                .slot-management-container {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .add-slot-panel, .slots-list-panel {
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                .add-slot-panel h3, .slots-list-panel h3 {
                    margin-top: 0;
                    margin-bottom: 2rem;
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
                .status-badge.maintenance { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.unavailable { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

                .slot-edit-modal { max-width: 520px !important; }
                .slot-edit-modal .modal-body { padding: 1.5rem; }
                .slot-form .form-group { margin-bottom: 0; }
                .slot-form .select-wrapper select { width: 100%; padding: 0.9rem 2.5rem 0.9rem 1rem; border-radius: 0.75rem; }

                .text-center { text-align: center; color: var(--text-muted); }

                @media (max-width: 1024px) {
                    .slot-management-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingManagement;
