import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import {
  ShieldCheck,
  Calendar,
  Trophy,
  CheckCircle,
  Clock,
  Coffee,
  ShoppingBag,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { cafeService } from '../../services/cafeService';
import { shopService } from '../../services/shopService';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('COURTS'); // 'COURTS' | 'CAFE' | 'SHOP'
  const [bookings, setBookings] = useState([]);
  const [cafeOrders, setCafeOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getMyBookingHistory().catch(() => ({ data: [] })),
      cafeService.getMyOrders().catch(() => ({ data: [] })),
      shopService.getMyOrders().catch(() => ({ data: [] })),
    ])
      .then(([bookingsRes, cafeRes, shopRes]) => {
        setBookings(bookingsRes.data || []);
        setCafeOrders(cafeRes.data || []);
        setShopOrders(shopRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Welcome & Tier Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
        <div className="flex items-center space-x-3">
          {user?.membership_tier ? (
            <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center border border-emerald-200">
              <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
              <span>Membership Active</span>
            </div>
          ) : (
            <Link
              to="/plans"
              className="bg-champion-red hover:bg-champion-red-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
            >
              Explore Membership Plans
            </Link>
          )}
        </div>
      </div>

      {/* Benefits Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Court Discount</span>
            <Calendar className="w-5 h-5 text-champion-red" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.court_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Applied automatically when reserving courts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gear Shop Benefit</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.shop_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Deducted at Pro Shop Counter checkout</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Café & Bar Benefit</span>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-champion-dark">
            {user?.cafe_discount_pct || '0'}% OFF
          </div>
          <p className="text-xs text-gray-500 mt-1">Auto-applied to your dining table tabs</p>
        </div>
      </div>

      {/* Main Activity & Order History Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-champion-dark uppercase">Your Club Activity & Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your court reservations, dine-in meals, and gear receipts.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl border">
            <button
              type="button"
              onClick={() => setActiveTab('COURTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'COURTS' ? 'bg-white text-champion-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Courts ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CAFE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CAFE' ? 'bg-white text-champion-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Café & Bar ({cafeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SHOP')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SHOP' ? 'bg-white text-champion-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Gear Shop ({shopOrders.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading your history...</div>
          ) : activeTab === 'COURTS' ? (
            /* COURT BOOKINGS */
            bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">No court reservations found.</p>
                <Link to="/availability" className="inline-block text-xs font-bold text-champion-red hover:underline">
                  Book a court now →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{booking.sport_name} · {booking.court_name}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {new Date(booking.start_at).toLocaleString()} – {new Date(booking.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-xs sm:text-right">
                      <p className="font-mono font-black text-gray-900 text-sm">₹{Number(booking.fee_charged).toFixed(2)}</p>
                      <p className={`uppercase font-bold text-[10px] mt-1 ${booking.allocation_status === 'CANCELLED' ? 'text-red-600' : 'text-emerald-700'}`}>
                        {booking.allocation_status === 'CANCELLED' ? 'Cancelled' : booking.payment_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'CAFE' ? (
            /* CAFE ORDERS */
            cafeOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Coffee className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">No café orders yet.</p>
                <Link to="/cafe" className="inline-block text-xs font-bold text-champion-red hover:underline">
                  Order to your table →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cafeOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-gray-900">{ord.order_no}</span>
                        <span className="text-xs font-bold text-gray-600">· {ord.table_number || `Table #${ord.table_id}`}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(ord.items || []).map((it, idx) => (
                          <span key={idx} className="mr-2">
                            {it.quantity}× {it.name}{idx < ord.items.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {new Date(ord.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Kitchen Status Stepper Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.kitchen_status === 'SERVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.kitchen_status === 'READY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.kitchen_status === 'SERVED'
                          ? 'Delivered to Table'
                          : ord.kitchen_status === 'READY'
                          ? 'Plated & Coming'
                          : 'Preparing in Kitchen'}
                      </span>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-gray-900 block">
                          ₹{Number(ord.total_amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          {ord.status === 'SETTLED' ? 'Paid on Desk' : 'Pay at Desk on Exit'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* SHOP PURCHASES */
            shopOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">No equipment purchases recorded.</p>
                <Link to="/shop" className="inline-block text-xs font-bold text-champion-red hover:underline">
                  Browse Gear Catalog →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {shopOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-gray-900">{ord.receipt_no}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                          {ord.payment_method}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(ord.items || []).map((it, idx) => (
                          <span key={idx} className="mr-2">
                            {it.quantity}× {it.name} ({it.sku}){idx < ord.items.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Cashier: {ord.cashier_name} · {new Date(ord.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-gray-900 block">
                        ₹{Number(ord.total_amount).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Paid in Full
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};
