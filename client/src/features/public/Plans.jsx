import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  Award,
  CheckCircle,
  X,
  ShoppingBag,
  Coffee,
  RefreshCw,
  Zap
} from 'lucide-react';

export const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberProfile, setMemberProfile] = useState(null);
  const [selectedExplorePlan, setSelectedExplorePlan] = useState(null);
  const { user, isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (user?.id) {
      membershipService.getMemberById(user.id)
        .then((res) => {
          if (res.data) setMemberProfile(res.data);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const currentTier = (memberProfile?.plan_tier || user?.membership_tier || '')?.toUpperCase();
  const hasActiveMembership = isAuthenticated && (
    Boolean(currentTier) || 
    user?.membership_status === 'ACTIVE' || 
    Boolean(user?.membership_id) ||
    Boolean(memberProfile?.membership_id)
  );

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
        <div className="text-center max-w-3xl mx-auto mb-12">
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

        {/* Active Member Status Banner */}
        {hasActiveMembership && currentTier && (
          <div className="max-w-2xl mx-auto mb-12 p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/30 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Active Membership: {currentTier} PLAN
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    Current Pass
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  You have enrolled in the {currentTier} tier. Your privileges and rate discounts are active.
                </p>
              </div>
            </div>
            <Link
              to="/member/membership"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md flex-shrink-0"
            >
              <span>Explore Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

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
              const isCurrentPlan = hasActiveMembership && currentTier === plan.tier?.toUpperCase();

              return (
                <div
                  key={plan.id}
                  className={`group relative rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out transform hover:-translate-y-3 hover:shadow-2xl ${
                    isCurrentPlan
                      ? isGold
                        ? 'bg-champion-dark text-white shadow-2xl ring-4 ring-emerald-500 md:scale-105 z-10'
                        : 'bg-white text-champion-dark border-2 border-emerald-500 shadow-2xl ring-4 ring-emerald-500'
                      : isGold
                      ? 'bg-champion-dark text-white shadow-xl ring-2 ring-champion-red md:scale-105 z-10 hover:ring-4 hover:ring-amber-500'
                      : isSilver
                      ? 'bg-white text-champion-dark border-2 border-gray-200 shadow-md hover:border-slate-400 hover:shadow-slate-300/50'
                      : 'bg-white text-champion-dark border-2 border-gray-200 shadow-md hover:border-emerald-500 hover:shadow-emerald-200/50'
                  }`}
                >
                  {/* Subtle top indicator on hover */}
                  {isCurrentPlan ? (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg bg-emerald-600 text-white border-2 border-white flex items-center space-x-1.5 z-20">
                      <CheckCircle className="w-4 h-4" />
                      <span>You Have Taken This Plan</span>
                    </div>
                  ) : (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md transition-opacity duration-200 opacity-90 group-hover:opacity-100 ${
                      isGold
                        ? 'bg-gradient-to-r from-champion-red to-amber-500 text-white'
                        : isSilver
                        ? 'bg-slate-700 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isGold ? '★ VIP Recommended' : isSilver ? 'Standard Athlete' : 'Youth Academy'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                          isGold ? 'bg-champion-red text-white' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.tier} PLAN
                        </span>
                        {isCurrentPlan && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> Active
                          </span>
                        )}
                      </div>
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

                    {/* Current Plan Highlight */}
                    {isCurrentPlan && (
                      <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                        isGold 
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                        <span>You have taken this plan. Your benefits are active.</span>
                      </div>
                    )}

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
                  <div className="mt-10 pt-6 border-t border-gray-200/20 space-y-2.5">
                    {isCurrentPlan ? (
                      <>
                        <Link
                          to="/member/membership"
                          className="w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-wider block transition-all shadow-md group-hover:scale-[1.02] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2 shadow-emerald-900/30"
                        >
                          <span>Explore Your Membership</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExplorePlan(plan);
                          }}
                          className={`w-full py-2.5 rounded-xl text-center text-[11px] font-black uppercase tracking-wider block transition-colors border ${
                            isGold
                              ? 'border-neutral-700 text-gray-300 hover:bg-neutral-800 hover:text-white'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-champion-dark'
                          }`}
                        >
                          Explore Plan Entitlements
                        </button>
                      </>
                    ) : hasActiveMembership ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExplorePlan(plan);
                          }}
                          className={`w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-wider block transition-all shadow-md group-hover:scale-[1.02] ${
                            isGold
                              ? 'bg-champion-red hover:bg-champion-red-hover text-white shadow-red-950/60'
                              : 'bg-champion-dark hover:bg-black text-white'
                          }`}
                        >
                          Explore {plan.tier} Plan
                        </button>
                        <Link
                          to="/contact"
                          className={`w-full py-2 text-center text-[11px] font-bold uppercase tracking-wider block transition-colors ${
                            isGold ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-champion-dark'
                          }`}
                        >
                          Inquire to Switch Plan
                        </Link>
                      </>
                    ) : (
                      <>
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExplorePlan(plan);
                          }}
                          className={`w-full py-2 text-center text-[11px] font-bold uppercase tracking-wider block transition-colors ${
                            isGold ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-champion-dark'
                          }`}
                        >
                          Explore Plan Details
                        </button>
                      </>
                    )}
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

        {/* Explore Plan Modal */}
        {selectedExplorePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setSelectedExplorePlan(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-champion-dark hover:bg-gray-100 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 mb-3">
                <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                  selectedExplorePlan.tier === 'GOLD' ? 'bg-champion-red text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedExplorePlan.tier} PLAN
                </span>
                {hasActiveMembership && currentTier === selectedExplorePlan.tier?.toUpperCase() && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> You Have Taken This Plan
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-champion-dark uppercase tracking-tight">
                {selectedExplorePlan.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {selectedExplorePlan.description}
              </p>

              <div className="mt-4 flex items-baseline border-b border-gray-100 pb-4">
                <span className="text-3xl sm:text-4xl font-black text-champion-red">
                  ₹{parseInt(selectedExplorePlan.monthly_fee, 10).toLocaleString('en-IN')}
                </span>
                <span className="ml-2 text-xs font-bold text-gray-400 uppercase">/ Month</span>
              </div>

              {/* Entitlement Breakdown */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="p-2 rounded-xl bg-red-100 text-champion-red flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Court Allocation Rate</span>
                    <p className="text-sm font-black text-champion-dark">
                      {parseFloat(selectedExplorePlan.court_discount_pct) === 100
                        ? '100% Free Court Access'
                        : `${parseFloat(selectedExplorePlan.court_discount_pct)}% Off Hourly Rates`}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Includes {selectedExplorePlan.free_court_hours_per_month} free playing hours monthly with PostgreSQL GiST double-booking protection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Pro Shop Discount</span>
                    <p className="text-sm font-black text-champion-dark">
                      {parseFloat(selectedExplorePlan.shop_discount_pct)}% Off In-Store Gear
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Applied instantly at physical Staff POS counter on rackets, grips, shoes, and balls.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Café & Bar Dining</span>
                    <p className="text-sm font-black text-champion-dark">
                      {parseFloat(selectedExplorePlan.cafe_discount_pct)}% Off Fuel Café Running Tabs
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Automatically calculated upon tab settlement managed through the Kitchen Display queue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-600 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Daily Quota & Social Entry</span>
                    <p className="text-sm font-black text-champion-dark">
                      Max {selectedExplorePlan.max_daily_sessions} Confirmed Playing Sessions / Day
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Guaranteed fair athletic access across all 7 courts with priority Friday Social Play entry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExplorePlan(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                {hasActiveMembership && currentTier === selectedExplorePlan.tier?.toUpperCase() ? (
                  <Link
                    to="/member/membership"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102"
                  >
                    <span>Explore Digital Pass & Benefits</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-champion-red hover:bg-champion-red-hover text-white shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102"
                  >
                    <span>{hasActiveMembership ? 'Inquire to Switch' : 'Inquire for Membership'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
