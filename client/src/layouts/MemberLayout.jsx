import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LayoutDashboard, Calendar, Users, ShoppingBag, CreditCard } from 'lucide-react';

export const MemberLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/member/dashboard', icon: LayoutDashboard },
    { label: 'Digital Pass & Plan', path: '/member/membership', icon: CreditCard },
    { label: 'Book Court', path: '/member/book-court', icon: Calendar },
    { label: 'Friday Social Play', path: '/member/social-play', icon: Users },
    { label: 'Gear Shop', path: '/shop', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-champion-grey">
      <Navbar />
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-champion-red text-champion-red'
                    : 'border-transparent text-gray-500 hover:text-champion-dark hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};
