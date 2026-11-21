import pool from '../../config/db.js';

/**
 * Creates court allocation & booking inside a single PostgreSQL transaction.
 * GiST constraint `no_court_overlap` guarantees zero concurrent double-bookings.
 */
export const createBookingTransaction = async ({
  courtId,
  startTime,
  endTime,
  memberId = null,
  bookedByStaffId = null,
  guestName = null,
  guestPhone = null,
  feeCharged = 0.00,
  notes = null,
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert into court_allocations using tstzrange
    const allocationType = memberId ? 'MEMBER_BOOKING' : 'GUEST_BOOKING';
    const allocQuery = `
      INSERT INTO court_allocations (court_id, slot_range, type, status)
      VALUES ($1, tstzrange($2, $3, '[)'), $4, 'CONFIRMED')
      RETURNING id, court_id, slot_range, type, status, created_at;
    `;
    const allocRes = await client.query(allocQuery, [courtId, startTime, endTime, allocationType]);
    const allocation = allocRes.rows[0];

    // 2. Insert into bookings linked to allocation_id
    const bookingQuery = `
      INSERT INTO bookings (allocation_id, member_id, booked_by_staff_id, guest_name, guest_phone, fee_charged, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, allocation_id, member_id, booked_by_staff_id, guest_name, guest_phone, fee_charged, payment_status, notes, created_at;
    `;
    const bookingRes = await client.query(bookingQuery, [
      allocation.id,
      memberId,
      bookedByStaffId,
      guestName,
      guestPhone,
      feeCharged,
      notes,
    ]);
    const booking = bookingRes.rows[0];

    await client.query('COMMIT');

    return {
      ...booking,
      allocation,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    // PostgreSQL error 23P01 = exclusion_violation
    if (err.code === '23P01') {
      const conflictError = new Error('This court slot is already booked or reserved for another session.');
      conflictError.statusCode = 409;
      throw conflictError;
    }
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Counts how many active sessions a member is registered for on a specific calendar day.
 */
export const countDailyMemberSessions = async (memberId, dateStr) => {
  const query = `
    SELECT COUNT(*) as session_count
    FROM bookings b
    JOIN court_allocations ca ON b.allocation_id = ca.id
    WHERE b.member_id = $1
      AND ca.status != 'CANCELLED'
      AND (lower(ca.slot_range) AT TIME ZONE 'Asia/Kolkata')::DATE = $2::DATE;
  `;
  const result = await pool.query(query, [memberId, dateStr]);
  return parseInt(result.rows[0].session_count, 10);
};

/**
 * Retrieves bookings with complete court, sport, and athlete profiles for calendar view.
 */
export const getBookingsByDate = async (dateStr, sportId = null, memberId = null) => {
  let query = `
    SELECT 
      b.id as booking_id,
      b.allocation_id,
      b.member_id,
      b.booked_by_staff_id,
      b.guest_name,
      b.guest_phone,
      b.fee_charged,
      b.payment_status,
      b.notes,
      b.created_at,
      ca.court_id,
      ca.status as allocation_status,
      ca.type as allocation_type,
      lower(ca.slot_range) as start_at,
      upper(ca.slot_range) as end_at,
      c.name as court_name,
      c.surface_type,
      s.id as sport_id,
      s.name as sport_name,
      u.full_name as member_name,
      u.email as member_email,
      u.phone as member_phone,
      mp.member_code,
      mp_plan.tier as member_tier
    FROM bookings b
    JOIN court_allocations ca ON b.allocation_id = ca.id
    JOIN courts c ON ca.court_id = c.id
    JOIN sports s ON c.sport_id = s.id
    LEFT JOIN users u ON b.member_id = u.id
    LEFT JOIN member_profiles mp ON u.id = mp.user_id
    LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE'
    LEFT JOIN membership_plans mp_plan ON m.plan_id = mp_plan.id
    WHERE ca.status != 'CANCELLED'
      AND (lower(ca.slot_range) AT TIME ZONE 'Asia/Kolkata')::DATE = $1::DATE
  `;
  const params = [dateStr];

  if (sportId) {
    params.push(sportId);
    query += ` AND s.id = $${params.length}`;
  }

  if (memberId) {
    params.push(memberId);
    query += ` AND b.member_id = $${params.length}`;
  }

  query += ` ORDER BY lower(ca.slot_range) ASC, c.id ASC;`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Cancels a booking by setting its court_allocation status to 'CANCELLED'.
 */
export const cancelBookingAllocation = async (bookingId) => {
  const query = `
    UPDATE court_allocations
    SET status = 'CANCELLED'
    WHERE id = (SELECT allocation_id FROM bookings WHERE id = $1)
    RETURNING id, status;
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows[0];
};

/**
 * Checks in an athlete.
 */
export const checkInBookingAllocation = async (bookingId) => {
  const query = `
    UPDATE court_allocations
    SET status = 'CHECKED_IN'
    WHERE id = (SELECT allocation_id FROM bookings WHERE id = $1)
    RETURNING id, status;
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows[0];
};

/**
 * Social Play: List upcoming social sessions
 */
export const getUpcomingSocialSessions = async () => {
  const query = `
    SELECT 
      ss.id as session_id,
      ss.title,
      ss.capacity,
      ss.entry_fee,
      ss.description,
      ca.id as allocation_id,
      ca.court_id,
      ca.status as session_status,
      lower(ca.slot_range) as start_at,
      upper(ca.slot_range) as end_at,
      c.name as court_name,
      s.name as sport_name,
      (SELECT COUNT(*) FROM social_registrations WHERE session_id = ss.id) as registered_count
    FROM social_sessions ss
    JOIN court_allocations ca ON ss.allocation_id = ca.id
    JOIN courts c ON ca.court_id = c.id
    JOIN sports s ON c.sport_id = s.id
    WHERE ca.status != 'CANCELLED'
      AND upper(ca.slot_range) >= NOW()
    ORDER BY lower(ca.slot_range) ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Social Play: Register member for a session
 */
export const registerSocialMember = async (sessionId, memberId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check capacity
    const sessionRes = await client.query(
      `SELECT ss.capacity, COUNT(sr.id) as current_count
       FROM social_sessions ss
       LEFT JOIN social_registrations sr ON ss.id = sr.session_id
       WHERE ss.id = $1
       GROUP BY ss.id, ss.capacity;`,
      [sessionId]
    );

    if (sessionRes.rows.length === 0) {
      throw new Error('Social session not found');
    }

    const { capacity, current_count } = sessionRes.rows[0];
    if (parseInt(current_count, 10) >= parseInt(capacity, 10)) {
      const error = new Error('This social session is at full capacity.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Insert registration
    const regQuery = `
      INSERT INTO social_registrations (session_id, user_id)
      VALUES ($1, $2)
      RETURNING id, session_id, user_id, registered_at;
    `;
    const regRes = await client.query(regQuery, [sessionId, memberId]);

    await client.query('COMMIT');
    return regRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const error = new Error('You are already registered for this Friday social session.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  } finally {
    client.release();
  }
};
