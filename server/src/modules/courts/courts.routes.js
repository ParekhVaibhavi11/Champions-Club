import { Router } from 'express';
import { query, withTransaction } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const router = Router();

// 1. Get sports list
router.get('/sports', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM sports ORDER BY id ASC');
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// 2. Get courts list (optionally filtered by sport_id)
router.get('/', async (req, res, next) => {
  try {
    const { sport_id } = req.query;
    let sql = `
      SELECT c.*, s.name as sport_name, s.slug as sport_slug
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      WHERE c.is_active = TRUE
    `;
    const params = [];

    if (sport_id) {
      sql += ' AND c.sport_id = $1';
      params.push(sport_id);
    }

    sql += ' ORDER BY c.id ASC';
    const result = await query(sql, params);
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// 3. Get court availability for a specific court and date
router.get('/availability', async (req, res, next) => {
  try {
    const { court_id, date } = req.query; // date in YYYY-MM-DD
    if (!court_id || !date) {
      return errorResponse(res, 'court_id and date parameters are required', 400);
    }

    // Fetch existing confirmed allocations for that court on that date
    const allocationsResult = await query(
      `SELECT ca.id, ca.slot_range, ca.type, ca.status, b.guest_name, u.name as member_name
       FROM court_allocations ca
       LEFT JOIN bookings b ON ca.id = b.allocation_id
       LEFT JOIN users u ON b.member_id = u.id
       WHERE ca.court_id = $1
         AND ca.status = 'CONFIRMED'
         AND ca.slot_range && tstzrange($2::timestamptz, ($2::date + 1)::timestamptz)`,
      [court_id, date]
    );

    return successResponse(res, {
      date,
      court_id: parseInt(court_id, 10),
      allocations: allocationsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// 4. Create court booking (Protected, max 2 sessions/member/day, GiST exclusion safe)
router.post('/bookings', authenticateToken, async (req, res, next) => {
  try {
    const { court_id, start_time, end_time, guest_name, guest_phone } = req.body;
    const member_id = req.user.role === 'member' ? req.user.id : (req.body.member_id || null);
    const booked_by_staff_id = req.user.role !== 'member' ? req.user.id : null;

    if (!court_id || !start_time || !end_time) {
      return errorResponse(res, 'court_id, start_time, and end_time are required', 400);
    }

    // Enforce Member Quota: Max 2 bookings per day for members
    if (member_id) {
      const quotaCheck = await query(
        `SELECT COUNT(*) as booking_count
         FROM bookings b
         JOIN court_allocations ca ON b.allocation_id = ca.id
         WHERE b.member_id = $1
           AND ca.status = 'CONFIRMED'
           AND ca.slot_range && tstzrange($2::date::timestamptz, ($2::date + 1)::timestamptz)`,
        [member_id, start_time]
      );

      if (parseInt(quotaCheck.rows[0].booking_count, 10) >= 2) {
        return errorResponse(res, 'Daily booking limit reached: Members can book a maximum of 2 sessions per day.', 400);
      }
    }

    // Atomic transaction for court allocation & booking
    const newBooking = await withTransaction(async (client) => {
      // 1. Insert allocation (Postgres GiST exclusion prevents double-booking race conditions)
      const allocResult = await client.query(
        `INSERT INTO court_allocations (court_id, slot_range, type, status)
         VALUES ($1, tstzrange($2, $3, '[)'), $4, 'CONFIRMED')
         RETURNING id, court_id, slot_range, status`,
        [court_id, start_time, end_time, member_id ? 'MEMBER_BOOKING' : 'GUEST_BOOKING']
      );

      const allocation = allocResult.rows[0];

      // 2. Insert booking record
      const bookingResult = await client.query(
        `INSERT INTO bookings (allocation_id, member_id, booked_by_staff_id, guest_name, guest_phone, fee_charged)
         VALUES ($1, $2, $3, $4, $5, 0.00)
         RETURNING *`,
        [allocation.id, member_id, booked_by_staff_id, guest_name || null, guest_phone || null]
      );

      return {
        ...bookingResult.rows[0],
        court_id: allocation.court_id,
        slot_range: allocation.slot_range
      };
    });

    return successResponse(res, newBooking, 'Court booked successfully!', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
