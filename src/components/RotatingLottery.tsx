
import React from 'react';
import { Link } from 'react-router-dom';
import { Lottery } from './LotteryCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface RotatingLotteryProps {
  lotteries: Lottery[];
}

const RotatingLottery: React.FC<RotatingLotteryProps> = ({ lotteries }) => {
  // Si pas de loteries, afficher un message
  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="spinning-lottery h-96 w-full flex items-center justify-center">
        <p className="text-gray-400">Aucune loterie disponible</p>
      </div>
    );
  }

  return (
    <div className="w-[80%] mx-auto relative">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {lotteries.map((lottery) => (
            <CarouselItem 
              key={lottery.id} 
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Link to={`/lotteries#${lottery.id}`}>
                <div className="w-full h-full pb-6">
                  <Card className="bg-winshirt-space-light rounded-2xl overflow-hidden border border-winshirt-purple/30 hover:shadow-[0_0_20px_rgba(155,135,245,0.3)] transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={lottery.image} 
                          alt={lottery.title}
                          className="w-full h-56 object-cover" // Increased height for larger thumbnails
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
                          <span className="bg-winshirt-purple/30 rounded-full px-3 py-1 text-winshirt-purple-light">
                            Cliquez pour voir
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 lg:-left-10" />
        <CarouselNext className="right-2 lg:-right-10" />
      </Carousel>
    </div>
  );
};

export default RotatingLottery;
