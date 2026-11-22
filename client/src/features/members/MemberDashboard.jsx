import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { ShieldCheck, Calendar, Trophy, CheckCircle, Clock } from 'lucide-react';
import { bookingService } from '../../services/bookingService';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    bookingService.getMyBookingHistory()
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error('Unable to load booking history:', err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-champion-dark uppercase">
              Welcome back, {user?.full_name}!
            </h1>
            <Badge variant={user?.membership_tier ? user.membership_tier.toLowerCase() : 'default'}>
              {user?.membership_tier || 'MEMBER'} TIER
            </Badge>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Member Code: {user?.member_code || 'CC-MEMBER'} • Phone: {user?.phone || 'N/A'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user?.membership_tier ? (
            <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded flex items-center border border-emerald-200">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
              Membership Active
            </div>
          ) : (
            <Link to="/plans" className="bg-champion-red text-white text-xs font-bold px-3 py-2 rounded hover:bg-champion-red-hover">
              Explore Membership Plans
            </Link>
          )}
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-black text-champion-dark uppercase">Court Booking History</h2>
          <Link to="/availability" className="text-xs font-bold text-champion-red hover:underline">Book a court</Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No court bookings yet. Your future reservations will appear here.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{booking.sport_name} · {booking.court_name}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(booking.start_at).toLocaleString()} – {new Date(booking.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-xs sm:text-right">
                  <p className="font-bold text-gray-800">₹{Number(booking.fee_charged).toFixed(2)}</p>
                  <p className={`uppercase font-bold mt-1 ${booking.allocation_status === 'CANCELLED' ? 'text-red-600' : 'text-emerald-700'}`}>
                    {booking.allocation_status === 'CANCELLED' ? 'Cancelled' : booking.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Court Discount</span>
            <Calendar className="w-5 h-5 text-champion-red" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.court_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Applies automatically to court bookings</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gear Shop Benefit</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.shop_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Applied at Staff POS checkout</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Café & Bar Benefit</span>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.cafe_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Applied when settling open table tabs</p>
        </div>
      </div>
    </div>
  );
};
