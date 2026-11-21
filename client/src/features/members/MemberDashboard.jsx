import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { ShieldCheck, Calendar, Trophy, CheckCircle } from 'lucide-react';

export const MemberDashboard = () => {
  const { user } = useAuth();

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
          <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded flex items-center border border-emerald-200">
            <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
            Membership Active
          </div>
        </div>
      </div>

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
