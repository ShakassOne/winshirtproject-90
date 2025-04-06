
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { ExtendedLottery, Participant } from '@/types/lottery';

interface DrawWinnerButtonProps {
  lottery: ExtendedLottery;
  onDrawWinner: (lotteryId: number, winner: Participant) => void;
}

const DrawWinnerButton: React.FC<DrawWinnerButtonProps> = ({ lottery, onDrawWinner }) => {
  // Vérifie si la loterie a atteint son objectif de participants ou si la date de fin est dépassée
  const isReadyForDraw = () => {
    // Vérifie si la loterie est déjà complétée
    if (lottery.status === 'completed') return false;
    
    // Si la date de fin est passée
    const isExpired = lottery.endDate ? new Date(lottery.endDate) < new Date() : false;
    
    // Si le nombre de participants est atteint
    const isFullyParticipated = lottery.currentParticipants >= lottery.targetParticipants;
    
    // Vérifier qu'il y a au moins un participant
    const hasParticipants = lottery.participants && lottery.participants.length > 0;
    
    // Loterie prête si la date est dépassée OU si le nombre de participants est atteint
    // ET s'il y a au moins un participant
    return hasParticipants && (isExpired || isFullyParticipated);
  };
  
  // S'il n'y a pas de participants, désactiver le bouton
  const hasParticipants = lottery.participants && lottery.participants.length > 0;
  
  // Si la loterie est prête pour le tirage, afficher le bouton
  if (isReadyForDraw()) {
    return (
      <Button
        size="sm"
        onClick={() => {
          // Sélectionner un gagnant aléatoire parmi les participants
          const randomIndex = Math.floor(Math.random() * lottery.participants!.length);
          const winner = lottery.participants![randomIndex];
          
          // Appeler la fonction de tirage au sort
          onDrawWinner(lottery.id, winner);
        }}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Gift size={16} className="mr-1" /> Tirer au sort
      </Button>
    );
  }
  
  // Si la loterie n'est pas prête mais a des participants, afficher un bouton désactivé
  if (hasParticipants && lottery.status !== 'completed') {
    // Calculer combien de participants sont encore nécessaires
    const neededParticipants = lottery.targetParticipants - lottery.currentParticipants;
    
    return (
      <Button
        size="sm"
        disabled
        variant="outline"
        className="text-gray-500 cursor-not-allowed"
        title={`Encore ${neededParticipants} participant(s) nécessaire(s) pour le tirage au sort`}
      >
        <Gift size={16} className="mr-1" /> Attente ({lottery.currentParticipants}/{lottery.targetParticipants})
      </Button>
    );
  }
  
  // Si la loterie est complétée, indiquer que le tirage est terminé
  if (lottery.status === 'completed') {
    return (
      <Button
        size="sm"
        disabled
        variant="outline"
        className="text-blue-400 cursor-not-allowed"
      >
        <Gift size={16} className="mr-1" /> Tirage terminé
      </Button>
    );
  }
  
  // Par défaut, ne rien afficher
  return null;
};

export default DrawWinnerButton;
