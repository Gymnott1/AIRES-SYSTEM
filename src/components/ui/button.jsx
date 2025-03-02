import React from 'react';

export const Button = ({ children, onClick, disabled, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);
