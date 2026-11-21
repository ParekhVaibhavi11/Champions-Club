import React, { useState, useEffect } from 'react';
import { courtService } from '../../services/courtService';
import { bookingService } from '../../services/bookingService';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  User,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const FrontDeskCalendar = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Walk-in modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCourt, setModalCourt] = useState(null);
  const [modalTime, setModalTime] = useState('09:00:00');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Operating time slots: 06:00 to 22:00 in 1-hour increments
  const timeSlots = [];
  for (let hour = 6; hour < 22; hour++) {
    const hh = String(hour).padStart(2, '0');
    timeSlots.push(`${hh}:00:00`);
  }

  // Fetch courts, sports & bookings
  const loadData = async () => {
    try {
      setLoading(true);
      const [sportsRes, courtsRes, bookingsRes] = await Promise.all([
        courtService.getSports(),
        courtService.getCourts(),
        bookingService.getBookings(selectedDate),
      ]);
      setSports(sportsRes.data || []);
      setCourts(courtsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setNotification({ type: 'error', text: 'Failed to load master calendar data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Filter courts by sport
  const filteredCourts = courts.filter((court) => {
    if (selectedSport === 'ALL') return true;
    return court.sport_id === parseInt(selectedSport, 10);
  });

  // Action: Check-in
  const handleCheckIn = async (bookingId) => {
    try {
      setActionLoading(true);
      await bookingService.checkInBooking(bookingId);
      setNotification({ type: 'success', text: 'Member checked in successfully!' });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Check-in failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Cancel
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setActionLoading(true);
      await bookingService.cancelBooking(bookingId);
      setNotification({ type: 'success', text: 'Booking cancelled. Court slot is now open.' });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Cancellation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Search members for modal
  const handleMemberSearch = async (query) => {
    setMemberSearch(query);
    if (query.trim().length < 2) {
      setMemberResults([]);
      return;
    }
    try {
      const res = await membershipService.getMembers(query);
      setMemberResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Walk-in Modal for a specific court & slot
  const openWalkInModal = (court, slotTime) => {
    setModalCourt(court);
    setModalTime(slotTime);
    setSelectedMember(null);
    setIsGuest(false);
    setGuestName('');
    setGuestPhone('');
    setMemberSearch('');
    setMemberResults([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Submit Walk-in Booking
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    const payload = {
      court_id: modalCourt.id,
      start_time: new Date(`${selectedDate}T${modalTime.slice(0, 5)}:00+05:30`).toISOString(),
      member_id: isGuest ? null : selectedMember?.user_id,
      guest_name: isGuest ? guestName.trim() : null,
      guest_phone: isGuest ? guestPhone.trim() : null,
      notes: isGuest ? `Walk-in Guest: ${guestName} (${guestPhone})` : `Front Desk Walk-in`,
    };

    if (!isGuest && !selectedMember) {
      setModalError('Please select a member or switch to Guest Walk-in.');
      return;
    }

    if (isGuest && (!guestName.trim() || !guestPhone.trim())) {
      setModalError('Please enter guest name and phone number.');
      return;
    }

    try {
      setActionLoading(true);
      await bookingService.createBooking(payload);
      setIsModalOpen(false);
      setNotification({ type: 'success', text: 'Walk-in booking reserved successfully!' });
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to reserve walk-in booking.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-champion-dark uppercase tracking-tight">
              Front Desk Master Calendar
            </h1>
            <Badge variant="staff">Live Dispatch</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time court allocations, walk-in dispatcher, check-in validation, and slot management.
          </p>
        </div>

        {/* Date and Sport Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none"
            >
              <option value="ALL">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold">
            Loading master schedule matrix...
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No courts found for selected sport.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24 border-r border-gray-200">
                    Time Slot
                  </th>
                  {filteredCourts.map((court) => (
                    <th
                      key={court.id}
                      className="p-3 text-xs font-black text-gray-800 uppercase tracking-wider min-w-[200px] border-r border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>{court.name}</span>
                        <span className="text-[10px] font-semibold text-gray-400 normal-case">
                          ₹{court.hourly_rate_guest}/hr
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {timeSlots.map((timeStr) => {
                  const hourLabel = timeStr.slice(0, 5);
                  return (
                    <tr key={timeStr} className="hover:bg-gray-50/50">
                      {/* Time Column */}
                      <td className="p-3 font-bold text-gray-500 sticky left-0 bg-white border-r border-gray-200 shadow-sm whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{hourLabel}</span>
                        </div>
                      </td>

                      {/* Court Columns */}
                      {filteredCourts.map((court) => {
                        // Find booking for this court & time
                        const booking = bookings.find((b) => {
                          if (b.court_id !== court.id) return false;
                          // Check if time slot falls within start_time and end_time
                          const bookingTime = new Date(b.start_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
                          return bookingTime === timeStr.slice(0, 5);
                        });

                        const isConfirmed = booking?.allocation_status === 'CONFIRMED' && Boolean(booking.booking_id);
                        const isCheckedIn = booking?.allocation_status === 'CHECKED_IN';

                        return (
                          <td
                            key={court.id}
                            className="p-2 border-r border-gray-200 relative align-top"
                          >
                            {booking ? (
                              <div
                                className={`p-2.5 rounded-xl border flex flex-col justify-between h-full space-y-2 transition-all ${
                                  isCheckedIn
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : isConfirmed
                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                    : 'bg-gray-100 border-gray-300 text-gray-500'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-xs truncate">
                                      {booking.allocation_type === 'MAINTENANCE' ? 'Maintenance' : booking.allocation_type === 'SOCIAL_PLAY' ? (booking.event_title || 'Social Play') : (booking.member_name || booking.guest_name || 'Walk-in Guest')}
                                    </span>
                                    <Badge
                                      variant={
                                        isCheckedIn ? 'success' : isConfirmed ? 'primary' : 'neutral'
                                      }
                                    >
                                      {isCheckedIn ? 'Checked-In' : booking.allocation_status}
                                    </Badge>
                                  </div>
                                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                                    {booking.member_code ? `ID: ${booking.member_code}` : `${booking.guest_phone || ''} ${booking.notes || ''}`}
                                  </div>
                                  <div className="text-[10px] font-bold text-gray-600 mt-1">
                                    Paid: ₹{booking.fee_charged}
                                  </div>
                                </div>

                                {/* Desk Actions */}
                                {isConfirmed && (
                                  <div className="flex items-center space-x-1.5 pt-1 border-t border-gray-200/60">
                                    {!isCheckedIn && (
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleCheckIn(booking.booking_id)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-1 text-[10px] font-bold flex items-center justify-center space-x-1"
                                        title="Mark Checked-In"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Check In</span>
                                      </button>
                                    )}
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleCancel(booking.booking_id)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                      title="Cancel Reservation"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Empty Slot: Clickable to Walk-in Book */
                              <button
                                onClick={() => openWalkInModal(court, timeStr)}
                                className="w-full h-12 border-2 border-dashed border-gray-200 rounded-xl hover:border-champion-blue hover:bg-blue-50/40 text-gray-300 hover:text-champion-blue flex items-center justify-center space-x-1 transition-all group"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">Book</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-in Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black uppercase text-champion-dark">
                  Front Desk Quick Reservation
                </h3>
                <p className="text-xs text-gray-500">
                  {modalCourt?.name} • {selectedDate} at {modalTime.slice(0, 5)} (60 Mins)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsGuest(false)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    !isGuest ? 'bg-white shadow-sm text-champion-blue' : 'text-gray-500'
                  }`}
                >
                  Existing Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuest(true)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    isGuest ? 'bg-white shadow-sm text-champion-blue' : 'text-gray-500'
                  }`}
                >
                  Guest / Non-Member
                </button>
              </div>

              {!isGuest ? (
                /* Member Search */
                <div className="space-y-2">
                  <label className="font-bold text-gray-700">Search Member by Name or Code</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Type name, code (e.g. CC-GOLD)..."
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-champion-blue outline-none"
                    />
                  </div>

                  {memberResults.length > 0 && !selectedMember && (
                    <div className="max-h-40 overflow-y-auto border rounded-xl divide-y bg-gray-50">
                      {memberResults.map((m) => (
                        <div
                          key={m.user_id}
                          onClick={() => {
                            setSelectedMember(m);
                            setMemberResults([]);
                          }}
                          className="p-2.5 hover:bg-white cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-gray-800">{m.full_name}</span>
                            <span className="text-[10px] text-gray-500 ml-2">({m.member_code})</span>
                          </div>
                          <Badge variant="primary">{m.plan_name || 'Member'}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedMember && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-blue-900">{selectedMember.full_name}</div>
                        <div className="text-[10px] text-blue-700">
                          {selectedMember.member_code} • {selectedMember.plan_name} Tier
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        className="text-blue-500 hover:text-blue-700 text-[10px] font-bold"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest fields */
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-gray-700">Guest Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-2 border rounded-xl text-xs focus:ring-2 focus:ring-champion-blue outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">Guest Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2 border rounded-xl text-xs focus:ring-2 focus:ring-champion-blue outline-none mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Price summary */}
              <div className="bg-gray-50 p-3 rounded-xl border flex justify-between items-center">
                <span className="text-gray-500 font-medium">Standard Court Rate:</span>
                <span className="font-black text-gray-800 text-sm">
                  ₹{modalCourt?.hourly_rate_guest}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading}
                  className="flex-1 text-xs"
                >
                  {actionLoading ? 'Allocating...' : 'Confirm Reservation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
