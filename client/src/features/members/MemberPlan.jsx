
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { membershipService } from '../../services/membershipService';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { 
  Trophy, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  Coffee, 
  QrCode, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const MemberPlan = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await membershipService.getMemberById(user.id);
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user]);

  const handleRenew = async (months) => {
    if (!profile?.membership_id) return;
    setRenewing(true);
    setMessage('');
    try {
      await membershipService.renewMembership(profile.membership_id, months);
      setMessage(`Successfully renewed for +${months} month(s)!`);
      await fetchProfile();
    } catch (err) {
      setMessage(`Renewal failed: ${err.message}`);
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champion-red"></div>
      </div>
    );
  }

  const isGold = profile?.plan_tier === 'GOLD';
  const isSilver = profile?.plan_tier === 'SILVER';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-champion-dark uppercase tracking-tight">
            Digital Membership & Benefits
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Official athletic credential and automatic entitlement rates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={profile?.plan_tier ? profile.plan_tier.toLowerCase() : 'default'}>
            {profile?.plan_tier || 'MEMBER'} TIER
          </Badge>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> ACTIVE
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          message.includes('failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message}
        </div>
      )}

      {/* Digital Athletic Membership Card */}
      <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-2xl transition-all duration-300 ${
        isGold
          ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/80 border-2 border-amber-500/50'
          : isSilver
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-slate-800 border-2 border-slate-400/50'
          : 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-950 border-2 border-emerald-500/50'
      }`}>
        
        {/* Background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Trophy className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-champion-red rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-md">
                CC
              </div>
              <div>
                <span className="text-lg font-black tracking-wider uppercase leading-none block">
                  Champions<span className="text-champion-red">Club</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">
                  Official Athletic Pass
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded border ${
                isGold ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/10 text-white border-white/20'
              }`}>
                {profile?.plan_tier} MEMBER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Athlete Name</span>
              <p className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{profile?.email}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Member Code</span>
              <p className="text-xl font-mono font-black text-champion-red tracking-wider mt-0.5">
                {profile?.member_code || 'CC-MEMBER'}
              </p>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                Expires: {profile?.end_date ? new Date(profile.end_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Auto-Applied Entitlement Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-red-50 text-champion-red rounded-xl border border-red-100 flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Court Discount</span>
            <div className="text-2xl font-black text-champion-dark mt-1">
              {parseFloat(profile?.court_discount_pct || 0)}% OFF
            </div>
            <p className="text-xs text-gray-500 mt-1">Calculated server-side on 60-min sessions</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Gear Shop Discount</span>
            <div className="text-2xl font-black text-champion-dark mt-1">
              {parseFloat(profile?.shop_discount_pct || 0)}% OFF
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-deducted at Staff POS counter</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex-shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Café & Bar Discount</span>
            <div className="text-2xl font-black text-champion-dark mt-1">
              {parseFloat(profile?.cafe_discount_pct || 0)}% OFF
            </div>
            <p className="text-xs text-gray-500 mt-1">Deducted when settling dining tabs</p>
          </div>
        </div>
      </div>

      {/* 1-Click Renewal Options */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-champion-dark uppercase tracking-tight flex items-center">
            <RefreshCw className="w-4 h-4 text-champion-red mr-2" /> Self-Service Plan Renewal
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-lg">
            Extend your membership validity seamlessly. Entitlements continue uninterrupted without downtime.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={renewing}
            onClick={() => handleRenew(1)}
          >
            +1 Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={renewing}
            onClick={() => handleRenew(6)}
          >
            +6 Months
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={renewing}
            onClick={() => handleRenew(12)}
          >
            +1 Year (Best Value)
          </Button>
        </div>
      </div>

    </div>
  );
};
