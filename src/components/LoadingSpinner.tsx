
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'text-winshirt-purple-light' 
}) => {
  const sizeClass = 
    size === 'small' ? 'w-5 h-5' : 
    size === 'large' ? 'w-10 h-10' : 
    'w-8 h-8';
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} border-4 border-t-transparent rounded-full animate-spin ${color}`}></div>
    </div>
  );
};

export default LoadingSpinner;
