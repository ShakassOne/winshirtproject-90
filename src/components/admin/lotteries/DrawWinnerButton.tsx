
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
    ((lottery.currentParticipants >= lottery.targetParticipants) || 
    (lottery.endDate && new Date(lottery.endDate) <= new Date()));

  const drawWinner = () => {
    // Créer des participants simulés si aucun n'est défini
    if (!lottery.participants || lottery.participants.length === 0) {
      // Simulation de participants pour la démonstration
      const simulatedParticipants = [
        { id: 1, name: "Jean Dupont", email: "jean@example.com", avatar: "https://i.pravatar.cc/150?u=jean" },
        { id: 2, name: "Marie Martin", email: "marie@example.com", avatar: "https://i.pravatar.cc/150?u=marie" },
        { id: 3, name: "Pierre Dubois", email: "pierre@example.com", avatar: "https://i.pravatar.cc/150?u=pierre" }
      ];
      
      const randomIndex = Math.floor(Math.random() * simulatedParticipants.length);
      const winner = simulatedParticipants[randomIndex];
      
      onDrawWinner(lottery.id, winner);
      toast.success(`Simulation : ${winner.name} a gagné la loterie "${lottery.title}" !`);
      return;
    }

    // S'il y a qu'un seul participant, il est automatiquement le gagnant
    if (lottery.participants.length === 1) {
      const winner = lottery.participants[0];
      onDrawWinner(lottery.id, winner);
      toast.success(`Félicitations ! ${winner.name} est l'unique participant et remporte la loterie "${lottery.title}" !`);
      return;
    }

    // S'il y a plusieurs participants, tirage aléatoire
    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    const winner = lottery.participants[randomIndex];
    
    onDrawWinner(lottery.id, winner);
    toast.success(`Félicitations ! ${winner.name} a gagné la loterie "${lottery.title}" parmi ${lottery.participants.length} participants !`);
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
