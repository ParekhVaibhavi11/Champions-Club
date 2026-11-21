import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courtService } from '../../services/courtService';
import { bookingService } from '../../services/bookingService';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Trophy, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MemberBookingFlow = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  
  // Selection
  const [selectedSportId, setSelectedSportId] = useState(1);
  const [selectedCourtId, setSelectedCourtId] = useState(
    searchParams.get('court_id') ? parseInt(searchParams.get('court_id'), 10) : null
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Availability matrix
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  // 1. Load Sports and Courts
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          courtService.getSports(),
          courtService.getCourts(),
        ]);
        if (sRes.data) setSports(sRes.data);
        if (cRes.data) {
          setCourts(cRes.data);
          if (!selectedCourtId) {
            setSelectedCourtId(cRes.data[0]?.id || 1);
          } else {
            const court = cRes.data.find(c => c.id === selectedCourtId);
            if (court) setSelectedSportId(court.sport_id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  // 2. Fetch Availability when Court or Date changes
  useEffect(() => {
    if (!selectedCourtId) return;

    const fetchAvail = async () => {
      try {
        const res = await courtService.getCourtAvailability(selectedCourtId, selectedDate);
        if (res.data) {
          setAvailability(res.data);
          // If startTime query param was provided, auto-select it
          const initialStart = searchParams.get('start');
          if (initialStart) {
            const match = res.data.slots.find(s => s.startTime === initialStart && s.status === 'AVAILABLE');
            if (match) setSelectedSlot(match);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvail();
  }, [selectedCourtId, selectedDate]);

  const activeSportCourts = courts.filter((c) => c.sport_id === selectedSportId);
  const currentCourt = courts.find((c) => c.id === selectedCourtId);

  const handleSportSelect = (sportId) => {
    setSelectedSportId(sportId);
    const sportCourts = courts.filter((c) => c.sport_id === sportId);
    if (sportCourts.length > 0) {
      setSelectedCourtId(sportCourts[0].id);
      setSelectedSlot(null);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !selectedCourtId) return;
    setBookingLoading(true);
    setFeedback({ error: '', success: '' });

    try {
      const res = await bookingService.createBooking({
        court_id: selectedCourtId,
        start_time: selectedSlot.startTime,
      });

      setFeedback({
        success: `Booking confirmed! Reservation #${res.data.id} is locked in. Allocation ID: ${res.data.allocation_id}`,
        error: '',
      });
      setSelectedSlot(null);

      // Refresh availability
      const refreshRes = await courtService.getCourtAvailability(selectedCourtId, selectedDate);
      if (refreshRes.data) setAvailability(refreshRes.data);
    } catch (err) {
      setFeedback({
        error: err.message || 'Failed to book court slot.',
        success: '',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Pricing calculation
  const getCalculatedPrice = () => {
    if (!currentCourt) return 0;
    if (!user?.membership_id) return parseFloat(currentCourt.hourly_rate_guest);
    const baseMemberRate = parseFloat(currentCourt.hourly_rate_member);
    const discountPct = parseFloat(user?.court_discount_pct || 0);

    if (discountPct >= 100) return 0;
    if (discountPct > 0) return baseMemberRate * (1 - discountPct / 100);
    return baseMemberRate;
  };

  const calculatedFee = getCalculatedPrice();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Back Link Breadcrumb */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-champion-red uppercase tracking-wider transition-colors group p-1.5 -ml-1.5 rounded-lg hover:bg-gray-200/60"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-champion-red flex items-center">
            <Trophy className="w-4 h-4 mr-1.5" /> Official Member Reservation Portal
          </span>
          <h1 className="text-3xl font-black text-champion-dark uppercase tracking-tight mt-1">
            Book Court Session
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: <strong className="text-gray-800">{user?.full_name}</strong> • 
            Tier: <Badge variant={user?.membership_tier ? user.membership_tier.toLowerCase() : 'default'} className="ml-1.5">
              {user?.membership_tier || 'MEMBER'}
            </Badge>
          </p>
        </div>

        <div className="p-3 bg-red-50 text-champion-red rounded-2xl border border-red-200 text-xs font-bold flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Daily Quota Guard: Max 2 sessions/day</span>
        </div>
      </div>

      {feedback.error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            <span>{feedback.success}</span>
          </div>
          <Link to="/member/dashboard" className="text-xs font-black uppercase underline hover:text-emerald-950 ml-4">
            View My Bookings →
          </Link>
        </div>
      )}

      {/* STEP 1: SPORT SELECTION */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
            Step 1: Choose Sport Arena
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sports.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSportSelect(s.id)}
                className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
                  selectedSportId === s.id
                    ? 'bg-champion-dark text-white shadow-md ring-2 ring-champion-red'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: COURT & DATE PICKER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
          <div className="md:col-span-7">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              Step 2: Choose Championship Court
            </label>
            <div className="flex flex-wrap gap-2">
              {activeSportCourts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCourtId(c.id); setSelectedSlot(null); }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold uppercase transition-all border ${
                    selectedCourtId === c.id
                      ? 'bg-champion-red text-white border-champion-red shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              Step 3: Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
              className="w-full text-xs font-mono font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-champion-red"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: AVAILABLE 60-MIN SLOTS */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-black text-champion-dark uppercase tracking-tight flex items-center">
              <Clock className="w-4 h-4 mr-2 text-champion-red" />
              Step 4: Select 60-Minute Session
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Green slots are free and ready for conflict-free locking.
            </p>
          </div>
          {currentCourt && (
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Your Rate</span>
              <span className="text-sm font-black text-emerald-700">
                {calculatedFee === 0 ? 'FREE (100% OFF)' : `₹${calculatedFee}/hr`}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-champion-red"></div>
          </div>
        ) : !availability?.slots ? (
          <div className="py-8 text-center text-gray-400">Loading availability matrix...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {availability.slots.map((slot, index) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isSelected = selectedSlot?.startTime === slot.startTime;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-champion-red text-white border-champion-red shadow-lg scale-105 z-10'
                      : isAvailable
                      ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="text-xs font-black font-mono">{slot.startHourMinute}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : isAvailable ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {slot.displayTime}
                  </div>
                  <div className="mt-2 text-[9px] font-bold uppercase tracking-wider">
                    {isSelected ? '✓ SELECTED' : isAvailable ? 'AVAILABLE' : slot.status}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* CONFIRM RESERVATION ACTION DRAWER */}
        {selectedSlot && (
          <div className="mt-8 p-6 rounded-2xl bg-champion-dark text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-champion-red font-bold">
                Ready to Lock Allocation
              </span>
              <h4 className="text-xl font-black uppercase tracking-tight mt-0.5">
                {currentCourt?.name} • {selectedSlot.displayTime}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Date: {selectedDate} • Fee: <strong className="text-emerald-400">
                  {calculatedFee === 0 ? '₹0.00 (Tier Benefit)' : `₹${calculatedFee.toFixed(2)}`}
                </strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedSlot(null)}
                className="text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={bookingLoading}
                onClick={handleBookingSubmit}
                className="font-black uppercase tracking-wider text-xs px-8 py-4 shadow-lg shadow-red-950/60"
              >
                {bookingLoading ? 'Reserving Court...' : 'Reserve Court'}
              </Button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
