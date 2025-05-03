
import React from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LotteryGridProps {
  lotteries: ExtendedLottery[];
}

const LotteryGrid: React.FC<LotteryGridProps> = ({ lotteries }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {lotteries.map((lottery) => {
        // Ensure we use the camelCase properties consistently
        const currentParticipants = lottery.currentParticipants || 0;
        const targetParticipants = lottery.targetParticipants || 10;
        
        return (
          <Card key={lottery.id} className="overflow-hidden bg-winshirt-space-light hover:shadow-lg transition-shadow border-winshirt-purple/20">
            <div className="relative h-48">
              <img 
                src={lottery.image || '/placeholder.svg'} 
                alt={lottery.title} 
                className="w-full h-full object-cover"
              />
              {lottery.featured && (
                <Badge className="absolute top-2 right-2 bg-winshirt-pink text-black">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-5">
              <h3 className="text-xl font-bold mb-2 text-white">{lottery.title}</h3>
              <p className="text-gray-300 mb-3 line-clamp-2">{lottery.description}</p>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-winshirt-purple-light font-bold">
                  Valeur: {lottery.value}€
                </span>
                <span className="text-gray-300 text-sm">
                  {currentParticipants} / {targetParticipants} participants
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-winshirt-purple h-2 rounded-full" 
                  style={{ width: `${(currentParticipants / targetParticipants) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LotteryGrid;
