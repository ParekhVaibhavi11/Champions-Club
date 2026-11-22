import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courtService } from '../../services/courtService';
import { 
  Trophy, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Layers, 
  Zap,
  Activity,
  Feather
} from 'lucide-react';

export const SportsShowcase = () => {
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsRes, courtsRes] = await Promise.all([
          courtService.getSports(),
          courtService.getCourts(),
        ]);
        if (sportsRes.data) setSports(sportsRes.data);
        if (courtsRes.data) setCourts(courtsRes.data);
      } catch (err) {
        console.error('Failed to load sports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sportImages = {
    tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1200&auto=format&fit=crop',
    cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop',
    padel: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
    badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
  };

  const sportSpecs = {
    tennis: [
      'Red Clay & US Open Acrylic Hard Court Options',
      'High-lumen LED anti-glare floodlight systems (750 lux)',
      'Competition tournament netting with precision strap tensioners',
      'Covered player benches and hydration coolers',
    ],
    cricket: [
      'Dual indoor turf batting nets with genuine bounce profiles',
      'Automated digital bowling machines (up to 155 km/h)',
      'High-durability catch nets and safety rebound padding',
      'Full bowler run-up strip with run-up markers',
    ],
    padel: [
      '12mm panoramic tempered glass enclosure with zero corner posts',
      'Textured Supercourt monofilament turf with uniform sand infill',
      'Custom acoustic acoustics designed for optimal ball resonance',
      'Official World Padel Tour specification dimensions (10m x 20m)',
    ],
    badminton: [
      'BWF Grade 1 certified synthetic non-slip court mats',
      'Sub-floor multi-layer timber shock absorption system',
      'Matte dark arena backdrop for maximum shuttlecock contrast',
      'Precision height net posts and competition umpire stations',
    ],
  };

  return (
    <div className="min-h-screen bg-champion-grey py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-extrabold text-champion-red uppercase tracking-widest flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-1.5" /> Olympic & Tournament Grade
          </span>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black text-champion-dark uppercase tracking-tight">
            Sports Arenas & Facilities
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
            Every arena at Champions Club is engineered for athletic peak performance. Explore our 4 major sporting disciplines and 7 championship courts.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champion-red"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {sports.map((sport, index) => {
              const sportCourts = courts.filter((c) => c.sport_id === sport.id);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={sport.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
                >
                  {/* Left / Right Hero Imagery */}
                  <div className={`lg:col-span-5 relative min-h-[300px] lg:min-h-full ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div
                      className="absolute inset-0 bg-cover bg-center brightness-90 transition-transform duration-700 hover:scale-105"
                      style={{
                        backgroundImage: `url('${sportImages[sport.slug] || sportImages.tennis}')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <span className="px-3 py-1 rounded bg-champion-red text-white text-[10px] font-black uppercase tracking-wider inline-block mb-2 shadow">
                        {sport.court_count} Active Courts
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{sport.name}</h3>
                      <p className="text-xs text-gray-300 mt-1 font-medium">{sport.description}</p>
                    </div>
                  </div>

                  {/* Right / Left Arena Specs & Court List */}
                  <div className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-champion-red flex items-center">
                          <Layers className="w-4 h-4 mr-1.5" /> Architectural Specifications
                        </span>
                        <Link
                          to={`/availability?sport=${sport.id}`}
                          className="text-xs font-bold text-gray-700 hover:text-champion-red flex items-center group"
                        >
                          <span>Live Schedule</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                      {/* Technical specifications */}
                      <ul className="space-y-3 mb-8">
                        {(sportSpecs[sport.slug] || []).map((spec, idx) => (
                          <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
                            <Check className="w-4 h-4 text-emerald-600 mr-2.5 flex-shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Court Surface & Hourly Rate Cards */}
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
                        Configured Championship Courts & Rates (₹ INR)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {sportCourts.map((c) => (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="font-bold text-sm text-champion-dark">{c.name}</div>
                              <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                                Surface: <span className="font-semibold text-gray-700">{c.surface_type}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-gray-400 block font-sans uppercase">Member</span>
                                <span className="font-bold text-emerald-700">
                                  {parseFloat(c.hourly_rate_member) === 0 ? 'FREE' : `₹${c.hourly_rate_member}/hr`}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block font-sans uppercase">Guest</span>
                                <span className="font-bold text-gray-700">₹{c.hourly_rate_guest}/hr</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <Link
                        to={`/availability?sport=${sport.id}`}
                        className="inline-flex items-center justify-center w-full sm:w-auto bg-champion-dark hover:bg-black text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md hover:scale-102"
                      >
                        <Calendar className="w-4 h-4 mr-2 text-champion-red" />
                        <span>Check {sport.name} Slot Availability</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
