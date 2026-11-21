import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-champion-dark uppercase">
            Executive Owner Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Executive: <span className="font-semibold">{user?.full_name}</span> ({user?.email})
          </p>
        </div>
        <Badge variant="admin">Root Administrator</Badge>
      </div>

      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto text-champion-red mb-2" />
        <h3 className="text-base font-bold text-gray-700">Admin KPI Shell Active</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
          Auth & role guard passed! Aggregated analytics for Courts, Shop, Café, and Memberships will feed here in Module 11.
        </p>
      </div>
    </div>
  );
};
