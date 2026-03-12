import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight, Wrench, Sparkles, Settings, Phone, MapPin, Building, ChevronDown, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { apiRequest } from '../utils/api';
import Swal from 'sweetalert2';
import './ServiceBooking.css';

// ===== DUMMY DATA =====

// Services data
const SERVICES = [
    {
        id: 'maintenance',
        title: 'Aquarium Maintenance',
        description: 'Regular maintenance including water testing, filter cleaning, and health check for your aquatic pets.',
        duration: '2 hours',
        image: '/store/Aquarium Maintenance.jpg',
        icon: Wrench
    },
    {
        id: 'cleaning',
        title: 'Aquarium Cleaning',
        description: 'Thorough cleaning of tank, decorations, substrate, and complete water change for a fresh start.',
        duration: '3 hours',
        image: '/store/Aquarium Cleaning.jpg',
        icon: Sparkles
    },
    {
        id: 'installation',
        title: 'Aquarium Installation',
        description: 'Professional setup of new aquariums including equipment installation and initial cycling.',
        duration: '4 hours',
        image: '/store/Aquarium Installation.jpg',
        icon: Settings
    }
];

// Availability data (staff controls this)
const AVAILABILITY = [
    // Maintenance availability
    {
        date: '2026-01-27', serviceId: 'maintenance', slots: [
            { start: '08:00', end: '10:00', status: 'available' },
            { start: '10:30', end: '12:30', status: 'available' },
            { start: '14:00', end: '16:00', status: 'booked' }
        ]
    },
    {
        date: '2026-01-28', serviceId: 'maintenance', slots: [
            { start: '09:00', end: '11:00', status: 'available' },
            { start: '14:00', end: '16:00', status: 'available' }
        ]
    },
    {
        date: '2026-01-30', serviceId: 'maintenance', slots: [
            { start: '08:00', end: '10:00', status: 'available' },
            { start: '11:00', end: '13:00', status: 'available' }
        ]
    },
    // Cleaning availability
    {
        date: '2026-01-27', serviceId: 'cleaning', slots: [
            { start: '09:00', end: '12:00', status: 'available' }
        ]
    },
    {
        date: '2026-01-29', serviceId: 'cleaning', slots: [
            { start: '08:00', end: '11:00', status: 'available' },
            { start: '13:00', end: '16:00', status: 'available' }
        ]
    },
    {
        date: '2026-02-01', serviceId: 'cleaning', slots: [
            { start: '10:00', end: '13:00', status: 'available' }
        ]
    },
    // Installation availability
    {
        date: '2026-01-28', serviceId: 'installation', slots: [
            { start: '08:00', end: '12:00', status: 'available' }
        ]
    },
    {
        date: '2026-01-31', serviceId: 'installation', slots: [
            { start: '09:00', end: '13:00', status: 'available' },
            { start: '14:00', end: '18:00', status: 'available' }
        ]
    },
    {
        date: '2026-02-02', serviceId: 'installation', slots: [
            { start: '08:00', end: '12:00', status: 'available' }
        ]
    }
];

// ===== SERVICE CARD LIST COMPONENT =====
const ServiceCardList = ({ services, selectedService, onSelectService }) => {
    return (
        <div className="service-cards-grid">
            {services.map(service => {
                return (
                    <div
                        key={service.id}
                        className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                    >
                        {/* Image Banner */}
                        <div className="service-card-media">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="service-card-image"
                            />
                        </div>

                        {/* Card Content */}
                        <div className="service-card-content">
                            <h3 className="service-card-title">{service.title}</h3>
                            <p className="service-card-description">{service.description}</p>
                        </div>

                        {/* Full-width Button */}
                        <button
                            className={`service-book-btn ${selectedService?.id === service.id ? 'active' : ''}`}
                            onClick={() => onSelectService(service)}
                        >
                            {selectedService?.id === service.id ? 'Selected' : 'Book Now'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

// ===== CALENDAR PANEL COMPONENT =====
const CalendarPanel = ({ selectedService, availableDates, selectedDate, onSelectDate }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const formatDateString = (day) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const isPastDay = (day) => {
        if (!day) return false;
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return d < today;
    };

    const isDateAvailable = (day) => {
        if (!day || !selectedService || isPastDay(day)) return false;
        const dateStr = formatDateString(day);
        return availableDates.includes(dateStr);
    };

    const isDateSelected = (day) => {
        if (!day) return false;
        return formatDateString(day) === selectedDate;
    };

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        if (prevMonth >= thisMonth) {
            setCurrentMonth(prevMonth);
        }
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="calendar-panel">
            <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={handlePrevMonth}>
                    <ChevronLeft size={20} />
                </button>
                <h3 className="calendar-month">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button className="calendar-nav-btn" onClick={handleNextMonth}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="calendar-day-names">
                {dayNames.map(day => (
                    <div key={day} className="day-name">{day}</div>
                ))}
            </div>

            <div className="calendar-days">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${!day ? 'empty' : ''}
                            ${day && isPastDay(day) ? 'past' : ''}
                            ${isDateAvailable(day) ? 'available' : (!day || isPastDay(day) ? '' : 'unavailable')}
                            ${isDateSelected(day) ? 'selected' : ''}`}
                        onClick={() => day && !isPastDay(day) && isDateAvailable(day) && onSelectDate(formatDateString(day))}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {!selectedService && (
                <div className="calendar-message">
                    <Calendar size={24} />
                    <p>Select a service to view available dates</p>
                </div>
            )}
        </div>
    );
};

// ===== SLOT LIST COMPONENT =====
const SlotList = ({ slots, selectedService, selectedDate, onSelectSlot }) => {
    if (!selectedService) {
        return (
            <div className="slot-list-empty">
                <Clock size={32} />
                <h4>No Service Selected</h4>
                <p>Please select a service from above to view available time slots.</p>
            </div>
        );
    }

    if (!selectedDate) {
        return (
            <div className="slot-list-empty">
                <Calendar size={32} />
                <h4>Select a Date</h4>
                <p>Choose an available date from the calendar to see time slots.</p>
            </div>
        );
    }

    const availableSlots = slots.filter(s => s.status === 'available');

    if (availableSlots.length === 0) {
        return (
            <div className="slot-list-empty">
                <X size={32} />
                <h4>No Slots Available</h4>
                <p>No available time slots for this date. Please try another date.</p>
            </div>
        );
    }

    return (
        <div className="slot-list">
            <h4 className="slot-list-title">Available Time Slots</h4>
            <p className="slot-list-subtitle">
                {selectedService.title} on {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                })}
            </p>
            <div className="slots-grid">
                {availableSlots.map((slot, index) => (
                    <div key={index} className="slot-card" onClick={() => onSelectSlot(slot)}>
                        <div className="slot-time">
                            <Clock size={16} />
                            {slot.start} - {slot.end}
                        </div>
                        <button className="slot-book-btn">Book</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ===== UPCOMING BOOKINGS COMPONENT =====
const UpcomingBookings = ({ bookings, services, onCancelBooking }) => {
    if (bookings.length === 0) {
        return (
            <div className="upcoming-bookings">
                <h4 className="upcoming-title">Your Bookings</h4>
                <div className="no-bookings">
                    <p>No upcoming bookings yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="upcoming-bookings">
            <h4 className="upcoming-title">Your Bookings</h4>
            <div className="bookings-list">
                {bookings.map((booking, index) => {
                    const service = services.find(s => s.id === booking.serviceId);
                    return (
                        <div key={index} className="booking-card">
                            <div className="booking-status">Confirmed</div>
                            <h5 className="booking-service">{service?.title}</h5>
                            <div className="booking-details">
                                <span>
                                    <Calendar size={14} />
                                    {new Date(booking.date).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </span>
                                <span>
                                    <Clock size={14} />
                                    {booking.slot.start} - {booking.slot.end}
                                </span>
                            </div>
                            <button
                                className="cancel-booking-btn"
                                onClick={() => onCancelBooking(index)}
                            >
                                Cancel
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ===== BOOKING MODAL COMPONENT =====
const BookingModal = ({ isOpen, service, date, slot, onConfirm, onClose, isStaffView = false }) => {
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});

    const MATARA_CITIES = [
        'Matara', 'Weligama', 'Dickwella', 'Hakmana', 'Akuressa',
        'Kamburugamuwa', 'Kamburupitiya', 'Deniyaya', 'Devinuwara', 'Kekanadura'
    ];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCustomerName('');
            setPhone('');
            setCity('');
            setAddress('');
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const newErrors = {};
        if (isStaffView && !customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!phone.trim()) newErrors.phone = 'Phone number is required';
        if (!city) newErrors.city = 'Please select a city (Matara District only)';
        if (!address.trim()) newErrors.address = 'Address is required';
        
        // Basic phone validation
        if (phone.trim() && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const details = { phone, city, address };
        if (isStaffView) details.customer_name = customerName;
        onConfirm(details);
    };

    return (
        <div className="modal-overlay glass-overlay" onClick={onClose}>
            <div className="booking-modal glass-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="modal-icon-wrapper">
                    <div className="modal-icon modern-icon">
                        <Check size={32} />
                    </div>
                </div>
                <h3>{isStaffView ? 'Walk-in Booking' : 'Confirm Your Booking'}</h3>
                
                <div className="modal-details modern-details">
                    <div className="modal-detail-row">
                        <span>Service:</span>
                        <strong>{service?.title}</strong>
                    </div>
                    <div className="modal-detail-row">
                        <span>Date:</span>
                        <strong>{date && new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                        })}</strong>
                    </div>
                    <div className="modal-detail-row">
                        <span>Time:</span>
                        <strong>{slot?.start} - {slot?.end}</strong>
                    </div>
                </div>

                {isStaffView && (
                    <div className="modal-input-group" style={{ marginBottom: '1rem' }}>
                        <label className="modal-label">Customer Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                className="modal-input with-icon"
                                placeholder="Enter customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                        {errors.customerName && <p className="input-error">{errors.customerName}</p>}
                    </div>
                )}

                <div className="modal-form-grid">
                    <div className="modal-input-group">
                        <label className="modal-label">Phone Number</label>
                        <div className="input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input
                                type="tel"
                                className="modal-input with-icon"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        {errors.phone && <p className="input-error">{errors.phone}</p>}
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">City (Matara District)</label>
                        <div className="input-wrapper select-wrapper-modern">
                            <Building size={18} className="input-icon" />
                            <select
                                className="modal-input with-icon custom-select"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="" disabled>Select your city...</option>
                                {MATARA_CITIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="select-arrow-icon" />
                        </div>
                        {errors.city && <p className="input-error">{errors.city}</p>}
                    </div>
                </div>

                <div className="modal-input-group">
                    <label className="modal-label">Detailed Address</label>
                    <div className="input-wrapper">
                        <MapPin size={18} className="input-icon textarea-icon" />
                        <textarea
                            className="modal-input with-icon"
                            placeholder="Enter your street address"
                            rows="2"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    {errors.address && <p className="input-error">{errors.address}</p>}
                </div>

                <div className="modal-actions mt-6">
                    <button className="btn-cancel modern-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-confirm modern-confirm" onClick={handleConfirm}>Confirm Booking</button>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN SERVICE BOOKING PAGE =====
const ServiceBooking = ({ isStaffView = false }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availabilityData, setAvailabilityData] = useState(AVAILABILITY); // Fallback to dummy data initially

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const fetchTimeSlots = async () => {
        try {
            const data = await apiRequest('/bookings/slots');
            if (data.success) {
                // Group slots by date and service
                const grouped = {};
                
                data.data.forEach(slot => {
                    const serviceId = slot.service.toLowerCase(); // Map 'Maintenance' to 'maintenance'
                    const date = slot.date;
                    
                    const key = `${serviceId}-${date}`;
                    if (!grouped[key]) {
                        grouped[key] = {
                            date,
                            serviceId,
                            slots: []
                        };
                    }
                    
                    grouped[key].slots.push({
                        id: slot.id,
                        start: slot.start,
                        end: slot.end,
                        status: slot.status.toLowerCase() // map 'Available' to 'available'
                    });
                });
                
                // If there are actual slots from DB, replace the dummy data or merge
                if (data.data.length > 0) {
                    setAvailabilityData(Object.values(grouped));
                }
            }
        } catch (error) {
            console.error("Failed to fetch slots from DB:", error);
        }
    };

    // Get available dates for selected service (today and future only)
    const getAvailableDates = () => {
        if (!selectedService) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        return availabilityData
            .filter(a => a.serviceId === selectedService.id)
            .filter(a => a.date >= todayStr)
            .filter(a => a.slots.some(s => s.status === 'available'))
            .map(a => a.date);
    };

    // Get slots for selected date
    const getSlotsForDate = () => {
        if (!selectedService || !selectedDate) return [];
        const availability = availabilityData.find(
            a => a.serviceId === selectedService.id && a.date === selectedDate
        );
        return availability?.slots || [];
    };

    const navigate = useNavigate();
    const location = useLocation();

    // Check for returned state from login
    useEffect(() => {
        if (location.state?.serviceId) {
            const service = SERVICES.find(s => s.id === location.state.serviceId);
            if (service) {
                setSelectedService(service);
            }
        }
    }, [location.state]);

    const handleSelectService = (service) => {
        if (!isStaffView && !isAuthenticated()) {
            navigate('/signin', {
                state: {
                    from: location.pathname,
                    serviceId: service.id
                }
            });
            return;
        }
        setSelectedService(service);
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
        setShowModal(true);
    };

    const handleConfirmBooking = async (bookingDetails) => {
        try {
            const endpoint = isStaffView ? '/bookings/walk-in' : '/bookings';
            const payload = {
                slot_id: selectedSlot.id,
                phone: bookingDetails.phone,
                city: bookingDetails.city,
                address: bookingDetails.address,
            };
            if (isStaffView) payload.customer_name = bookingDetails.customer_name;

            const data = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (data.success) {
                // Mark the booked slot as unavailable in local state so calendar refreshes
                setAvailabilityData(prev =>
                    prev.map(avail => {
                        if (avail.serviceId === selectedService.id && avail.date === selectedDate) {
                            return {
                                ...avail,
                                slots: avail.slots.map(s =>
                                    s.id === selectedSlot.id ? { ...s, status: 'booked' } : s
                                ),
                            };
                        }
                        return avail;
                    })
                );

                setShowModal(false);
                setSelectedSlot(null);
                setSelectedDate(null);
                setSelectedService(null);

                const statusText = isStaffView ? 'Confirmed' : 'Pending';
                Swal.fire({
                    icon: 'success',
                    title: 'Booking Confirmed!',
                    html: `
                        <p>${isStaffView ? 'Walk-in' : 'Your'} <strong>${data.data.service}</strong> booking is <strong>${statusText}</strong>.</p>
                        <p style="margin-top:8px;font-size:0.9rem;opacity:0.8;">Booking ID: #${data.data.booking_id}</p>
                    `,
                    background: '#1a1f2e',
                    color: '#fff',
                    confirmButtonColor: '#4ecdc4',
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: error.message || 'Unable to complete booking. Please try again.',
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
            });
        }
    };

    const handleCancelBooking = (index) => {
        setBookings(bookings.filter((_, i) => i !== index));
    };

    return (
        <div className={`service-booking-page ${isStaffView ? 'staff-view' : ''}`}>
            <div className="container">
                {/* Header */}
                <div className="booking-header">
                    <h1 className="booking-title">Book a Service</h1>
                    <p className="booking-subtitle">
                        Professional aquarium care services by our expert team
                    </p>
                </div>

                {/* Service Cards Section */}
                <section className="services-section">
                    <h2 className="section-title">Our Services</h2>
                    <ServiceCardList
                        services={SERVICES}
                        selectedService={selectedService}
                        onSelectService={handleSelectService}
                    />
                </section>

                {/* Calendar and Slots Section */}
                <section className="booking-section">
                    <div className="booking-grid">
                        {/* Left: Calendar */}
                        <div className="booking-calendar">
                            <h3 className="panel-title">Select Date</h3>
                            <CalendarPanel
                                selectedService={selectedService}
                                availableDates={getAvailableDates()}
                                selectedDate={selectedDate}
                                onSelectDate={handleSelectDate}
                            />
                        </div>

                        {/* Right: Slots */}
                        <div className="booking-slots">
                            <SlotList
                                slots={getSlotsForDate()}
                                selectedService={selectedService}
                                selectedDate={selectedDate}
                                onSelectSlot={handleSelectSlot}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Booking Confirmation Modal */}
            <BookingModal
                isOpen={showModal}
                service={selectedService}
                date={selectedDate}
                slot={selectedSlot}
                onConfirm={handleConfirmBooking}
                onClose={() => setShowModal(false)}
                isStaffView={isStaffView}
            />
        </div>
    );
};

export default ServiceBooking;
