
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Gift, Calendar } from 'lucide-react';

export interface Lottery {
  id: number;
  title: string;
  image: string;
  value: number;
  description: string;
  currentParticipants: number;
  targetParticipants: number;
  status: 'active' | 'completed' | 'relaunched';
  winner?: { name: string, email: string } | null;
  drawDate?: string | null;
  endDate?: string | null;
}

interface LotteryCardProps {
  lottery: Lottery;
}

const LotteryCard: React.FC<LotteryCardProps> = ({ lottery }) => {
  const progressPercent = Math.min(
    (lottery.currentParticipants / lottery.targetParticipants) * 100,
    100
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
        
        {lottery.endDate && (
          <div className="absolute top-4 left-4 backdrop-blur-md bg-black/30 text-white px-4 py-3 rounded-lg border border-white/30 shadow-lg">
            <div className="text-sm font-light">Tirage le</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(lottery.endDate)}
            </div>
          </div>
        )}
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-medium text-white mb-2">{lottery.title}</h3>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{lottery.description}</p>
        
        {lottery.winner ? (
          <div className="mb-3 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
            <p className="text-sm text-white font-semibold flex items-center gap-2">
              <Gift size={16} className="text-green-400" />
              Gagnant : {lottery.winner.name}
            </p>
            <p className="text-xs text-gray-300">
              Tiré au sort le {formatDate(lottery.drawDate)}
            </p>
          </div>
        ) : (
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
        )}
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
