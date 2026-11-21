import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { membershipService } from '../../services/membershipService';
import { 
  Check, 
  Sparkles, 
  Trophy, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Activity, 
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Flame,
  Award
} from 'lucide-react';

export const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await membershipService.getPlans();
        if (res.data) setPlans(res.data);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const generalClubRules = [
    {
      title: 'PostgreSQL GiST Double-Booking Protection',
      rule: 'All courts operate under strict zero-overlap concurrency locks. Confirmed allocations cannot be double-booked.',
      badge: 'Zero Overlap',
    },
    {
      title: 'Daily Member Quota Limit (Max 2 Sessions/Day)',
      rule: 'To maintain fair court access across all athletes, each member is entitled to a maximum of 2 confirmed playing sessions per calendar day.',
      badge: 'Quota Rule',
    },
    {
      title: '60-Minute Slots with 30-Minute Start Alignments',
      rule: 'Court sessions run for exactly 60 minutes, starting at either the hour (:00) or half-hour (:30) marks.',
      badge: 'Slot Timing',
    },
    {
      title: 'Physical In-Store Gear Shop POS Counter Only',
      rule: 'Pro shop items and real-time inventory are browseable online, but purchases can only be completed in-person at the club counter via Staff POS.',
      badge: 'Retail Policy',
    },
    {
      title: 'Café & Kitchen Table Tab Lifecycle',
      rule: 'Open table tabs accumulate food and beverage orders, tracked through the Kitchen Display System (KDS), and settle before checkout.',
      badge: 'Café Policy',
    },
    {
      title: 'Friday Social Play Sessions',
      rule: 'Weekly rotating mixed play every Friday at 18:00. Multiple participants share one reserved court allocation subject to session capacity.',
      badge: 'Social Roster',
    },
  ];

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

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-extrabold text-champion-red uppercase tracking-widest flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-1.5" /> Elite Athlete Entitlements
          </span>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black text-champion-dark uppercase tracking-tight">
            Membership Plans & Pricing
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
            All plans are billed in Indian Rupees (₹). Hover over any plan to inspect interactive entitlements and server-enforced discounts.
          </p>
        </div>

        {/* Plans Grid with Interactive Hover Popup Elevation */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champion-red"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 pb-8">
            {plans.map((plan) => {
              const isGold = plan.tier === 'GOLD';
              const isSilver = plan.tier === 'SILVER';
              const isJunior = plan.tier === 'JUNIOR';

              return (
                <div
                  key={plan.id}
                  className={`group relative rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out transform hover:-translate-y-3 hover:shadow-2xl ${
                    isGold
                      ? 'bg-champion-dark text-white shadow-xl ring-2 ring-champion-red md:scale-105 z-10 hover:ring-4 hover:ring-amber-500'
                      : isSilver
                      ? 'bg-white text-champion-dark border-2 border-gray-200 shadow-md hover:border-slate-400 hover:shadow-slate-300/50'
                      : 'bg-white text-champion-dark border-2 border-gray-200 shadow-md hover:border-emerald-500 hover:shadow-emerald-200/50'
                  }`}
                >
                  {/* Subtle top indicator on hover */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md transition-opacity duration-200 opacity-90 group-hover:opacity-100 ${
                    isGold
                      ? 'bg-gradient-to-r from-champion-red to-amber-500 text-white'
                      : isSilver
                      ? 'bg-slate-700 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isGold ? '★ VIP Recommended' : isSilver ? 'Standard Athlete' : 'Youth Academy'}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                        isGold ? 'bg-champion-red text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.tier} PLAN
                      </span>
                      {isGold && (
                        <span className="text-xs font-bold text-amber-400 flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> All-Access Pass
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight group-hover:text-champion-red transition-colors">
                      {plan.name}
                    </h2>
                    
                    <p className={`text-xs mt-2 line-clamp-2 ${isGold ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>

                    {/* Price in Rupees ₹ */}
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-champion-red">
                        ₹{parseInt(plan.monthly_fee, 10).toLocaleString('en-IN')}
                      </span>
                      <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${
                        isGold ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        / Month
                      </span>
                    </div>

                    {/* Features breakdown */}
                    <div className="mt-8 space-y-3.5 text-xs sm:text-sm">
                      <div className="flex items-center font-bold">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span>
                          {parseFloat(plan.court_discount_pct) === 100
                            ? '100% Free Court Bookings'
                            : `${parseFloat(plan.court_discount_pct)}% Off Court Rates`}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-champion-red' : 'text-emerald-600'}`} />
                        <span>{parseFloat(plan.shop_discount_pct)}% Off Gear Shop Purchases (POS)</span>
                      </div>

                      <div className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-champion-red' : 'text-emerald-600'}`} />
                        <span>{parseFloat(plan.cafe_discount_pct)}% Off Fuel Café & Bar Running Tabs</span>
                      </div>

                      <div className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-champion-red' : 'text-emerald-600'}`} />
                        <span>{plan.free_court_hours_per_month} Free Hours Monthly Included</span>
                      </div>

                      <div className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-champion-red' : 'text-emerald-600'}`} />
                        <span>Max {plan.max_daily_sessions} Playing Sessions Per Day</span>
                      </div>

                      <div className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isGold ? 'text-champion-red' : 'text-emerald-600'}`} />
                        <span>Priority Entry to Friday Social Play</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="mt-10 pt-6 border-t border-gray-200/20">
                    <Link
                      to="/contact"
                      className={`w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-wider block transition-all shadow-md group-hover:scale-[1.02] ${
                        isGold
                          ? 'bg-champion-red hover:bg-champion-red-hover text-white shadow-red-950/60'
                          : 'bg-champion-dark hover:bg-black text-white'
                      }`}
                    >
                      Inquire for {plan.tier} Membership
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* COMPREHENSIVE CLUB RULES & OPERATIONAL POLICIES SECTION */}
        <section className="mt-20 pt-16 border-t border-gray-300">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-champion-red uppercase tracking-widest flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Club Constitution & Fair Play Rules
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-champion-dark uppercase tracking-tight">
              Rules & Benefits Across All Arenas
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Mandatory standards governing court play, retail counter purchases, café tabs, and member entitlements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalClubRules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-champion-red border border-red-200">
                      {rule.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">#0{idx + 1}</span>
                  </div>
                  <h3 className="text-base font-black text-champion-dark uppercase tracking-tight">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {rule.rule}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[11px] font-semibold text-gray-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> System Enforced
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Corporate & Academy Assistance CTA */}
        <div className="mt-16 bg-champion-dark text-white p-8 sm:p-12 rounded-3xl border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Corporate Wellness & Athletic Academies
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              We offer bespoke group memberships, dedicated court block hours, and corporate tournament organizing.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center bg-champion-red hover:bg-champion-red-hover text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <span>Request Corporate Package</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </div>
  );
};
