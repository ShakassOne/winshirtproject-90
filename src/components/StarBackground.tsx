
import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createStars = () => {
      if (!starsContainerRef.current) return;
      
      // Clear existing stars
      starsContainerRef.current.innerHTML = '';
      
      const screenWidth = window.innerWidth;
      const starCount = screenWidth <= 768 ? 50 : 100;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random size
        const size = Math.random() * 4;
        star.style.width = `${size}px`;
        
        // Random position
        const posX = Math.random() * window.innerWidth;
        const delay = Math.random() * 100;
        
        star.style.left = `${posX}px`;
        star.style.animationDelay = `-${delay}s`;
        
        starsContainerRef.current.appendChild(star);
      }
    };
    
    // Create stars initially and on window resize
    createStars();
    window.addEventListener('resize', createStars);
    
    return () => {
      window.removeEventListener('resize', createStars);
    };
  }, []);

  return <div ref={starsContainerRef} className="stars-container" />;
};

export default StarBackground;
