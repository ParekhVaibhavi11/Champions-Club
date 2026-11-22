import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Badge } from './Badge';
import { LogOut, Menu, X, ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isMember = isAuthenticated && (user?.role === 'member' || Boolean(user?.membership_tier) || Boolean(user?.membership_id));
  const isMemberOrAdmin = isMember || isAdmin;
  const cafePath = isAdmin ? '/admin/cafe' : (isMember ? '/member/cafe' : '/cafe');

  const handleBack = () => {
    // If there is browser history, go back; otherwise navigate to root
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getTierVariant = (tier) => {
    if (tier === 'GOLD') return 'gold';
    if (tier === 'SILVER') return 'silver';
    if (tier === 'JUNIOR') return 'junior';
    return 'default';
  };

  const navLinks = [
    { label: 'Sports Arenas', path: '/sports' },
    { label: 'Court Availability', path: '/availability' },
    { label: 'Memberships', path: '/plans' },
    { label: 'Gear Shop', path: '/shop' },
    { label: 'Café & Bar', path: cafePath },
    ...(isMember
      ? [{ label: 'Book Court', path: '/member/book-court' }]
      : [{ label: 'Guest Booking', path: '/trial' }]),
  ];

  return (
    <header className="bg-champion-dark/95 backdrop-blur-md text-white border-b border-neutral-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left Side: Back Arrow Button (on subpages) + Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {!isHome && (
            <button
              onClick={handleBack}
              title="Go Back"
              className="p-2 sm:p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-gray-300 hover:text-white transition-all shadow-sm active:scale-95 flex items-center group"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-champion-red transition-colors" />
            </button>
          )}

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-champion-red rounded-lg flex items-center justify-center font-black text-lg sm:text-xl tracking-tighter text-white shadow-lg group-hover:scale-105 transition-all">
              CC
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-sm sm:text-lg text-white uppercase leading-none whitespace-nowrap">
                Champions<span className="text-champion-red">Club</span>
              </span>
              <span className="text-[9px] sm:text-[11px] text-gray-400 tracking-widest uppercase mt-0.5 font-medium">
                Elite Sports Complex
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-4 2xl:gap-8 px-2 text-sm font-semibold tracking-wide text-gray-300">
          {navLinks.map((link) => {
            const active = location.pathname === link.path || (link.label === 'Café & Bar' && (location.pathname === '/cafe' || location.pathname === '/member/cafe' || location.pathname === '/admin/cafe'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 ${
                  active ? 'text-champion-red font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Section */}
        <div className="hidden xl:flex items-center space-x-3 shrink-0">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`px-3.5 py-2 rounded-lg text-xs uppercase font-extrabold tracking-wider transition-all shadow-md flex items-center space-x-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-champion-red hover:bg-champion-red-hover text-white shadow-red-950/40 hover:scale-102'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 bg-neutral-900/80 px-3.5 py-1.5 rounded-lg border border-neutral-800">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white leading-tight">{user.full_name}</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <Badge variant={user.membership_tier ? getTierVariant(user.membership_tier) : (user.role === 'admin' ? 'admin' : 'staff')}>
                    {user.membership_tier ? `${user.membership_tier} MEMBER` : user.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-champion-red hover:bg-champion-red-hover text-white text-xs uppercase font-extrabold tracking-wider px-5 py-2.5 rounded-md transition-all shadow-md hover:shadow-red-900/30 flex items-center"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex xl:hidden items-center space-x-2 shrink-0">
          {isAuthenticated && user && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-neutral-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated && user && (
            <div className="p-3 mb-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{user.full_name}</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{user.email}</p>
              </div>
              <Badge variant={user.membership_tier ? getTierVariant(user.membership_tier) : (user.role === 'admin' ? 'admin' : 'staff')}>
                {user.membership_tier || user.role}
              </Badge>
            </div>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-champion-red hover:bg-champion-red-hover text-white text-xs uppercase font-extrabold tracking-wider py-2.5 rounded-lg shadow-md mb-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold text-red-400 hover:bg-neutral-800 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center bg-champion-red hover:bg-champion-red-hover text-white text-xs uppercase font-extrabold tracking-wider py-3 rounded-md shadow-md"
              >
                Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
