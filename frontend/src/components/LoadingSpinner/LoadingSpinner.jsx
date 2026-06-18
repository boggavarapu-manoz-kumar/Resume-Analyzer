import React from 'react';

const LoadingSpinner = ({ size = 'normal', text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-md" style={{ padding: '2rem' }}>
      <div className={`spinner ${size === 'large' ? 'spinner-lg' : ''}`}></div>
      {text && <p className="text-muted" style={{ fontWeight: 500 }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
