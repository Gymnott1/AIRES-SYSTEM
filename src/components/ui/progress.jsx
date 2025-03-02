import React from 'react';
import './jsxc.css';

export const Progress = ({ value, className = '' }) => (
  <div className={`progress-container ${className}`}>
    <div
      style={{ width: `${value}%` }}
      className="progress-fill"
    ></div>
  </div>
);
