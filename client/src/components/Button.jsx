import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-champion-red hover:bg-champion-red-hover text-white focus:ring-champion-red',
    secondary: 'bg-champion-dark hover:bg-black text-white focus:ring-champion-dark',
    outline: 'border-2 border-gray-300 hover:border-champion-dark text-champion-dark bg-transparent',
    ghost: 'text-gray-600 hover:text-champion-dark hover:bg-gray-100 bg-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};
