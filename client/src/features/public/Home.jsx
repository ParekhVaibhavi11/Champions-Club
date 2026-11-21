import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Trophy, 
  Activity, 
  ShoppingBag, 
  Coffee, 
  Users, 
  Clock, 
  Sparkles, 
  Check, 
  PhoneCall,
  Flame,
  Award,
  ChevronRight,
  MapPin
} from 'lucide-react';

export const Home = () => {
  const sports = [
    {
      id: 'tennis',
      name: 'Tennis Arena',
      courts: '2 Courts (Clay & Hard)',
      desc: 'Tournament red clay & synthetic acrylic hard courts with competition floodlights.',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000&auto=format&fit=crop',
      badge: 'Clay & Hard',
    },
    {
      id: 'cricket',
      name: 'Cricket Turf Nets',
      courts: '2 Batting Nets',
      desc: 'Full-length turf batting nets with automated variable-speed bowling machines.',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
      badge: 'Bating Nets',
    },
    {
      id: 'padel',
      name: 'Panoramic Padel',
      courts: '1 Panoramic Glass Court',
      desc: 'Enclosed 12mm tempered panoramic glass court with tournament monofilament turf.',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop',
      badge: 'Panoramic Glass',
    },
    {
      id: 'badminton',
      name: 'Badminton Arena',
      courts: '2 BWF Standard Courts',
      desc: 'Olympic BWF synthetic tournament mats over shock-cushioned wooden sub-flooring.',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop',
      badge: 'BWF Certified',
    },
  ];

  const plans = [
    {
      tier: 'GOLD',
      title: 'Gold VIP Pass',
      fee: '₹9,999',
      period: '/ month',
      popular: true,
      features: [
        '100% Free Court Bookings',
        '20% Off Gear Shop Purchases (POS)',
        '15% Off Fuel Café & Bar Running Tabs',
        '10 Free Court Hours Monthly Included',
        'Priority Access to Friday Social Sessions',
      ],
      cta: 'Join Gold Tier',
    },
    {
      tier: 'SILVER',
      title: 'Silver Standard',
      fee: '₹4,999',
      period: '/ month',
      popular: false,
      features: [
        '25% Off Court Booking Rates',
        '10% Off Gear Shop Purchases (POS)',
        '10% Off Fuel Café & Bar Tabs',
        '2 Free Court Hours Monthly Included',
        'Access to Friday Social Play Sessions',
      ],
      cta: 'Choose Silver',
    },
    {
      tier: 'JUNIOR',
      title: 'Junior Under-18',
      fee: '₹2,999',
      period: '/ month',
      popular: false,
      features: [
        '50% Off Court Booking Rates',
        '15% Off Gear Shop Purchases (POS)',
        '10% Off Fuel Café & Bar Tabs',
        'Youth Academy Training Access',
        'Guardian Account Linking & Safeguarding',
      ],
      cta: 'Sign Up Junior',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-champion-grey text-champion-dark">
      
      {/* 1. CINEMATIC ATHLETE HERO SECTION */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        
        {/* Dynamic High-Definition Athlete Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105 motion-safe:animate-pulse duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')`,
            filter: 'brightness(0.38) contrast(1.2)',
          }}
        />

        {/* Brand Dark Gradient & Mesh Vignettes */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/50 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />

        {/* Hero Body Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          
          {/* Status Chip */}
          <div className="inline-flex items-center space-x-2.5 bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-200 mb-6 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-champion-red animate-ping" />
            <span className="text-white">Champions Club Arena</span>
            <span className="text-gray-500">•</span>
            <span className="text-champion-red">Unified Sports Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white drop-shadow-xl">
            Train Hard.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-champion-red via-red-500 to-amber-500">
              Play Like A Champion.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-300 font-normal leading-relaxed drop-shadow">
            The premier multi-sport arena uniting Olympic-standard courts, automated cricket turf, pro equipment shop, and an artisanal fuel café under one frictionless digital platform.
          </p>

          {/* Dual Main CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto sm:max-w-none">
            <Link
              to="/availability"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-champion-red hover:bg-champion-red-hover text-white text-sm sm:text-base font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl shadow-red-950/60 hover:shadow-red-800/70 transition-all hover:-translate-y-0.5"
            >
              <Calendar className="w-5 h-5 mr-2.5" />
              <span>Live Court Availability</span>
            </Link>

            <Link
              to="/plans"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-sm sm:text-base font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
            >
              <span>Explore Memberships</span>
              <ArrowRight className="w-5 h-5 ml-2.5 text-champion-red" />
            </Link>
          </div>

          {/* Club KPI Banner Strip */}
          <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-black text-white">4</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Disciplines</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-black text-champion-red">7</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Championship Courts</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-black text-white">100%</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Conflict-Free (GiST)</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-black text-amber-500">24/7</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Real-Time Portal</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SPORT DISCIPLINES & ARENAS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-champion-red uppercase tracking-widest flex items-center">
              <Trophy className="w-4 h-4 mr-1.5" /> High-Performance Facilities
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black text-champion-dark uppercase tracking-tight">
              Olympic & Pro Arenas
            </h2>
          </div>
          <Link
            to="/sports"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-champion-red hover:underline"
          >
            Detailed Sport Specifications <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sports.map((sport) => (
            <div 
              key={sport.id}
              className="group relative rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between cursor-pointer"
            >
              <div 
                className="h-72 bg-cover bg-center brightness-75 group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
                style={{ backgroundImage: `url('${sport.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-end">
                <span className="inline-block px-2.5 py-1 rounded bg-champion-red/90 text-white text-[10px] font-black uppercase tracking-wider self-start mb-2 shadow">
                  {sport.badge}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{sport.name}</h3>
                <p className="text-xs font-semibold text-gray-300 mt-0.5">{sport.courts}</p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{sport.desc}</p>
                <Link
                  to="/availability"
                  className="mt-4 inline-flex items-center text-xs font-bold text-white uppercase tracking-wider group-hover:text-champion-red transition-colors"
                >
                  Check Free Slots <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW THE USER FLOW WORKS */}
      <section className="bg-white py-20 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-champion-red uppercase tracking-widest">
              Frictionless Club Experience
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-champion-dark uppercase tracking-tight">
              How Champions Club Works
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              No paper slips, no double-booked courts, no waiting in lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-champion-grey border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-champion-dark text-white font-black text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-black text-champion-dark uppercase">Browse & Discover</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Check real-time court availability, inspect membership benefits, and browse in-store gear online before visiting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-champion-grey border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-champion-red text-white font-black text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-black text-champion-dark uppercase">Book In 30 Seconds</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Select your sport, choose a 60-min slot. Our PostgreSQL GiST engine guarantees your court is 100% reserved.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-champion-grey border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-champion-dark text-white font-black text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-black text-champion-dark uppercase">Pro Shop & POS</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Visit our physical gear counter. Your member tier discount automatically deducts at the staff POS terminal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-champion-grey border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-champion-red text-white font-black text-sm flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-base font-black text-champion-dark uppercase">Fuel & Unwind</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Open a table tab at the Café Bar. Orders flow instantly to the kitchen display and settle via Cash, Card, or UPI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP TIERS COMPARISON (IN RUPEES ₹ WITH HOVER POPUP EFFECT) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-champion-red uppercase tracking-widest">
            Elevate Your Game
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-champion-dark uppercase tracking-tight">
            Membership Plans (₹ INR)
          </h2>
          <p className="mt-3 text-sm text-gray-600 font-medium">
            Hover over cards to see tier entitlements. Billed in Indian Rupees with automatic discount computation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 pb-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out transform hover:-translate-y-3 hover:shadow-2xl ${
                plan.popular
                  ? 'bg-champion-dark text-white shadow-xl ring-2 ring-champion-red md:scale-105 z-10 hover:ring-4 hover:ring-amber-500'
                  : 'bg-white text-champion-dark border-2 border-gray-200 shadow-md hover:border-champion-dark hover:shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                    plan.popular ? 'bg-champion-red text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.tier} PLAN
                  </span>
                  {plan.popular && (
                    <span className="text-xs font-bold text-amber-400 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Most Popular
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight">{plan.title}</h3>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-black text-champion-red">{plan.fee}</span>
                  <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${
                    plan.popular ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-3.5 text-xs sm:text-sm">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 ${
                        plan.popular ? 'text-amber-400' : 'text-emerald-600'
                      }`} />
                      <span className={plan.popular ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/20">
                <Link
                  to="/contact"
                  className={`w-full py-4 rounded-xl text-center text-xs font-extrabold uppercase tracking-wider block transition-all shadow-md hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-champion-red hover:bg-champion-red-hover text-white shadow-red-950/50'
                      : 'bg-champion-dark hover:bg-black text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FRIDAY SOCIAL PLAY CALLOUT */}
      <section className="bg-neutral-900 text-white py-16 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-champion-red text-xs font-bold uppercase tracking-widest mb-2">
              <Users className="w-4 h-4" />
              <span>Weekly Club Tradition</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Friday Social Play Sessions
            </h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              Every Friday at 18:00. Members gather for dynamic mixed doubles, rotating court rallies, and post-match drinks at the Fuel Café.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center bg-champion-red hover:bg-champion-red-hover text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <span>Register for Friday Session</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* 6. LOCATION & CONTACT / TRIAL ACTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold text-champion-red uppercase tracking-wider">
              Experience Champions Club
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-champion-dark uppercase tracking-tight mt-1">
              Ready for a Trial Session?
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-lg">
              Book a free court assessment or schedule a guided facility tour with our front desk managers today.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-champion-red" /> Central Sports Hub, Arena 1</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-champion-red" /> Open Daily: 06:00 - 22:00</span>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center bg-champion-dark hover:bg-black text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 mr-2 text-champion-red" />
            <span>Request Trial Inquiry</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
