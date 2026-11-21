import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { Calendar, UserCheck, Clock, CheckCircle } from 'lucide-react';

export const FrontDeskCalendar = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-champion-dark uppercase">
            Front Desk Operations Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: <span className="font-semibold">{user?.full_name}</span> (Front Desk clearance)
          </p>
        </div>
        <Badge variant="staff">Front Desk Station 01</Badge>
      </div>

      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-base font-bold text-gray-700">Master Calendar Shell Active</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
          Auth verification complete! Detailed court reservation slots & walk-in booking engine will connect in Modules 3 & 4.
        </p>
      </div>
    </div>
  );
};
