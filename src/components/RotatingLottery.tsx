
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExtendedLottery } from '@/types/lottery';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Ticket } from 'lucide-react';

interface RotatingLotteryProps {
  lotteries: ExtendedLottery[];
}

const RotatingLottery: React.FC<RotatingLotteryProps> = ({ lotteries }) => {
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Calculate progress percentage
  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Safe formatting for currency values
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  // If no lotteries, display a message
  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <p className="text-gray-400 text-xl">Aucune loterie disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 carousel-container">
      <Carousel 
        className="w-full"
        opts={{
          align: "center",
          loop: true,
        }}
        setApi={(api) => {
          api?.on("select", () => {
            const selectedIndex = api.selectedScrollSnap();
            setActiveIndex(selectedIndex);
          });
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {lotteries.map((lottery, index) => {
            // Ensure we use the camelCase properties consistently
            const currentParticipants = lottery.currentParticipants || 0;
            const targetParticipants = lottery.targetParticipants || 10;
            
            return (
              <CarouselItem key={lottery.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 carousel-slide">
                <Link to={`/lotteries/${lottery.id}`} className="block">
                  <div className={`h-full rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 carousel-card ${index === activeIndex ? 'active' : ''}`}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
                      <img 
                        src={lottery.image} 
                        alt={lottery.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-winshirt-blue-dark/80 white-text px-4 py-1.5 rounded-full text-base font-medium z-20">
                        {formatCurrency(lottery.value)} €
                      </div>
                      
                      {/* Lottery details overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-5 white-text z-20">
                        <h3 className="text-xl font-semibold">{lottery.title}</h3>
                        <p className="text-base text-gray-200 mt-2 line-clamp-2">{lottery.description}</p>
                        
                        {/* Progress section */}
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-winshirt-blue-light flex items-center gap-1.5 font-medium">
                              <Users size={16} />
                              {currentParticipants} participants
                            </span>
                            <span className="text-gray-400">
                              Objectif: {targetParticipants}
                            </span>
                          </div>
                          <Progress 
                            value={getProgressPercent(currentParticipants, targetParticipants)} 
                            className="h-2.5 bg-winshirt-space-light"
                          />
                        </div>
                        
                        {/* Date section */}
                        <div className="mt-4 flex items-center gap-2 text-winshirt-purple-light text-base">
                          <Calendar size={18} />
                          <span>Tirage le {formatDate(lottery.endDate)}</span>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm bg-winshirt-purple/50 rounded-full px-4 py-1.5 font-medium">
                            Détails
                          </span>
                          
                          {/* Tickets indicator */}
                          <span className="flex items-center gap-1.5 text-winshirt-blue-light">
                            <Ticket size={16} />
                            <span className="text-xs">Jusqu'à 5 tickets disponibles</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-1 lg:-left-12 h-12 w-12" />
        <CarouselNext className="right-1 lg:-right-12 h-12 w-12" />
      </Carousel>
      
      {/* Dots indicator */}
      <div className="flex items-center justify-center mt-6 gap-2">
        {lotteries.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === activeIndex 
                ? "bg-winshirt-blue-light scale-125" 
                : "bg-winshirt-space-light hover:bg-winshirt-space"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RotatingLottery;
