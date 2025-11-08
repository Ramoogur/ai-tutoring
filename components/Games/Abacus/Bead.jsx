/**
 * Bead Component - Child-friendly abacus bead
 * Large, colorful, and easy to interact with for Grade 1 students
 */

import React from 'react';
import './Bead.css';

const Bead = ({ 
  value, 
  isActive, 
  onClick, 
  color = 'blue',
  size = 'large',
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyPress = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      className={`
        abacus-bead 
        bead-${color} 
        bead-${size}
        ${isActive ? 'bead-active' : 'bead-inactive'}
        ${disabled ? 'bead-disabled' : ''}
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      aria-label={`${color} bead worth ${value}, ${isActive ? 'active' : 'inactive'}`}
      aria-pressed={isActive}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <div className="bead-inner">
        <span className="bead-value">{value}</span>
        {isActive && <span className="bead-checkmark">✓</span>}
      </div>
      {isActive && <div className="bead-glow"></div>}
    </button>
  );
};

export default Bead;