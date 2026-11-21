import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    gold: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    silver: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
    junior: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    staff: 'bg-blue-100 text-blue-800 border-blue-200',
    red: 'bg-red-100 text-champion-red border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};
