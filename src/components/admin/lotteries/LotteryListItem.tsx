
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { ExtendedLottery, Participant } from '@/types/lottery';
import DrawWinnerButton from './DrawWinnerButton';

interface LotteryListItemProps {
  lottery: ExtendedLottery;
  isSelected: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDrawWinner: (lotteryId: number, winner: Participant) => void;
}

const LotteryListItem: React.FC<LotteryListItemProps> = ({
  lottery,
  isSelected,
  onEdit,
  onDelete,
  onDrawWinner
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isReadyForDraw = 
    lottery.status === 'active' && 
    ((lottery.currentParticipants >= lottery.targetParticipants) || 
    (lottery.endDate && new Date(lottery.endDate) <= new Date()));

  return (
    <div 
      className={`p-4 rounded-lg mb-2 ${
        isSelected ? 'bg-winshirt-purple/20 border border-winshirt-purple/40' : 'bg-winshirt-space-light hover:bg-winshirt-space-lighter'
      } ${isReadyForDraw ? 'border-2 border-green-500/50' : ''}`}
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-medium text-white">
          {lottery.title}
          {lottery.winner && <span className="ml-2 text-green-400 text-xs">(Terminée)</span>}
          {isReadyForDraw && !lottery.winner && <span className="ml-2 text-yellow-400 text-xs">(Prête pour le tirage)</span>}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(lottery.id)}
            className="h-8 w-8 p-0 text-winshirt-blue hover:text-winshirt-blue-light hover:bg-winshirt-blue/10"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lottery.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-2">
        <div>Valeur: {lottery.value.toFixed(2)} €</div>
        <div>Participants: {lottery.currentParticipants} / {lottery.targetParticipants}</div>
        {lottery.endDate && (
          <div>Date de fin: {formatDate(lottery.endDate)}</div>
        )}
        {lottery.winner && (
          <div className="text-green-400">Gagnant: {lottery.winner.name}</div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs bg-winshirt-blue/30 text-winshirt-blue-light px-2 py-1 rounded">
          {lottery.status}
        </div>
        <DrawWinnerButton
          lottery={lottery}
          onDrawWinner={onDrawWinner}
        />
      </div>
    </div>
  );
};

export default LotteryListItem;
