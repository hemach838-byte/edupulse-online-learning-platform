import React from 'react';

const ProgressBar = ({ value = 0, max = 100, showLabel = true, height = 8 }) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);
  const isComplete = percentage >= 100;

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <span style={{ color: isComplete ? '#059669' : '#475569' }}>
            {isComplete ? 'Completed' : 'Course Progress'}
          </span>
          <span style={{ color: isComplete ? '#059669' : '#4f46e5' }}>{percentage}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          height: `${height}px`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: isComplete ? '#10b981' : '#4f46e5',
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
