
import React from 'react';
import { Winner } from '@/types/winner';
import { Trophy, Calendar, Gift } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WinnersCarouselProps {
  winners: Winner[];
}

const WinnersCarousel: React.FC<WinnersCarouselProps> = ({ winners }) => {
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Safe formatting for currency values
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '0';
    return value.toString();
  };

  // If no winners, display a message
  if (!winners || winners.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <p className="text-gray-400 text-xl">Aucun gagnant à afficher</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Carousel 
        className="w-full"
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {winners.map((winner) => (
            <CarouselItem key={winner.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/1.5 relative">
              <Card className="overflow-hidden border-0 shadow-none bg-transparent">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                  <img 
                    src={winner.lotteryImage} 
                    alt={winner.lotteryTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-2xl font-bold">{winner.lotteryTitle}</h3>
                    <p className="text-xl">Value: ${formatCurrency(winner.lotteryValue)}</p>
                  </div>
                </div>
                <CardContent className="p-4 winshirt-card">
                  <div className="flex items-center space-x-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h4 className="text-xl font-bold text-white">Winner: {winner.name}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-winshirt-purple-light" />
                      <span>Draw date: {formatDate(winner.drawDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-winshirt-blue-light" />
                      <span>Winning Ticket: {winner.ticketNumber}</span>
                    </div>
                  </div>
                  <div className="mt-2 border-t border-gray-700 pt-4">
                    <p className="text-gray-300 italic">"{winner.congratulationMessage}"</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 lg:-left-12 h-12 w-12" />
        <CarouselNext className="right-1 lg:-right-12 h-12 w-12" />
      </Carousel>
    </div>
  );
};

export default WinnersCarousel;
