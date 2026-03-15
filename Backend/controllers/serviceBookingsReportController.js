const db = require('../config/db');

const getServiceBookingsReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        /* ── Summary counts ── */
        const summaryRes = await db.query(`
            SELECT
                COUNT(*)                                                  AS total_bookings,
                COUNT(*) FILTER (WHERE status = 'Pending')               AS pending,
                COUNT(*) FILTER (WHERE status = 'Confirmed')             AS confirmed,
                COUNT(*) FILTER (WHERE status = 'In Progress')           AS in_progress,
                COUNT(*) FILTER (WHERE status = 'Completed')             AS completed,
                COUNT(*) FILTER (WHERE status = 'Cancelled')             AS cancelled,
                COUNT(*) FILTER (WHERE customer_id IS NOT NULL)          AS online_bookings,
                COUNT(*) FILTER (WHERE pos_customer_id IS NOT NULL)      AS walkin_bookings
            FROM service_bookings
            WHERE booking_date::date BETWEEN $1 AND $2
        `, [start_date, end_date]);

        /* ── Service popularity (join through slot → service) ── */
        const servicePopRes = await db.query(`
            SELECT
                s.service_type,
                COUNT(sb.booking_id)                                          AS total_bookings,
                COUNT(*) FILTER (WHERE sb.status = 'Completed')              AS completed_bookings,
                COUNT(*) FILTER (WHERE sb.status = 'Cancelled')              AS cancelled_bookings,
                COUNT(*) FILTER (WHERE sb.status = 'Confirmed')              AS confirmed_bookings,
                COUNT(*) FILTER (WHERE sb.status = 'Pending')                AS pending_bookings,
                COUNT(*) FILTER (WHERE sb.status = 'In Progress')            AS in_progress_bookings
            FROM service_bookings sb
            JOIN service_time_slots sts ON sb.slot_id = sts.slot_id
            JOIN services s ON sts.service_id = s.service_id
            WHERE sb.booking_date::date BETWEEN $1 AND $2
            GROUP BY s.service_type
            ORDER BY total_bookings DESC
        `, [start_date, end_date]);

        /* ── Daily bookings trend ── */
        const dailyRes = await db.query(`
            SELECT
                booking_date::date                                        AS date,
                COUNT(*)                                                  AS total,
                COUNT(*) FILTER (WHERE status != 'Cancelled')            AS active
            FROM service_bookings
            WHERE booking_date::date BETWEEN $1 AND $2
            GROUP BY booking_date::date
            ORDER BY date
        `, [start_date, end_date]);

        /* ── Status breakdown ── */
        const statusRes = await db.query(`
            SELECT status, COUNT(*) AS count
            FROM service_bookings
            WHERE booking_date::date BETWEEN $1 AND $2
            GROUP BY status
            ORDER BY count DESC
        `, [start_date, end_date]);

        res.json({
            success: true,
            data: {
                summary:           summaryRes.rows[0],
                servicePopularity: servicePopRes.rows,
                dailyBookings:     dailyRes.rows,
                bookingStatus:     statusRes.rows,
            },
        });
    } catch (err) {
        console.error('Service bookings report error:', err);
        res.status(500).json({ error: 'Failed to generate service bookings report' });
    }
};

module.exports = { getServiceBookingsReport };
