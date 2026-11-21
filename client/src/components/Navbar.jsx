import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Trophy, ShoppingBag, Calendar, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-[#111111] text-white border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C8102E] flex items-center justify-center font-bold text-white tracking-wider shadow-lg">
            CC
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight font-display uppercase block leading-none">Champions</span>
            <span className="text-xs font-semibold text-neutral-400 tracking-widest uppercase block leading-none">Club</span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="text-neutral-300 hover:text-white transition">Home</Link>
          <Link to="/availability" className="text-neutral-300 hover:text-white transition">Courts Schedule</Link>
          <Link to="/shop" className="text-neutral-300 hover:text-white transition flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#C8102E]" />
            Gear Shop
          </Link>
          <Link to="/contact" className="text-neutral-300 hover:text-white transition">Free Trial & Contact</Link>
        </nav>

        {/* User Status / Action */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded text-neutral-300 uppercase font-semibold">
                {user.role.replace('_', ' ')}
              </span>

              {user.role === 'member' && (
                <Link to="/member/book-court" className="bg-[#C8102E] hover:bg-red-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition">
                  Book Court
                </Link>
              )}

              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="bg-[#C8102E] hover:bg-red-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition">
                  Admin Portal
                </Link>
              )}

              {user.role === 'front_desk' && (
                <Link to="/desk/calendar" className="bg-[#C8102E] hover:bg-red-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition">
                  Front Desk
                </Link>
              )}

              {user.role === 'staff' && (
                <Link to="/staff/shop-pos" className="bg-[#C8102E] hover:bg-red-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition">
                  Staff POS
                </Link>
              )}

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#C8102E] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md transition shadow-md"
            >
              Member Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
