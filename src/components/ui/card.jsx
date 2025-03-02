import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`shadow rounded bg-white p-4 ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b pb-2 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`pt-4 ${className}`}>{children}</div>
);
