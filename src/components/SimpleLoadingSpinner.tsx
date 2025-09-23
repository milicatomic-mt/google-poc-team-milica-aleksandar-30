import React from 'react';

interface SimpleLoadingSpinnerProps {
  className?: string;
}

const SimpleLoadingSpinner: React.FC<SimpleLoadingSpinnerProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-32 h-32 rounded-full border-4 border-muted animate-spin border-t-primary"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-12 w-8 h-8 rounded-full bg-primary animate-bounce"></div>
      </div>
    </div>
  );
};

export default SimpleLoadingSpinner;