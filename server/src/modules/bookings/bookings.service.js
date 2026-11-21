import * as bookingsRepo from './bookings.repository.js';
import * as courtsRepo from '../courts/courts.repository.js';
import * as authRepo from '../auth/auth.repository.js';

export const createBooking = async ({
  courtId,
  startTime,
  memberId = null,
  guestName = null,
  guestPhone = null,
  staffUserId = null,
  notes = null,
}) => {
  if (!courtId || !startTime) {
    const error = new Error('court_id and startTime are required');
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    const error = new Error('Invalid startTime format. ISO 8601 string expected.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Validate 30-minute interval alignment
  const minutes = start.getMinutes();
  if (minutes !== 0 && minutes !== 30) {
    const error = new Error('Bookings must start on the hour (:00) or half-hour (:30).');
    error.statusCode = 400;
    throw error;
  }

  // 2. Standard duration: exactly 60 minutes
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  // 3. Operating hours check (06:00 to 22:00 in local time)
  const localHours = start.getHours();
  if (localHours < 6 || localHours >= 22) {
    const error = new Error('Courts are open from 06:00 to 22:00 only.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Fetch Court Details
  const court = await courtsRepo.getCourtById(courtId);
  if (!court) {
    const error = new Error('Selected court is not available');
    error.statusCode = 404;
    throw error;
  }

  // 5. Daily Quota Check: Max 2 sessions per member per day
  const dateStr = start.toISOString().split('T')[0];
  if (memberId) {
    const existingCount = await bookingsRepo.countDailyMemberSessions(memberId, dateStr);
    if (existingCount >= 2) {
      const error = new Error('Daily limit reached: Members are allowed a maximum of 2 court sessions per day.');
      error.statusCode = 400;
      throw error;
    }
  }

  // 6. Calculate Server-Side Pricing (₹ INR) based on user tier
  let feeCharged = parseFloat(court.hourly_rate_guest);

  if (memberId) {
    const member = await authRepo.findUserById(memberId);
    const courtDiscountPct = parseFloat(member?.court_discount_pct || 0);

    if (courtDiscountPct >= 100) {
      feeCharged = 0.00; // Gold VIP tier = 100% Free
    } else if (courtDiscountPct > 0) {
      const memberBaseRate = parseFloat(court.hourly_rate_member);
      feeCharged = memberBaseRate * (1 - courtDiscountPct / 100);
    } else {
      feeCharged = parseFloat(court.hourly_rate_member);
    }
  }

  // 7. Atomic Transaction insertion with GiST mutual exclusion
  return await bookingsRepo.createBookingTransaction({
    courtId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    memberId,
    bookedByStaffId: staffUserId,
    guestName,
    guestPhone,
    feeCharged,
    notes,
  });
};

export const listBookings = async (dateStr, sportId = null, user = null) => {
  const queryDate = dateStr || new Date().toISOString().split('T')[0];

  // If user is a regular member, scope to their own bookings unless front_desk/admin
  const memberId = user?.role === 'member' ? user.id : null;

  return await bookingsRepo.getBookingsByDate(queryDate, sportId, memberId);
};

export const cancelBooking = async (bookingId, user) => {
  // Front Desk and Admin can cancel any booking; Members can only cancel their own
  const cancelled = await bookingsRepo.cancelBookingAllocation(bookingId);
  if (!cancelled) {
    const error = new Error('Booking not found or already cancelled');
    error.statusCode = 404;
    throw error;
  }
  return cancelled;
};

export const checkInBooking = async (bookingId) => {
  const checkedIn = await bookingsRepo.checkInBookingAllocation(bookingId);
  if (!checkedIn) {
    const error = new Error('Booking not found or unable to check in');
    error.statusCode = 404;
    throw error;
  }
  return checkedIn;
};

export const listSocialSessions = async () => {
  return await bookingsRepo.getUpcomingSocialSessions();
};

export const joinSocialSession = async (sessionId, memberId) => {
  if (!memberId) {
    const error = new Error('You must be a member to join Friday Social Sessions');
    error.statusCode = 401;
    throw error;
  }
  return await bookingsRepo.registerSocialMember(sessionId, memberId);
};
