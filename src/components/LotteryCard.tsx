
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export interface Lottery {
  id: number;
  title: string;
  image: string;
  value: number;
  description: string;
  currentParticipants: number;
  targetParticipants: number;
  status: 'active' | 'completed' | 'relaunched';
}

interface LotteryCardProps {
  lottery: Lottery;
}

const LotteryCard: React.FC<LotteryCardProps> = ({ lottery }) => {
  const progressPercent = Math.min(
    (lottery.currentParticipants / lottery.targetParticipants) * 100,
    100
  );

  return (
    <Card className="winshirt-card winshirt-card-hover h-full flex flex-col overflow-hidden">
      <div className="relative">
        <img 
          src={lottery.image} 
          alt={lottery.title} 
          className="w-full h-60 object-cover"
        />
        <div className="absolute top-0 right-0 bg-winshirt-blue-dark/80 text-white px-3 py-1 rounded-bl-lg">
          Valeur: {lottery.value.toFixed(2)} €
        </div>
        {lottery.status !== 'active' && (
          <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-lg ${
            lottery.status === 'completed' 
              ? 'bg-green-600/80' 
              : 'bg-winshirt-purple-dark/80'
          }`}>
            {lottery.status === 'completed' ? 'Terminée' : 'Relancée'}
          </div>
        )}
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-medium text-white mb-2">{lottery.title}</h3>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{lottery.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-winshirt-blue-light">
              {lottery.currentParticipants} participants
            </span>
            <span className="text-gray-400">
              Objectif: {lottery.targetParticipants}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-winshirt-space-light" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/products?lottery=${lottery.id}`} className="w-full">
          <Button className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark">
            Voir les produits associés
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LotteryCard;
