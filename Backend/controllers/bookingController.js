const { pool } = require('../config/db');

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
    deleteTimeSlot
};
