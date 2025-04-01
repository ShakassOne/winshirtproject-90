
import React, { useState, useEffect, useRef } from 'react';
import { Lottery } from './LotteryCard';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';

interface RotatingLotteryProps {
  lotteries: Lottery[];
}

const RotatingLottery: React.FC<RotatingLotteryProps> = ({ lotteries }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-rotation - désactivée pendant le drag
  useEffect(() => {
    if (!isDragging && lotteries.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % lotteries.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [lotteries.length, isDragging]);
  
  const getPositionStyle = (index: number) => {
    if (lotteries.length <= 1) return {};
    
    const total = lotteries.length;
    let position = (index - activeIndex + total) % total;
    
    // If more than 5 items, only show 5 at a time
    if (position > 2 && position < total - 2) {
      return { display: 'none' };
    }
    
    let zIndex, transform, opacity, scale;
    
    if (position === 0) {
      // Center (active) item
      zIndex = 10;
      transform = 'translateY(0) scale(1)';
      opacity = 1;
      scale = 1;
    } else if (position === 1) {
      // Right item
      zIndex = 5;
      transform = 'translate(75%, 10%) rotate(10deg) scale(0.9)';
      opacity = 0.9;
      scale = 0.9;
    } else if (position === total - 1) {
      // Left item
      zIndex = 5;
      transform = 'translate(-75%, 10%) rotate(-10deg) scale(0.9)';
      opacity = 0.9;
      scale = 0.9;
    } else if (position === 2) {
      // Far right item
      zIndex = 1;
      transform = 'translate(140%, 20%) rotate(20deg) scale(0.8)';
      opacity = 0.8;
      scale = 0.8;
    } else if (position === total - 2) {
      // Far left item
      zIndex = 1;
      transform = 'translate(-140%, 20%) rotate(-20deg) scale(0.8)';
      opacity = 0.8;
      scale = 0.8;
    } else {
      // Hidden items
      zIndex = 0;
      transform = 'translate(0, 100%) scale(0.7)';
      opacity = 0;
      scale = 0.7;
    }
    
    return {
      zIndex,
      transform,
      opacity,
      scale,
    };
  };
  
  // Touch and drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    
    // Get the starting position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentTranslate(0);
    
    // Add document-level event listeners for better tracking
    if ('touches' in e) {
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }
    
    // Prevent default to avoid page scrolling
    if (e.cancelable) {
      e.preventDefault();
    }
  };
  
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    // Prevent default behavior to avoid scrolling while dragging
    if (e.cancelable) {
      e.preventDefault();
    }
    
    // Get the current position
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const diff = clientX - startX;
    
    setCurrentTranslate(diff);
    
    // Apply transform directly for smoother dragging
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };
  
  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
    
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    // Determine if we should move to the next or previous item
    if (Math.abs(currentTranslate) > 50) {
      // If dragged more than 50px, change the active index
      if (currentTranslate > 0) {
        // Dragged right, show previous
        setActiveIndex((prev) => (prev - 1 + lotteries.length) % lotteries.length);
      } else {
        // Dragged left, show next
        setActiveIndex((prev) => (prev + 1) % lotteries.length);
      }
    }
    
    // Reset current translate
    setCurrentTranslate(0);
  };
  
  // Si pas de loteries, afficher un message
  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="spinning-lottery h-96 w-full flex items-center justify-center">
        <p className="text-gray-400">Aucune loterie disponible</p>
      </div>
    );
  }
  
  return (
    <div 
      className="spinning-lottery h-96 w-full relative select-none"
      ref={containerRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* Drag indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-winshirt-purple/30 text-winshirt-purple-light rounded-full px-3 py-1 flex items-center text-sm z-20">
        <GripVertical size={16} className="mr-1" /> Glisser pour naviguer
      </div>
      
      {lotteries.map((lottery, index) => (
        <Link
          key={lottery.id}
          to={`/lotteries#${lottery.id}`}
          className="spinning-lottery-item absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={(e) => {
            // Annuler le clic si on est en train de faire glisser
            if (isDragging || Math.abs(currentTranslate) > 10) {
              e.preventDefault();
            }
          }}
          style={{
            width: '300px',
            height: '350px',
            transition: isDragging ? 'none' : 'all 0.5s ease',
            transform: getPositionStyle(index).transform + (index === activeIndex && isDragging ? ` translateX(${currentTranslate}px)` : ''),
            opacity: getPositionStyle(index).opacity,
            zIndex: getPositionStyle(index).zIndex,
            pointerEvents: isDragging ? 'none' : 'auto',
            display: getPositionStyle(index).display === 'none' ? 'none' : 'block',
          }}
        >
          <div className="w-full h-full bg-winshirt-space-light rounded-2xl overflow-hidden flex flex-col relative">
            <img 
              src={lottery.image} 
              alt={lottery.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-0 right-0 bg-winshirt-blue-dark/80 text-white px-3 py-1 rounded-bl-lg">
              Valeur: {lottery.value.toFixed(2)} €
            </div>
            <div className="p-4 flex-grow">
              <h3 className="text-lg font-semibold text-white mb-2">{lottery.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-2">{lottery.description}</p>
              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-winshirt-blue-light">
                  {lottery.currentParticipants} / {lottery.targetParticipants}
                </span>
                <span className="bg-winshirt-purple/30 rounded-full px-3 py-1 text-winshirt-purple-light">
                  Cliquez pour voir
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RotatingLottery;
