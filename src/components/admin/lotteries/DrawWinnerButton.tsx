
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

interface DrawWinnerButtonProps {
  lottery: ExtendedLottery;
  onDrawWinner: (lotteryId: number, winner: Participant) => void;
}

const DrawWinnerButton: React.FC<DrawWinnerButtonProps> = ({ lottery, onDrawWinner }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  
  // Check if draw is possible
  const canDrawWinner = lottery.status === 'active' && 
    lottery.participants && 
    lottery.participants.length > 0 && 
    lottery.currentParticipants >= lottery.targetParticipants;
  
  const handleDraw = () => {
    if (!lottery.participants || lottery.participants.length === 0) {
      toast.error("Aucun participant à cette loterie");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate draw with delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * lottery.participants!.length);
      const winnerParticipant = lottery.participants![randomIndex];
      setWinner(winnerParticipant);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleConfirmWinner = () => {
    if (winner) {
      onDrawWinner(lottery.id, winner);
      setIsDialogOpen(false);
      setWinner(null);
    }
  };
  
  const resetDrawState = () => {
    setWinner(null);
    setIsLoading(false);
  };
  
  // If lottery is already completed or not active, don't show button
  if (lottery.status !== 'active') {
    return null;
  }
  
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setIsDialogOpen(true);
          resetDrawState();
        }}
        disabled={!canDrawWinner}
        title={!canDrawWinner ? "Nombre de participants insuffisant" : "Tirer au sort un gagnant"}
        className={canDrawWinner ? 
          "border-green-500 text-green-500 hover:bg-green-500/10" : 
          "border-gray-500 text-gray-500 opacity-60 cursor-not-allowed"
        }
      >
        <Trophy size={16} />
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetDrawState();
      }}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30">
          <DialogHeader>
            <DialogTitle className="text-white">{lottery.title} - Tirage au sort</DialogTitle>
            <DialogDescription className="text-gray-400">
              {winner ? 
                "Le gagnant a été sélectionné. Confirmez-vous ce résultat ?" : 
                `Il y a actuellement ${lottery.participants?.length || 0} participants à cette loterie.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="spinner mb-4"></div>
                <p className="text-white">Tirage au sort en cours...</p>
              </div>
            ) : winner ? (
              <div className="bg-winshirt-blue/20 border border-winshirt-blue/40 rounded-lg p-4 text-center">
                <p className="text-white mb-2">Le gagnant est :</p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  {winner.avatar && (
                    <img src={winner.avatar} alt={winner.name} className="w-12 h-12 rounded-full object-cover border-2 border-winshirt-purple" />
                  )}
                  <h3 className="text-2xl font-bold text-winshirt-purple-light">{winner.name}</h3>
                </div>
                <p className="text-gray-400">{winner.email}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white mb-4">Êtes-vous sûr de vouloir procéder au tirage au sort ?</p>
                <p className="text-gray-400 text-sm">
                  Cette action est irréversible et marquera la loterie comme terminée.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-winshirt-space-light">
                {winner ? "Annuler" : "Fermer"}
              </Button>
            </DialogClose>
            
            {winner ? (
              <Button 
                onClick={handleConfirmWinner}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmer le gagnant
              </Button>
            ) : (
              <Button 
                onClick={handleDraw}
                disabled={isLoading || lottery.participants?.length === 0}
                className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
              >
                Tirer au sort
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DrawWinnerButton;
