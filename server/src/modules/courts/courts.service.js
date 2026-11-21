import * as courtsRepo from './courts.repository.js';
import { generateTimeSlots } from '../../utils/timeSlots.js';

export const listSports = async () => {
  return await courtsRepo.getAllSports();
};

export const listCourts = async (sportId = null) => {
  return await courtsRepo.getCourtsBySportId(sportId);
};

export const listCourtsForManagement = () => courtsRepo.getCourtsForManagement();

export const getCourtDetails = async (courtId) => {
  const court = await courtsRepo.getCourtById(courtId);
  if (!court) {
    const error = new Error('Court not found or inactive');
    error.statusCode = 404;
    throw error;
  }
  return court;
};

export const createCourt = async (payload) => {
  const sportId = Number(payload.sport_id);
  const memberRate = Number(payload.hourly_rate_member);
  const guestRate = Number(payload.hourly_rate_guest);
  if (!Number.isInteger(sportId) || !payload.name?.trim() || !Number.isFinite(memberRate) || !Number.isFinite(guestRate) || memberRate < 0 || guestRate < 0) {
    const error = new Error('Valid sport_id, name, and non-negative member/guest rates are required.');
    error.statusCode = 400;
    throw error;
  }
  return courtsRepo.createCourt({ sportId, name: payload.name.trim(), surfaceType: payload.surface_type, memberRate, guestRate });
};

export const updateCourt = async (courtId, payload) => {
  const sportId = Number(payload.sport_id);
  const memberRate = Number(payload.hourly_rate_member);
  const guestRate = Number(payload.hourly_rate_guest);
  if (!Number.isInteger(sportId) || !payload.name?.trim() || !Number.isFinite(memberRate) || !Number.isFinite(guestRate) || memberRate < 0 || guestRate < 0) {
    const error = new Error('Valid sport_id, name, and non-negative member/guest rates are required.');
    error.statusCode = 400;
    throw error;
  }
  const court = await courtsRepo.updateCourt(Number(courtId), { sportId, name: payload.name.trim(), surfaceType: payload.surface_type, memberRate, guestRate, isActive: payload.is_active !== false });
  if (!court) throw Object.assign(new Error('Court not found.'), { statusCode: 404 });
  return court;
};

export const createMaintenanceBlock = async (courtId, payload) => {
  const start = new Date(payload.start_time);
  const end = new Date(payload.end_time);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    const error = new Error('Valid start_time and end_time are required; end_time must be after start_time.');
    error.statusCode = 400;
    throw error;
  }
  try {
    return await courtsRepo.addMaintenanceBlock({ courtId: Number(courtId), startTime: start.toISOString(), endTime: end.toISOString(), notes: payload.notes });
  } catch (err) {
    if (err.code === '23P01') throw Object.assign(new Error('Maintenance block overlaps an existing court allocation.'), { statusCode: 409 });
    throw err;
  }
};

export const calculateAvailability = async (courtId, dateStr) => {
  if (!courtId) {
    const error = new Error('court_id query parameter is required');
    error.statusCode = 400;
    throw error;
  }

  // Validate date format (YYYY-MM-DD)
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(targetDate.getTime())) {
    const error = new Error('Invalid date format. Expected YYYY-MM-DD');
    error.statusCode = 400;
    throw error;
  }

  const formattedDate = targetDate.toISOString().split('T')[0];

  // Fetch court metadata
  const court = await courtsRepo.getCourtById(courtId);
  if (!court) {
    const error = new Error('Court not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch active allocations from DB for this court on this date
  const allocations = await courtsRepo.getCourtAllocationsForDate(courtId, formattedDate);

  // Generate 30-min start interval slots (06:00 to 22:00)
  const baseSlots = generateTimeSlots(formattedDate, 6, 22);

  const now = new Date();

  // Evaluate each slot against existing allocations
  const calculatedSlots = baseSlots.map((slot) => {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);

    // 1. Check if slot has already passed
    const isPast = slotStart < now;

    // 2. Check if any database allocation overlaps [slotStart, slotEnd)
    // Two intervals [A_start, A_end) and [B_start, B_end) overlap if (A_start < B_end && B_start < A_end)
    const overlappingAllocation = allocations.find((alloc) => {
      const allocStart = new Date(alloc.start_at);
      const allocEnd = new Date(alloc.end_at);
      return slotStart < allocEnd && allocStart < slotEnd;
    });

    let status = 'AVAILABLE';
    let allocationType = null;

    if (overlappingAllocation) {
      allocationType = overlappingAllocation.type;
      if (overlappingAllocation.type === 'SOCIAL_PLAY') {
        status = 'SOCIAL';
      } else if (overlappingAllocation.type === 'MAINTENANCE') {
        status = 'MAINTENANCE';
      } else {
        status = 'BOOKED';
      }
    } else if (isPast) {
      status = 'PAST';
    }

    return {
      ...slot,
      status,
      allocationType,
      memberPrice: parseFloat(court.hourly_rate_member),
      guestPrice: parseFloat(court.hourly_rate_guest),
    };
  });

  return {
    court,
    date: formattedDate,
    operatingHours: '06:00 - 22:00',
    slots: calculatedSlots,
  };
};
