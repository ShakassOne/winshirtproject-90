
import React, { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ExtendedLottery } from '@/types/lottery';
import { Card } from '@/components/ui/card';
import { getActiveLotteries } from '@/services/lotteryService';

interface LotterySelectionProps {
  tickets: number;
  selectedLotteries: string[];
  handleLotteryChange: (lotteryId: string, index: number) => void;
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  tickets,
  selectedLotteries,
  handleLotteryChange
}) => {
  const [activeLotteries, setActiveLotteries] = useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chargement des loteries actives depuis le service centralisé
  useEffect(() => {
    console.log("LotterySelection - Component mounted");
    
    const loadActiveLotteries = async () => {
      setIsLoading(true);
      try {
        const lotteries = await getActiveLotteries(true); // Force refresh
        console.log("LotterySelection - Loteries actives chargées:", lotteries);
        setActiveLotteries(lotteries);
        
        // Vérification de la cohérence des données sélectionnées
        if (selectedLotteries.length > 0) {
          console.log("LotterySelection - Vérification des loteries sélectionnées:", selectedLotteries);
          const validLotteryIds = lotteries.map(l => l.id.toString());
          const invalidSelections = selectedLotteries.filter(id => id && !validLotteryIds.includes(id));
          
          if (invalidSelections.length > 0) {
            console.warn("LotterySelection - Certaines loteries sélectionnées ne sont pas valides:", invalidSelections);
          }
        }
      } catch (error) {
        console.error("LotterySelection - Erreur lors du chargement des loteries:", error);
        setErrorMessage("Impossible de charger les loteries disponibles");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadActiveLotteries();
  }, [selectedLotteries]);

  if (!tickets || tickets <= 0) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label className="text-theme-content flex items-center">
          <Ticket className="h-4 w-4 mr-2" />
          Chargement des loteries...
        </Label>
        <div className="winshirt-card p-4 flex items-center justify-center h-24 animate-pulse">
          <p className="text-theme-content opacity-70">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <Label className="text-theme-content flex items-center">
          <Ticket className="h-4 w-4 mr-2" />
          Erreur
        </Label>
        <div className="winshirt-card p-4 flex items-center justify-center border border-red-500/30">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-theme-content flex items-center">
        <Ticket className="h-4 w-4 mr-2" />
        Choisissez {tickets > 1 ? 'vos loteries' : 'votre loterie'}
      </Label>
      
      {Array.from({ length: tickets }).map((_, index) => (
        <div key={index} className="winshirt-card p-4">
          <Label className="text-lg mb-4 block text-theme-content">
            Ticket {index + 1}
          </Label>
          
          {/* Dropdown with improved error state */}
          <div className="relative">
            <select
              value={selectedLotteries[index] || ''}
              onChange={(e) => handleLotteryChange(e.target.value, index)}
              className={`w-full p-3 rounded-lg bg-card text-theme-content appearance-none cursor-pointer border border-input ${
                activeLotteries.length === 0 ? 'border-red-500/50' : ''
              }`}
              disabled={activeLotteries.length === 0}
            >
              <option value="">Choisir une loterie</option>
              {activeLotteries.map((lottery) => (
                <option key={lottery.id} value={lottery.id}>
                  {lottery.title} - {lottery.value}€
                </option>
              ))}
            </select>

            {/* Show warning if there are no active lotteries */}
            {activeLotteries.length === 0 && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                <p className="text-red-200 text-sm">
                  Aucune loterie active disponible. Veuillez contacter l'administrateur.
                </p>
              </div>
            )}
          </div>

          {/* Selected Lottery Preview */}
          {selectedLotteries[index] && (
            <div className="mt-4 winshirt-card p-4 backdrop-blur-lg border border-input">
              {activeLotteries.map((lottery) => {
                if (lottery.id.toString() === selectedLotteries[index]) {
                  return (
                    <div key={lottery.id} className="flex gap-4 items-start">
                      <img 
                        src={lottery.image || 'https://placehold.co/100x100'}
                        alt={lottery.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-theme-content">
                          {lottery.title}
                        </h3>
                        <p className="text-lg font-bold text-winshirt-purple-light">
                          Valeur: {lottery.value}€
                        </p>
                        <div className="mt-2">
                          <div className="text-sm text-muted-foreground">
                            {lottery.currentParticipants} / {lottery.targetParticipants} participants
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div 
                              className="bg-winshirt-purple h-2 rounded-full" 
                              style={{ 
                                width: `${(lottery.currentParticipants / lottery.targetParticipants) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LotterySelection;
