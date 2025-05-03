
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gift, Users } from 'lucide-react';
import { ExtendedLottery } from '@/types/lottery';
import { Progress } from '@/components/ui/progress';

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
      year: 'numeric'
    });
  };

  const getStatusStyle = () => {
    switch (lottery.status) {
      case 'active':
        return 'bg-green-500/80 hover:bg-green-500';
      case 'completed':
        return 'bg-blue-500/80 hover:bg-blue-500';
      case 'relaunched':
        return 'bg-purple-500/80 hover:bg-purple-500';
      case 'cancelled':
        return 'bg-red-500/80 hover:bg-red-500';
      default:
        return 'bg-gray-500/80 hover:bg-gray-500';
    }
  };
  
  const progressPercent = Math.min((lottery.currentParticipants / lottery.targetParticipants) * 100, 100);
  
  const isCompleted = lottery.status === 'completed';
  const isReady = lottery.currentParticipants >= lottery.targetParticipants || 
                 (lottery.endDate && new Date(lottery.endDate) <= new Date());
  
  return (
    <Link to={`/lottery/${lottery.id}`} className="block">
      <Card className="nft-glass-card hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={lottery.image} 
            alt={lottery.title} 
            className="w-full h-48 object-cover"
          />
          <Badge className={`absolute top-3 right-3 ${getStatusStyle()}`}>
            {lottery.status === 'active' ? 'En cours' : 
             lottery.status === 'completed' ? 'Terminée' : 
             lottery.status === 'relaunched' ? 'Relancée' : 'Annulée'}
          </Badge>
          {isReady && lottery.status === 'active' && (
            <Badge className="absolute top-3 left-3 bg-yellow-500/80 hover:bg-yellow-500">
              Prête pour tirage
            </Badge>
          )}
        </div>
        
        <CardContent className="pt-4">
          <h3 className="text-xl font-semibold text-white mb-2 relative z-10">{lottery.title}</h3>
          <p className="text-gray-400 mb-3 line-clamp-2 relative z-10">{lottery.description}</p>
          
          <div className="flex justify-between text-sm text-gray-300 mb-2 relative z-10">
            <span className="flex items-center gap-1">
              <Gift size={16} className="text-winshirt-purple-light" />
              {lottery.value.toFixed(2)} €
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} className="text-winshirt-blue-light" />
              {isCompleted && lottery.drawDate 
                ? formatDate(lottery.drawDate)
                : formatDate(lottery.endDate)}
            </span>
          </div>
          
          <div className="mb-1 flex justify-between text-sm relative z-10">
            <span className="text-white flex items-center gap-1">
              <Users size={16} />
              {lottery.currentParticipants} / {lottery.targetParticipants}
            </span>
            <span className="text-gray-400">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-2 bg-winshirt-space-light relative z-10" />
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 relative z-10">
          {isCompleted && lottery.winner ? (
            <p className="text-green-400 text-sm">
              Gagnant: {lottery.winner.name}
            </p>
          ) : (
            <p className={`text-sm ${
              isReady ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {isReady 
                ? 'Prête pour le tirage au sort !' 
                : 'En attente de participants...'}
            </p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default LotteryCard;
