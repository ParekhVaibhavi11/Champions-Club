import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  className = '',
  icon: Icon,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {label} {required && <span className="text-champion-red">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-champion-red focus:border-champion-red'
          } ${Icon ? 'pl-10' : 'px-3'} py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-1`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
