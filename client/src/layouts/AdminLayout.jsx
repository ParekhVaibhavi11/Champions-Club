import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BarChart3, DollarSign, UserCheck, Map, Coffee, ShoppingBag, Receipt } from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Owner KPIs & Overview', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Court Management', path: '/admin/courts', icon: Map },
    { label: 'Orders & Tabs (Shop/Café)', path: '/admin/orders', icon: Receipt },
    { label: 'Café & Bar POS', path: '/admin/cafe', icon: Coffee },
    { label: 'Finance & Invoices', path: '/admin/finance', icon: DollarSign },
    { label: 'Staff HR & Shifts', path: '/admin/hr', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-champion-grey">
      <Navbar />
      <div className="bg-black text-white border-b border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path === '/admin/cafe' && (location.pathname === '/staff/cafe-pos' || location.pathname === '/cafe'));
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
