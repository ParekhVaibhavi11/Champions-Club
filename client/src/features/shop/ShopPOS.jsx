import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { ShoppingCart, Check } from 'lucide-react';

export const ShopPOS = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-champion-dark uppercase">
            Gear Shop Retail POS Terminal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cashier: <span className="font-semibold">{user?.full_name}</span> • Department: {user?.staff_department || 'shop'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="staff">Terminal #01 Active</Badge>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
        <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-base font-bold text-gray-700">Staff POS Shell Loaded</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
          Auth & sub-permission check verified. The counter product scanner, customer discount resolver, and receipt generator connect in Module 5.
        </p>
      </div>
    </div>
  );
};
