
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
  // Une loterie peut être tirée au sort si:
  // - Elle est active ET
  // - Elle a atteint son nombre cible de participants OU sa date de fin est passée
  const canDrawWinner = 
    lottery.status === 'active' && 
    (lottery.currentParticipants >= lottery.targetParticipants || 
    (lottery.endDate && new Date(lottery.endDate) <= new Date()));

  const drawWinner = () => {
    if (!lottery.participants || lottery.participants.length === 0) {
      // Si pas de participants, on simule quelques participants aléatoires
      const mockParticipants: Participant[] = [
        { id: 1, name: "Jean Dupont", email: "jean.dupont@example.com" },
        { id: 2, name: "Marie Martin", email: "marie.martin@example.com" },
        { id: 3, name: "Pierre Dubois", email: "pierre.dubois@example.com" },
        { id: 4, name: "Sophie Lefevre", email: "sophie.lefevre@example.com" }
      ];
      
      // Sélection aléatoire de l'un des participants simulés
      const randomIndex = Math.floor(Math.random() * mockParticipants.length);
      const winner = mockParticipants[randomIndex];
      
      onDrawWinner(lottery.id, winner);
      toast.success(`Félicitations ! ${winner.name} a gagné la loterie "${lottery.title}" !`);
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
      disabled={!canDrawWinner}
      variant="outline"
      className={`flex items-center gap-2 ${
        canDrawWinner 
          ? "bg-winshirt-purple hover:bg-winshirt-purple-dark text-white" 
          : "text-gray-400"
      }`}
      size="sm"
    >
      <Gift size={16} />
      Tirer au sort
    </Button>
  );
};

export default DrawWinnerButton;
