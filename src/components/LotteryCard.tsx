
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Gift, Calendar, Info } from 'lucide-react';
import { ExtendedLottery } from '@/types/lottery';

interface LotteryCardProps {
  lottery: ExtendedLottery;
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
      <Link to={`/lotteries/${lottery.id}`} className="relative block">
        <img 
          src={lottery.image} 
          alt={lottery.title} 
          className="w-full h-60 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-0 right-0 bg-winshirt-blue-dark/90 text-white px-3 py-1 rounded-bl-lg">
          Valeur: {lottery.value.toFixed(2)} €
        </div>
        {lottery.status !== 'active' && (
          <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-lg ${
            lottery.status === 'completed' 
              ? 'bg-green-600/90' 
              : lottery.status === 'cancelled'
                ? 'bg-red-600/90'
                : 'bg-winshirt-purple-dark/90'
          }`}>
            {lottery.status === 'completed' ? 'Terminée' : 
             lottery.status === 'cancelled' ? 'Annulée' : 'Relancée'}
          </div>
        )}
        
        {/* Date de tirage toujours visible avec un meilleur contraste */}
        <div className="absolute bottom-4 left-4 backdrop-blur-md bg-black/80 text-white px-4 py-2 rounded-lg border border-white/30 shadow-lg">
          <div className="text-sm font-light">Tirage le</div>
          <div className="text-lg font-bold flex items-center gap-2">
            <Calendar size={16} />
            {formatDate(lottery.endDate) || "À définir"}
          </div>
        </div>
      </Link>
      <CardContent className="flex-grow p-4">
        <Link to={`/lotteries/${lottery.id}`}>
          <h3 className="text-lg font-medium text-white mb-2 hover:text-winshirt-blue-light transition-colors">{lottery.title}</h3>
        </Link>
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
      <CardFooter className="p-4 pt-0 flex gap-2 justify-between">
        <Link to={`/lotteries/${lottery.id}`} className="flex-1">
          <Button variant="outline" className="w-full border-winshirt-purple/30 hover:bg-winshirt-purple/20 flex items-center gap-2">
            <Info size={16} />
            Détails
          </Button>
        </Link>
        <Link to={`/products?lottery=${lottery.id}`} className="flex-1">
          <Button className="w-full bg-winshirt-blue hover:bg-winshirt-blue-dark flex items-center gap-2">
            <Gift size={16} />
            Participer
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LotteryCard;
