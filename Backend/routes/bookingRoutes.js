const express = require('express');
const router = express.Router();
const { createTimeSlot, getTimeSlots, updateTimeSlot, deleteTimeSlot } = require('../controllers/bookingController');
const { authenticate, staffOrAdmin } = require('../middleware/authMiddleware');

// Route to get all time slots (public - customers need to see available slots)
router.get('/slots', getTimeSlots);

// Route to create a time slot (Staff/Admin only)
router.post('/slots', authenticate, staffOrAdmin, createTimeSlot);

// Route to update a time slot (Staff/Admin only)
router.put('/slots/:id', authenticate, staffOrAdmin, updateTimeSlot);

// Route to delete a time slot (Staff/Admin only)
router.delete('/slots/:id', authenticate, staffOrAdmin, deleteTimeSlot);

module.exports = router;
