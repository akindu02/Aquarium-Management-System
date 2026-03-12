const { pool } = require('../config/db');
const notificationService = require('../services/notificationService');

// =============================================
// TIME SLOT MANAGEMENT (Staff / Admin)
// =============================================

// Create a new time slot
const createTimeSlot = async (req, res) => {
    try {
        const { service, date, start, end } = req.body;
        
        // Ensure user is authenticated (staff/admin)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const staff_id = req.user.id;

        // 1. Find or create the service
        let serviceResult = await pool.query(
            'SELECT service_id FROM services WHERE service_type = $1',
            [service]
        );

        let service_id;
        if (serviceResult.rows.length > 0) {
            service_id = serviceResult.rows[0].service_id;
        } else {
            const newService = await pool.query(
                'INSERT INTO services (service_type, base_price) VALUES ($1, $2) RETURNING service_id',
                [service, 0.00]
            );
            service_id = newService.rows[0].service_id;
        }

        // Combine date and time to proper Postgres timestamp format
        const start_time = `${date} ${start}:00`;
        const end_time = `${date} ${end}:00`;

        // Insert the slot
        const newSlot = await pool.query(
            `INSERT INTO service_time_slots 
            (staff_id, service_id, start_time, end_time) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`,
            [staff_id, service_id, start_time, end_time]
        );

        res.status(201).json({
            success: true,
            message: 'Time slot created successfully',
            data: newSlot.rows[0]
        });

    } catch (error) {
        console.error('Error creating time slot:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all time slots
const getTimeSlots = async (req, res) => {
    try {
        const slots = await pool.query(
            `SELECT ts.slot_id as id, s.service_type as service, 
             TO_CHAR(ts.start_time, 'YYYY-MM-DD') as date,
             TO_CHAR(ts.start_time, 'HH24:MI') as start, 
             TO_CHAR(ts.end_time, 'HH24:MI') as end, 
             ts.status
             FROM service_time_slots ts
             JOIN services s ON ts.service_id = s.service_id
             ORDER BY ts.start_time ASC`
        );
        
        res.status(200).json({
            success: true,
            data: slots.rows
        });
    } catch (error) {
        console.error('Error fetching time slots:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update a time slot
const updateTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { service, date, start, end, status } = req.body;

        // Find or create service
        let serviceResult = await pool.query(
            'SELECT service_id FROM services WHERE service_type = $1',
            [service]
        );

        let service_id;
        if (serviceResult.rows.length > 0) {
            service_id = serviceResult.rows[0].service_id;
        } else {
            const newService = await pool.query(
                'INSERT INTO services (service_type, base_price) VALUES ($1, $2) RETURNING service_id',
                [service, 0.00]
            );
            service_id = newService.rows[0].service_id;
        }

        const start_time = `${date} ${start}:00`;
        const end_time = `${date} ${end}:00`;

        const result = await pool.query(
            `UPDATE service_time_slots 
             SET service_id = $1, start_time = $2, end_time = $3, status = $4
             WHERE slot_id = $5 RETURNING *`,
            [service_id, start_time, end_time, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Time slot not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Time slot updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating time slot:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a time slot
const deleteTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM service_time_slots WHERE slot_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Time slot not found' });
        }

        res.status(200).json({ success: true, message: 'Time slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting time slot:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot,
    // Booking CRUD
    createBooking,
    createWalkInBooking,
    getCustomerBookings,
    cancelBooking,
    getAllBookings,
    updateBookingStatus,
    getBookingById,
};

// =============================================
// SERVICE BOOKING HANDLERS
// =============================================

/**
 * POST /api/bookings
 * Customer creates a booking for an available slot.
 */
async function createBooking(req, res) {
    const client = await pool.connect();
    try {
        const customerId = req.user.id;
        const { slot_id, phone, city, address, notes } = req.body;

        if (!slot_id) {
            return res.status(400).json({ success: false, message: 'slot_id is required.' });
        }
        if (!phone || !city || !address) {
            return res.status(400).json({ success: false, message: 'phone, city and address are required.' });
        }

        // Validate phone (digits, 9–15 chars)
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 15) {
            return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
        }

        await client.query('BEGIN');

        // 1. Lock and check the slot
        const slotResult = await client.query(
            `SELECT ts.slot_id, ts.service_id, ts.start_time, ts.end_time, ts.status,
                    s.service_type
             FROM service_time_slots ts
             JOIN services s ON ts.service_id = s.service_id
             WHERE ts.slot_id = $1
             FOR UPDATE`,
            [slot_id]
        );

        if (slotResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Time slot not found.' });
        }

        const slot = slotResult.rows[0];

        if (slot.status !== 'Available') {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'This slot is no longer available. Please choose another slot.' });
        }

        // 2. Verify user is a registered customer
        const customerCheck = await client.query(
            'SELECT user_id FROM customers WHERE user_id = $1',
            [customerId]
        );
        if (customerCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Only registered customers can book services.' });
        }

        // 3. Create the booking — service_id is NOT stored here; derive it via slot_id JOIN
        const bookingResult = await client.query(
            `INSERT INTO service_bookings
             (customer_id, slot_id, booking_date, status, service_phone, service_city, service_address, notes)
             VALUES ($1, $2, $3, 'Pending', $4, $5, $6, $7)
             RETURNING *`,
            [
                customerId,
                slot_id,
                slot.start_time,
                phone.trim(),
                city.trim(),
                address.trim(),
                notes ? notes.trim() : null,
            ]
        );

        // 4. Mark slot as Booked
        await client.query(
            `UPDATE service_time_slots SET status = 'Booked' WHERE slot_id = $1`,
            [slot_id]
        );

        await client.query('COMMIT');

        const booking = bookingResult.rows[0];

        // 5. Fire-and-forget notifications (non-blocking)
        setImmediate(async () => {
            try {
                await notificationService.createNotification(
                    customerId,
                    `Your booking for "${slot.service_type}" on ${new Date(slot.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} has been received and is Pending confirmation.`,
                    'Booking'
                );
            } catch (e) {
                console.error('Notification error:', e);
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully.',
            data: {
                booking_id: booking.booking_id,
                service: slot.service_type,
                booking_date: slot.start_time,
                end_time: slot.end_time,
                status: booking.status,
                service_phone: booking.service_phone,
                service_city: booking.service_city,
                service_address: booking.service_address,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('createBooking error:', error);
        return res.status(500).json({ success: false, message: 'Server error creating booking.' });
    } finally {
        client.release();
    }
}

/**
 * POST /api/bookings/walk-in
 * Staff creates a booking on behalf of a walk-in customer.
 * Uses pos_customers table to store walk-in customer info.
 */
async function createWalkInBooking(req, res) {
    const client = await pool.connect();
    try {
        const staffId = req.user.id;
        const { slot_id, phone, city, address, notes, customer_name } = req.body;

        if (!slot_id) {
            return res.status(400).json({ success: false, message: 'slot_id is required.' });
        }
        if (!phone || !city || !address) {
            return res.status(400).json({ success: false, message: 'phone, city and address are required.' });
        }
        if (!customer_name || !customer_name.trim()) {
            return res.status(400).json({ success: false, message: 'customer_name is required for walk-in bookings.' });
        }

        // Validate phone
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 15) {
            return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
        }

        await client.query('BEGIN');

        // 1. Lock and check the slot
        const slotResult = await client.query(
            `SELECT ts.slot_id, ts.service_id, ts.start_time, ts.end_time, ts.status,
                    s.service_type
             FROM service_time_slots ts
             JOIN services s ON ts.service_id = s.service_id
             WHERE ts.slot_id = $1
             FOR UPDATE`,
            [slot_id]
        );

        if (slotResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Time slot not found.' });
        }

        const slot = slotResult.rows[0];

        if (slot.status !== 'Available') {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'This slot is no longer available. Please choose another slot.' });
        }

        // 2. Find or create a pos_customer record
        let posCustomerId;
        const existingCustomer = await client.query(
            `SELECT pos_customer_id FROM pos_customers WHERE phone = $1 LIMIT 1`,
            [phone.trim()]
        );

        if (existingCustomer.rows.length > 0) {
            posCustomerId = existingCustomer.rows[0].pos_customer_id;
            // Update name/address if changed
            await client.query(
                `UPDATE pos_customers SET name = $1, address = $2 WHERE pos_customer_id = $3`,
                [customer_name.trim(), address.trim(), posCustomerId]
            );
        } else {
            const newCustomer = await client.query(
                `INSERT INTO pos_customers (name, phone, address) VALUES ($1, $2, $3) RETURNING pos_customer_id`,
                [customer_name.trim(), phone.trim(), address.trim()]
            );
            posCustomerId = newCustomer.rows[0].pos_customer_id;
        }

        // 3. Create the booking (customer_id is NULL for walk-in)
        const bookingResult = await client.query(
            `INSERT INTO service_bookings
             (customer_id, pos_customer_id, slot_id, booking_date, status, service_phone, service_city, service_address, notes, booked_by_staff_id)
             VALUES (NULL, $1, $2, $3, 'Confirmed', $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                posCustomerId,
                slot_id,
                slot.start_time,
                phone.trim(),
                city.trim(),
                address.trim(),
                notes ? notes.trim() : null,
                staffId,
            ]
        );

        // 4. Mark slot as Booked
        await client.query(
            `UPDATE service_time_slots SET status = 'Booked' WHERE slot_id = $1`,
            [slot_id]
        );

        await client.query('COMMIT');

        const booking = bookingResult.rows[0];

        return res.status(201).json({
            success: true,
            message: 'Walk-in booking created successfully.',
            data: {
                booking_id: booking.booking_id,
                service: slot.service_type,
                booking_date: slot.start_time,
                end_time: slot.end_time,
                status: booking.status,
                service_phone: booking.service_phone,
                service_city: booking.service_city,
                service_address: booking.service_address,
                customer_name: customer_name.trim(),
                walk_in: true,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('createWalkInBooking error:', error);
        return res.status(500).json({ success: false, message: 'Server error creating walk-in booking.' });
    } finally {
        client.release();
    }
}

/**
 * GET /api/bookings/my
 * Logged-in customer retrieves their own bookings.
 */
async function getCustomerBookings(req, res) {
    try {
        const customerId = req.user.id;

        const result = await pool.query(
            `SELECT
                sb.booking_id,
                sb.status,
                sb.booking_date,
                sb.service_phone,
                sb.service_city,
                sb.service_address,
                sb.notes,
                sb.created_at,
                s.service_type,
                s.description  AS service_description,
                s.base_price,
                ts.start_time,
                ts.end_time
             FROM service_bookings sb
             LEFT JOIN service_time_slots ts ON sb.slot_id = ts.slot_id
             LEFT JOIN services s ON ts.service_id = s.service_id
             WHERE sb.customer_id = $1
             ORDER BY sb.booking_date DESC`,
            [customerId]
        );

        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('getCustomerBookings error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching bookings.' });
    }
}

/**
 * PATCH /api/bookings/:id/cancel
 * Customer cancels their own booking (Pending or Confirmed only).
 */
async function cancelBooking(req, res) {
    const client = await pool.connect();
    try {
        const customerId = req.user.id;
        const bookingId = parseInt(req.params.id, 10);

        if (isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
        }

        await client.query('BEGIN');

        // Fetch and lock the booking
        const bookingResult = await client.query(
            `SELECT sb.booking_id, sb.status, sb.slot_id, sb.customer_id, s.service_type, sb.booking_date
             FROM service_bookings sb
             LEFT JOIN service_time_slots ts ON sb.slot_id = ts.slot_id
             LEFT JOIN services s ON ts.service_id = s.service_id
             WHERE sb.booking_id = $1
             FOR UPDATE OF sb`,
            [bookingId]
        );

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const booking = bookingResult.rows[0];

        // Ownership check
        if (booking.customer_id !== customerId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
        }

        // Only Pending or Confirmed can be cancelled
        if (!['Pending', 'Confirmed'].includes(booking.status)) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: `Cannot cancel a booking that is "${booking.status}".`,
            });
        }

        // Update booking status to Cancelled
        await client.query(
            `UPDATE service_bookings SET status = 'Cancelled' WHERE booking_id = $1`,
            [bookingId]
        );

        // Free the time slot back to Available
        if (booking.slot_id) {
            await client.query(
                `UPDATE service_time_slots SET status = 'Available' WHERE slot_id = $1`,
                [booking.slot_id]
            );
        }

        await client.query('COMMIT');

        // Notify customer
        setImmediate(async () => {
            try {
                await notificationService.createNotification(
                    customerId,
                    `Your booking for "${booking.service_type}" on ${new Date(booking.booking_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} has been cancelled.`,
                    'Booking'
                );
            } catch (e) {
                console.error('Notification error:', e);
            }
        });

        return res.status(200).json({ success: true, message: 'Booking cancelled successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('cancelBooking error:', error);
        return res.status(500).json({ success: false, message: 'Server error cancelling booking.' });
    } finally {
        client.release();
    }
}

/**
 * GET /api/bookings
 * Admin / Staff — list all bookings with optional status filter.
 * Query params: status, page, limit
 */
async function getAllBookings(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        const params = [];

        if (status) {
            params.push(status);
            whereClause = `WHERE sb.status = $${params.length}`;
        }

        params.push(parseInt(limit), offset);

        const result = await pool.query(
            `SELECT
                sb.booking_id,
                sb.status,
                sb.booking_date,
                sb.service_phone,
                sb.service_city,
                sb.service_address,
                sb.notes,
                sb.created_at,
                sb.pos_customer_id,
                sb.booked_by_staff_id,
                s.service_type,
                s.base_price,
                ts.start_time,
                ts.end_time,
                COALESCE(u.name, pc.name)  AS customer_name,
                COALESCE(u.email, pc.email) AS customer_email,
                CASE WHEN sb.pos_customer_id IS NOT NULL THEN true ELSE false END AS is_walk_in
             FROM service_bookings sb
             LEFT JOIN service_time_slots ts ON sb.slot_id = ts.slot_id
             LEFT JOIN services s ON ts.service_id = s.service_id
             LEFT JOIN customers c ON sb.customer_id = c.user_id
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN pos_customers pc ON sb.pos_customer_id = pc.pos_customer_id
             ${whereClause}
             ORDER BY sb.booking_date DESC
             LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        // Total count
        const countParams = status ? [status] : [];
        const countWhere = status ? 'WHERE sb.status = $1' : '';
        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS total FROM service_bookings sb ${countWhere}`,
            countParams
        );

        return res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: countResult.rows[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('getAllBookings error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching bookings.' });
    }
}

/**
 * GET /api/bookings/:id
 * Get single booking (admin/staff or the booking owner).
 */
async function getBookingById(req, res) {
    try {
        const bookingId = parseInt(req.params.id, 10);
        if (isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
        }

        const result = await pool.query(
            `SELECT
                sb.booking_id,
                sb.customer_id,
                sb.status,
                sb.booking_date,
                sb.service_phone,
                sb.service_city,
                sb.service_address,
                sb.notes,
                sb.created_at,
                s.service_type,
                s.description AS service_description,
                s.base_price,
                ts.start_time,
                ts.end_time,
                u.name  AS customer_name,
                u.email AS customer_email
             FROM service_bookings sb
             LEFT JOIN service_time_slots ts ON sb.slot_id = ts.slot_id
             LEFT JOIN services s ON ts.service_id = s.service_id
             LEFT JOIN customers c ON sb.customer_id = c.user_id
             LEFT JOIN users u ON c.user_id = u.id
             WHERE sb.booking_id = $1`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const booking = result.rows[0];

        // Customers can only view their own bookings
        if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error('getBookingById error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

/**
 * PATCH /api/bookings/:id/status
 * Admin / Staff — update booking status.
 * Body: { status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' }
 */
async function updateBookingStatus(req, res) {
    const client = await pool.connect();
    try {
        const bookingId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
        }

        const ALLOWED = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
        if (!status || !ALLOWED.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${ALLOWED.join(', ')}.`,
            });
        }

        await client.query('BEGIN');

        const bookingResult = await client.query(
            `SELECT sb.booking_id, sb.status, sb.slot_id, sb.customer_id,
                    s.service_type, sb.booking_date
             FROM service_bookings sb
             LEFT JOIN service_time_slots ts ON sb.slot_id = ts.slot_id
             LEFT JOIN services s ON ts.service_id = s.service_id
             WHERE sb.booking_id = $1 FOR UPDATE OF sb`,
            [bookingId]
        );

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const booking = bookingResult.rows[0];

        // If cancelling, free the slot
        if (status === 'Cancelled' && booking.slot_id && booking.status !== 'Cancelled') {
            await client.query(
                `UPDATE service_time_slots SET status = 'Available' WHERE slot_id = $1`,
                [booking.slot_id]
            );
        }

        await client.query(
            `UPDATE service_bookings SET status = $1 WHERE booking_id = $2`,
            [status, bookingId]
        );

        await client.query('COMMIT');

        // Notify the customer
        setImmediate(async () => {
            try {
                const messages = {
                    Confirmed: `Your booking for "${booking.service_type}" has been confirmed.`,
                    'In Progress': `Your service "${booking.service_type}" is now in progress.`,
                    Completed: `Your service "${booking.service_type}" has been completed. Thank you!`,
                    Cancelled: `Your booking for "${booking.service_type}" has been cancelled by our team.`,
                };
                const msg = messages[status];
                if (msg && booking.customer_id) {
                    await notificationService.createNotification(booking.customer_id, msg, 'Booking');
                }
            } catch (e) {
                console.error('Notification error:', e);
            }
        });

        return res.status(200).json({ success: true, message: `Booking status updated to "${status}".` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('updateBookingStatus error:', error);
        return res.status(500).json({ success: false, message: 'Server error updating booking status.' });
    } finally {
        client.release();
    }
}
