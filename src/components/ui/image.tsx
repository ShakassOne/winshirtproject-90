
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ alt, className, ...props }) => {
  return (
    <img 
      alt={alt} 
      className={className}
      {...props}
      onError={(e) => {
        // Fallback to placeholder if image fails to load
        e.currentTarget.src = '/placeholder.svg';
      }}
    />
  );
};

export default Image;
