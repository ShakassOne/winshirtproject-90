
import React from 'react';
import { Link } from 'react-router-dom';
import { ExtendedLottery } from '@/types/lottery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalendarClock, Trophy, Users } from 'lucide-react';

interface LotteryCardProps {
  lottery: ExtendedLottery;
}

const LotteryCard: React.FC<LotteryCardProps> = ({ lottery }) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  const progressPercent = Math.min(
    (lottery.currentParticipants / lottery.targetParticipants) * 100,
    100
  );
  
  const getStatusBadge = () => {
    if (lottery.status === 'completed') {
      return (
        <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
          Terminée
        </Badge>
      );
    } else if (lottery.status === 'relaunched') {
      return (
        <Badge className="absolute top-2 left-2 bg-purple-600 hover:bg-purple-700">
          Relancée
        </Badge>
      );
    } else if (lottery.status === 'cancelled') {
      return (
        <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
          Annulée
        </Badge>
      );
    }
    return null;
  };
  
  return (
    <Card className="overflow-hidden border-winshirt-space-light bg-winshirt-space-light/50 backdrop-blur-xl hover:bg-winshirt-space-light/80 transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-winshirt-purple/10">
      <div className="relative">
        {getStatusBadge()}
        <Badge className="absolute top-2 right-2 bg-winshirt-blue-dark">
          {lottery.value.toFixed(2)} €
        </Badge>
        <Link to={`/lottery/${lottery.id}`}>
          <img
            src={lottery.image}
            alt={lottery.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      </div>
      
      <CardContent className="pt-4">
        <Link to={`/lottery/${lottery.id}`}>
          <h3 className="text-xl font-semibold text-white mb-2 hover:text-winshirt-blue-light transition-colors">
            {lottery.title}
          </h3>
        </Link>
        
        <p className="text-gray-300 mb-4 text-sm line-clamp-2">{lottery.description}</p>
        
        {lottery.status === 'completed' && lottery.winner ? (
          <div className="bg-blue-500/20 p-3 rounded-md flex items-center gap-2 mb-3">
            <Trophy className="text-blue-400 w-5 h-5" />
            <div>
              <p className="text-sm text-white">Gagnant: <span className="font-medium">{lottery.winner.name}</span></p>
              <p className="text-xs text-gray-300">Tiré le {formatDate(lottery.drawDate)}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-winshirt-blue-light flex items-center gap-1">
                <Users className="w-4 h-4" /> {lottery.currentParticipants} participants
              </span>
              <span className="text-gray-400">
                Objectif: {lottery.targetParticipants}
              </span>
            </div>
            
            <Progress
              value={progressPercent}
              className="h-2 mb-4 bg-winshirt-space"
            />
            
            <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
              <CalendarClock className="w-4 h-4 text-winshirt-purple-light" />
              <span>Tirage: {formatDate(lottery.endDate)}</span>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link to={`/lottery/${lottery.id}`} className="w-full">
          <Button
            variant="default"
            className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
          >
            {lottery.status === 'completed'
              ? 'Voir les détails'
              : 'Participer'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LotteryCard;
