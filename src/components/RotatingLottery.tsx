
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lottery } from './LotteryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface RotatingLotteryProps {
  lotteries: Lottery[];
}

const RotatingLottery: React.FC<RotatingLotteryProps> = ({ lotteries }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // If no lotteries, display a message
  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="spinning-lottery h-96 w-full flex items-center justify-center">
        <p className="text-gray-400">Aucune loterie disponible</p>
      </div>
    );
  }

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % lotteries.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRotate, lotteries.length]);

  // Pause auto-rotation when hovering
  const handleMouseEnter = () => setAutoRotate(false);
  const handleMouseLeave = () => setAutoRotate(true);

  return (
    <div 
      className="spinning-lottery h-[450px] mb-12 relative w-full flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {lotteries.map((lottery, index) => {
        // Calculate angle for each item in a circle
        const angle = ((index - activeIndex) * (2 * Math.PI)) / lotteries.length;
        
        // Calculate the position and z-index based on angle
        const x = 150 * Math.sin(angle);
        const z = 50 * Math.cos(angle) - 60; // negative z to place behind the center
        
        // Scale will be larger for the active item (front) and smaller for back items
        const scale = 0.7 + 0.3 * (z + 60) / 60; // normalize z from -60..0 to 0..1, then scale from 0.7 to 1.0
        
        // Opacity will fade for items moving to the back
        const opacity = 0.6 + 0.4 * (z + 60) / 60;
        
        // Z-index ensures proper layering (higher for items in front)
        const zIndex = Math.round(z + 100);
        
        return (
          <Link 
            key={lottery.id}
            to={`/lotteries#${lottery.id}`}
            className={`spinning-lottery-item absolute cursor-pointer transition-all duration-500 ease-in-out`}
            style={{
              transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
              opacity: opacity,
              zIndex: zIndex,
            }}
            onClick={() => setActiveIndex(index)}
          >
            <Card className={`w-72 h-96 rounded-3xl overflow-hidden border border-winshirt-purple/30 bg-winshirt-space-light hover:shadow-[0_0_20px_rgba(155,135,245,0.3)] transition-all duration-300 hover:-translate-y-1 ${index === activeIndex ? 'ring-2 ring-winshirt-purple' : ''}`}>
              <CardContent className="p-0 h-full">
                <div className="relative h-52">
                  <img 
                    src={lottery.image} 
                    alt={lottery.title}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-winshirt-blue-dark/80 text-white px-3 py-1 rounded-bl-lg">
                    Valeur: {lottery.value.toFixed(2)} €
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-2">{lottery.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">{lottery.description}</p>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-winshirt-blue-light">
                      {lottery.currentParticipants} / {lottery.targetParticipants}
                    </span>
                    {index === activeIndex && (
                      <span className="bg-winshirt-purple/30 rounded-full px-3 py-1 text-winshirt-purple-light animate-pulse">
                        Voir détails
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
      
      {/* Navigation dots */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {lotteries.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-winshirt-purple scale-125' 
                : 'bg-winshirt-purple/40'
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Voir loterie ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RotatingLottery;
