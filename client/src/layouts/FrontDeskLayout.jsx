import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Calendar, Users, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const FrontDeskLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Master Booking Grid', path: '/desk/calendar', icon: Calendar },
    { label: 'Member Directory & Renewals', path: '/desk/members', icon: Users },
    { label: 'Leads & Inquiries Pipeline', path: '/desk/leads', icon: FileText },
  ];

  const allowedPaths = navItems.map((item) => item.path);
  if (user?.role === 'front_desk' && !allowedPaths.includes(location.pathname)) {
    return <Navigate to="/desk/calendar" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-champion-grey">
      <Navbar />
      <div className="bg-champion-dark text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-champion-red text-champion-red'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
