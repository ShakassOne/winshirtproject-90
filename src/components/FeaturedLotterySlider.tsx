
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users, Clock } from 'lucide-react';
import { ExtendedLottery } from '@/types/lottery';
import { Progress } from '@/components/ui/progress';

interface FeaturedLotterySliderProps {
  lotteries: ExtendedLottery[];
}

const FeaturedLotterySlider: React.FC<FeaturedLotterySliderProps> = ({ lotteries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ 
    days: 0, hours: 0, minutes: 0, seconds: 0 
  });
  const navigate = useNavigate();
  
  const featuredLotteries = lotteries.filter(lottery => lottery.featured);
  
  // If no featured lotteries, return null
  if (featuredLotteries.length === 0) return null;

  // Format date function
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "À définir";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate time remaining for countdown
  const getTimeRemaining = (endDate?: string | null) => {
    if (!endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const total = new Date(endDate).getTime() - new Date().getTime();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return { days, hours, minutes, seconds };
  };

  // Calculate progress percentage
  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Navigate to the lottery details page
  const handleOpenLottery = (id: number) => {
    // Changed to navigate to /lotteries/:id instead of using hash
    navigate(`/lottery/${id}`);
    console.log(`Navigating to lottery ${id}`);
  };

  // Change slide
  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-advance slides
  useEffect(() => {
    if (featuredLotteries.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        const nextIndex = (currentIndex + 1) % featuredLotteries.length;
        goToSlide(nextIndex);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning, featuredLotteries.length]);

  // Update countdown timer
  useEffect(() => {
    const currentLottery = featuredLotteries[currentIndex];
    if (!currentLottery?.endDate) return;
    
    const updateCountdown = () => {
      setCountdown(getTimeRemaining(currentLottery.endDate));
    };
    
    updateCountdown(); // Initial calculation
    
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, [currentIndex, featuredLotteries]);

  const currentLottery = featuredLotteries[currentIndex];

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-winshirt-space to-winshirt-space-dark overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-winshirt-space/40 to-winshirt-space z-10"></div>
        <img 
          src={currentLottery.image} 
          alt={currentLottery.title}
          className="w-full h-full object-cover opacity-60 scale-110 transition-transform duration-[1.5s] ease-in-out"
          style={{ transform: `scale(${isTransitioning ? 1.15 : 1.1})` }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4">
        <div className="max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {currentLottery.title}
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            {currentLottery.description}
          </p>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="bg-winshirt-purple/20 border border-winshirt-purple/40 rounded-lg px-6 py-3 text-white">
              <span className="text-xl font-semibold">{currentLottery.value.toFixed(2)} €</span>
            </div>
            
            <div className="flex items-center text-winshirt-purple-light gap-2">
              <Calendar size={20} />
              <span>Tirage le {formatDate(currentLottery.endDate)}</span>
            </div>
          </div>
          
          {/* Countdown timer */}
          {currentLottery.endDate && new Date(currentLottery.endDate) > new Date() && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-winshirt-purple-light mb-2">
                <Clock size={20} />
                <span className="font-medium">Temps restant avant le tirage:</span>
              </div>
              <div className="flex gap-4">
                <div className="bg-winshirt-space-light/70 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[80px]">
                  <div className="text-3xl font-bold text-white">{formatNumber(countdown.days)}</div>
                  <div className="text-xs text-winshirt-purple-light">JOURS</div>
                </div>
                <div className="bg-winshirt-space-light/70 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[80px]">
                  <div className="text-3xl font-bold text-white">{formatNumber(countdown.hours)}</div>
                  <div className="text-xs text-winshirt-purple-light">HEURES</div>
                </div>
                <div className="bg-winshirt-space-light/70 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[80px]">
                  <div className="text-3xl font-bold text-white">{formatNumber(countdown.minutes)}</div>
                  <div className="text-xs text-winshirt-purple-light">MINUTES</div>
                </div>
                <div className="bg-winshirt-space-light/70 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[80px]">
                  <div className="text-3xl font-bold text-white">{formatNumber(countdown.seconds)}</div>
                  <div className="text-xs text-winshirt-purple-light">SECONDES</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="mb-8 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-winshirt-blue-light flex items-center gap-1.5 font-medium">
                <Users size={16} />
                {currentLottery.currentParticipants} participants
              </span>
              <span className="text-gray-400">
                Objectif: {currentLottery.targetParticipants}
              </span>
            </div>
            <Progress 
              value={getProgressPercent(currentLottery.currentParticipants, currentLottery.targetParticipants)} 
              className="h-3 bg-winshirt-space-light"
            />
          </div>
          
          <Button 
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-white rounded-full text-lg px-8 py-6 mt-4"
            onClick={() => handleOpenLottery(currentLottery.id)}
          >
            Participer <ArrowRight className="ml-2" />
          </Button>
        </div>
        
        {/* Slide indicators */}
        {featuredLotteries.length > 1 && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-30">
            {featuredLotteries.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-winshirt-purple w-8' 
                    : 'bg-gray-400/50'
                }`}
                aria-label={`Aller à la diapositive ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedLotterySlider;
