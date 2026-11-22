import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courtService } from '../../services/courtService';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Users, 
  Wrench, 
  ArrowRight,
  Filter,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AvailabilityMatrix = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const hasMembership = isAuthenticated && Boolean(
    user?.membership_tier || 
    user?.membership_status === 'ACTIVE' || 
    user?.membership_id ||
    user?.role === 'member' ||
    user?.role === 'admin'
  );

  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  
  // Selected Filters
  const [selectedSportId, setSelectedSportId] = useState(
    searchParams.get('sport') ? parseInt(searchParams.get('sport'), 10) : 1
  );
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    toLocalDateString(new Date())
  );

  // Availability State
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(false);

  // 1. Initial Load: Fetch Sports and Courts
  useEffect(() => {
    const initData = async () => {
      try {
        const [sportsRes, courtsRes] = await Promise.all([
          courtService.getSports(),
          courtService.getCourts(),
        ]);
        if (sportsRes.data) setSports(sportsRes.data);
        if (courtsRes.data) {
          setCourts(courtsRes.data);
          // Set initial court
          const currentSportCourts = courtsRes.data.filter(
            (c) => c.sport_id === selectedSportId
          );
          if (currentSportCourts.length > 0) {
            setSelectedCourtId(currentSportCourts[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. When Sport changes, auto-select first court of that sport
  useEffect(() => {
    if (courts.length > 0) {
      const sportCourts = courts.filter((c) => c.sport_id === selectedSportId);
      if (sportCourts.length > 0 && !sportCourts.some((c) => c.id === selectedCourtId)) {
        setSelectedCourtId(sportCourts[0].id);
      }
    }
  }, [selectedSportId, courts]);

  // 3. Fetch Matrix Slots when selectedCourtId or selectedDate changes
  useEffect(() => {
    if (!selectedCourtId) return;

    const fetchMatrix = async (showLoading = true) => {
      if (showLoading) setMatrixLoading(true);
      try {
        const res = await courtService.getCourtAvailability(selectedCourtId, selectedDate);
        if (res.data) setAvailabilityData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoading) setMatrixLoading(false);
      }
    };
    fetchMatrix();
    const refreshInterval = window.setInterval(() => fetchMatrix(false), 30_000);
    return () => window.clearInterval(refreshInterval);
  }, [selectedCourtId, selectedDate]);

  const activeSportCourts = courts.filter((c) => c.sport_id === selectedSportId);
  const currentCourt = courts.find((c) => c.id === selectedCourtId);

  // Quick Date helpers (Today, Tomorrow, Day After)
  const getQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return toLocalDateString(d);
  };

  const todayStr = getQuickDate(0);
  const tomorrowStr = getQuickDate(1);
  const dayAfterStr = getQuickDate(2);

  return (
    <div className="min-h-screen bg-champion-grey py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-champion-red uppercase tracking-wider transition-colors group p-1.5 -ml-1.5 rounded-lg hover:bg-gray-200/60"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-champion-red uppercase tracking-widest flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" /> Real-Time Conflict-Free Engine
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black text-champion-dark uppercase tracking-tight">
              Court Availability Matrix
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium">
              Check free, booked, and social play slots for today or upcoming dates across all 7 championship courts.
            </p>
          </div>

          {!hasMembership && (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="bg-champion-red hover:bg-champion-red-hover text-white text-xs uppercase font-extrabold tracking-wider px-5 py-3 rounded-xl shadow-md transition-all flex items-center"
              >
                <span>Sign In to Book</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          )}
        </div>

        {/* FILTER BAR CONTAINER */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 mb-8">
          
          {/* 1. Sport Selector Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
              1. Select Sport Discipline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {sports.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSportId(s.id)}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                    selectedSportId === s.id
                      ? 'bg-champion-dark text-white shadow-md ring-2 ring-champion-red'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Court Selector & Date Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100 items-end">
            
            {/* Court Pills */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                2. Select Court Arena
              </label>
              <div className="flex flex-wrap gap-2">
                {activeSportCourts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCourtId(c.id)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      selectedCourtId === c.id
                        ? 'bg-champion-red text-white border-champion-red shadow-md scale-102'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Quick Chips & Input */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                3. Select Date
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    selectedDate === todayStr ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    selectedDate === tomorrowStr ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(dayAfterStr)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    selectedDate === dayAfterStr ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  +2 Days
                </button>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-mono font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-champion-red"
              />
            </div>

          </div>

        </div>

        {/* LEGEND STRIP & COURT DETAILS */}
        {currentCourt && (
          <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black uppercase tracking-tight">{currentCourt.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-gray-300 border border-neutral-700">
                  {currentCourt.surface_type}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center space-x-4">
                <span>Member Rate: <strong className="text-emerald-400">{parseFloat(currentCourt.hourly_rate_member) === 0 ? 'FREE' : `₹${currentCourt.hourly_rate_member}/hr`}</strong></span>
                <span>•</span>
                <span>Guest Rate: <strong className="text-white">₹{currentCourt.hourly_rate_guest}/hr</strong></span>
                <span>•</span>
                <span>Hours: <strong>06:00 - 22:00</strong></span>
              </div>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center flex-wrap gap-3 text-xs font-bold">
              <span className="flex items-center text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Available (60m)
              </span>
              <span className="flex items-center text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span> Booked
              </span>
              <span className="flex items-center text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></span> Friday Social
              </span>
              <span className="flex items-center text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 mr-1.5"></span> Past / Maint.
              </span>
            </div>
          </div>
        )}

        {/* 30-MIN INTERVAL SLOTS MATRIX */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-base font-black text-champion-dark uppercase tracking-tight flex items-center">
              <Clock className="w-4 h-4 mr-2 text-champion-red" />
              Schedule Matrix for {selectedDate}
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              One-hour booking slots
            </span>
          </div>

          {matrixLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-champion-red"></div>
            </div>
          ) : !availabilityData?.slots || availabilityData.slots.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No slots available for this court selection.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availabilityData.slots.map((slot, index) => {
                const isAvailable = slot.status === 'AVAILABLE';
                const isBooked = slot.status === 'BOOKED';
                const isSocial = slot.status === 'SOCIAL';
                const isPast = slot.status === 'PAST';
                const isMaintenance = slot.status === 'MAINTENANCE';

                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                      isAvailable
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:border-emerald-500 hover:shadow-md'
                        : isBooked
                        ? 'bg-red-50/70 border-red-200 text-red-900'
                        : isSocial
                        ? 'bg-purple-50 border-purple-200 text-purple-900'
                        : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black font-mono tracking-tight">
                        {slot.startHourMinute}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        {slot.displayTime}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200/40">
                      {isAvailable ? (
                        <Link
                          to={`/member/book-court?court_id=${selectedCourtId}&date=${selectedDate}&start=${slot.startTime}`}
                          className="inline-block w-full py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Book Slot
                        </Link>
                      ) : isBooked ? (
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                          Occupied
                        </span>
                      ) : isSocial ? (
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                          Social Play
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {isPast ? 'Passed' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
