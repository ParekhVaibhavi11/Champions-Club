import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, ShoppingBag, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#111111] text-white py-20 lg:py-28 relative overflow-hidden border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Zap className="w-3.5 h-3.5" /> High-Performance Athletics
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display uppercase leading-tight mb-6">
              Unleash Your <span className="text-[#C8102E]">Championship</span> Potential
            </h1>
            <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
              World-class clay tennis, panoramic padel, turf cricket nets, and professional badminton courts. Experience sports facility management engineered for athletes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/availability"
                className="bg-[#C8102E] hover:bg-red-700 text-white font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2 shadow-lg transition"
              >
                View Live Courts <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2 border border-neutral-700 transition"
              >
                <ShoppingBag className="w-4 h-4 text-[#C8102E]" /> Explore Gear Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Cards */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#111111]">Premier Sporting Arenas</h2>
          <p className="text-neutral-500 text-sm mt-2">Bookable 1-hour slots with verified database zero-overlap protection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Clay & Hard Tennis', icon: '🎾', desc: 'Championship grade clay & US Open cushioned acrylic.' },
            { name: 'Panoramic Padel', icon: '🏸', desc: 'World Padel Tour regulation 12mm tempered glass.' },
            { name: 'Cricket Nets', icon: '🏏', desc: 'Automatic bowling machines with video trajectory analysis.' },
            { name: 'BWF Badminton', icon: '🏸', desc: 'Shock absorbing 8-layer competition vinyl courts.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-base text-[#111111]">{item.name}</h3>
              <p className="text-xs text-neutral-600 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop Rule Callout Banner */}
      <section className="bg-white border-y border-neutral-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-[#C8102E]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#111111] text-base">Club Pro Gear Shop</h4>
              <p className="text-xs text-neutral-500">Live online stock tracker. Purchases made strictly in-person at the Club Counter.</p>
            </div>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[#C8102E] hover:underline"
          >
            Check Live Inventory &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
