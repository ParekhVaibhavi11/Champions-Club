import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { Users, Calendar, Clock, Trophy, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const SocialPlay = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getSocialSessions();
      setSessions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching social sessions:', err);
      setError('Unable to load upcoming Friday Social sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRegister = async (sessionId) => {
    try {
      setRegistering(sessionId);
      setError(null);
      setMessage(null);
      const res = await bookingService.registerSocialSession(sessionId);
      setMessage(res.data.message || 'Successfully joined Friday Social Play!');
      await fetchSessions();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register for this session.');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-champion-blue to-blue-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Weekly Club Tradition</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Friday Social Play Roster</h1>
          <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
            Join fellow Champions Club members every Friday evening! Enjoy friendly doubles rotations, king-of-the-court challenges, and complimentary refreshments. Open to all skill levels.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Sessions Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 font-medium">
          Loading Friday Social roster...
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Upcoming Social Sessions</h3>
          <p className="text-xs text-gray-400 mt-1">Check back next week for upcoming Friday evening social fixtures.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => {
            const dateObj = new Date(session.session_date);
            const dateStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const slotsLeft = session.max_capacity - session.participant_count;
            const isFull = slotsLeft <= 0;
            const fillPercent = Math.min(100, Math.round((session.participant_count / session.max_capacity) * 100));

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-champion-blue">
                        {session.sport_name} • {session.court_name}
                      </div>
                      <h2 className="text-xl font-black text-gray-900 mt-1">{session.title}</h2>
                    </div>
                    <Badge variant={isFull ? 'danger' : 'success'}>
                      {isFull ? 'Session Full' : `${slotsLeft} Slots Open`}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {session.description || 'Doubles matchmaker, casual rally games, social mixer, and club refreshments at the courtside lounge.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-xs">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-champion-blue" />
                      <span className="font-medium">{dateStr}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-champion-blue" />
                      <span className="font-medium">
                        {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>Roster Capacity</span>
                      </span>
                      <span className="font-semibold text-gray-700">
                        {session.participant_count} / {session.max_capacity} Players
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          fillPercent >= 90
                            ? 'bg-red-500'
                            : fillPercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Free entry for club members
                  </div>
                  <Button
                    variant="primary"
                    disabled={isFull || registering === session.id}
                    onClick={() => handleRegister(session.id)}
                    className="px-5 py-2 text-xs"
                  >
                    {registering === session.id ? 'Joining...' : isFull ? 'Full' : 'Join Friday Play'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
