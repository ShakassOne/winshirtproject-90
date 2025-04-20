
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="relative">
        <div className="w-16 h-16 border-t-4 border-b-4 border-winshirt-purple rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-winshirt-blue rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
