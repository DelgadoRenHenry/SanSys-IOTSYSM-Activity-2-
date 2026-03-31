/**
 * StatusIndicator Component - Shows sensor status with color coding
 */

import React from 'react';

const StatusIndicator = ({ status, label = null }) => {
  const statusText = status === 'active' ? 'Active' : 'Inactive';
  const displayLabel = label || statusText;
  
  const statusColors = {
    active: { bg: '#28a745', text: '#fff' },
    inactive: { bg: '#6c757d', text: '#fff' }
  };
  
  const colors = statusColors[status] || statusColors.inactive;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500'
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.text,
          marginRight: '0.5rem',
          animation: status === 'active' ? 'pulse 2s infinite' : 'none',
        }}
      />
      {displayLabel}
    </span>
  );
};

export default StatusIndicator;
