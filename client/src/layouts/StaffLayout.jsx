import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ShoppingCart, Boxes, Coffee, UtensilsCrossed, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const StaffLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const allNavItems = [
    { label: 'Gear Shop POS', path: '/staff/shop-pos', icon: ShoppingCart },
    { label: 'Inventory Ledger', path: '/staff/inventory', icon: Boxes },
    { label: 'Recent Stock Movements', path: '/staff/inventory/movements', icon: History },
    { label: 'Café Tables & Tabs POS', path: '/staff/cafe-pos', icon: Coffee },
    { label: 'Kitchen Queue (KDS)', path: '/staff/kitchen', icon: UtensilsCrossed },
  ];

  const navItems = user?.role === 'admin' ? allNavItems : allNavItems.filter((item) => {
    if (user?.staff_department === 'shop') return ['/staff/shop-pos', '/staff/inventory', '/staff/inventory/movements'].includes(item.path);
    if (user?.staff_department === 'cafe') return item.path === '/staff/cafe-pos';
    if (user?.staff_department === 'kitchen') return item.path === '/staff/kitchen';
    return false;
  });

  const departmentHome = {
    shop: '/staff/shop-pos',
    cafe: '/staff/cafe-pos',
    kitchen: '/staff/kitchen',
  }[user?.staff_department];
  const departmentPaths = {
    shop: ['/staff/shop-pos', '/staff/inventory', '/staff/inventory/movements'],
    cafe: ['/staff/cafe-pos'],
    kitchen: ['/staff/kitchen'],
  }[user?.staff_department] || [];
  if (user?.role === 'staff' && departmentHome && !departmentPaths.includes(location.pathname)) {
    return <Navigate to={departmentHome} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-champion-grey">
      <Navbar />
      <div className="bg-neutral-900 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${active ? 'border-champion-red text-champion-red' : 'border-transparent text-gray-400 hover:text-white hover:border-neutral-600'}`}
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
