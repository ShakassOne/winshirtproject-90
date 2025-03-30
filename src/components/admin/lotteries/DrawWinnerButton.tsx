
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

interface DrawWinnerButtonProps {
  lottery: ExtendedLottery;
  onDrawWinner: (lotteryId: number, winner: Participant) => void;
}

const DrawWinnerButton: React.FC<DrawWinnerButtonProps> = ({ lottery, onDrawWinner }) => {
  const canDrawWinner = 
    lottery.status === 'active' && 
    ((lottery.currentParticipants >= lottery.targetParticipants) || 
    (lottery.endDate && new Date(lottery.endDate) <= new Date()));

  const drawWinner = () => {
    if (!lottery.participants || lottery.participants.length === 0) {
      toast.error("Impossible de tirer au sort : aucun participant");
      return;
    }

    // Tirage aléatoire d'un gagnant parmi les participants
    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    const winner = lottery.participants[randomIndex];
    
    onDrawWinner(lottery.id, winner);
    toast.success(`Félicitations ! ${winner.name} a gagné la loterie "${lottery.title}" !`);
  };

  return (
    <Button
      onClick={drawWinner}
      disabled={!canDrawWinner || lottery.status !== 'active'}
      variant="outline"
      className={`flex items-center gap-2 ${
        canDrawWinner 
          ? "bg-winshirt-purple hover:bg-winshirt-purple-dark text-white" 
          : "text-gray-400"
      }`}
    >
      <Gift size={16} />
      Tirer au sort
    </Button>
  );
};

export default DrawWinnerButton;
