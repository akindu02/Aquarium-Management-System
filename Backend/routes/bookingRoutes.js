const express = require('express');
const router = express.Router();
const {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot,
    createBooking,
    createWalkInBooking,
    getCustomerBookings,
    cancelBooking,
    getAllBookings,
    updateBookingStatus,
    getBookingById,
} = require('../controllers/bookingController');
const { authenticate, staffOrAdmin, authorize } = require('../middleware/authMiddleware');

// ─── Time Slot Routes ───────────────────────────────────────────────────────
// Public: customers view available slots
router.get('/slots', getTimeSlots);

// Staff / Admin manage slots
router.post('/slots', authenticate, staffOrAdmin, createTimeSlot);
router.put('/slots/:id', authenticate, staffOrAdmin, updateTimeSlot);
router.delete('/slots/:id', authenticate, staffOrAdmin, deleteTimeSlot);

// ─── Booking Routes ─────────────────────────────────────────────────────────
// Customer: create a booking (authenticated customers only)
router.post('/', authenticate, authorize('customer'), createBooking);

// Staff / Admin: create a walk-in booking on behalf of a customer
router.post('/walk-in', authenticate, staffOrAdmin, createWalkInBooking);

// Customer: view own bookings
router.get('/my', authenticate, authorize('customer'), getCustomerBookings);

// Customer: cancel own booking
router.patch('/:id/cancel', authenticate, authorize('customer'), cancelBooking);

// Admin / Staff: view all bookings
router.get('/', authenticate, staffOrAdmin, getAllBookings);

// Admin / Staff: get single booking detail
router.get('/:id', authenticate, (req, res, next) => {
    // Customers can also fetch their own booking by ID
    if (['admin', 'staff', 'customer'].includes(req.user?.role)) return next();
    return res.status(403).json({ success: false, message: 'Access denied.' });
}, getBookingById);

// Admin / Staff: update booking status
router.patch('/:id/status', authenticate, staffOrAdmin, updateBookingStatus);

module.exports = router;
