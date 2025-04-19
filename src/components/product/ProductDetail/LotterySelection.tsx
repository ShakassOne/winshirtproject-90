
import React, { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtendedLottery } from '@/types/lottery';
import { fetchLotteries } from '@/api/lotteryApi';
import { showNotification } from '@/lib/notifications';

interface LotterySelectionProps {
  tickets: number;
  selectedLotteries: string[];
  handleLotteryChange: (lotteryId: string, index: number) => void;
  activeLotteries?: ExtendedLottery[];
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  tickets,
  selectedLotteries,
  handleLotteryChange,
  activeLotteries: propActiveLotteries
}) => {
  const [loadedLotteries, setLoadedLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    // Toujours recharger les loteries pour s'assurer qu'elles sont à jour
    const loadLotteries = async () => {
      setLoading(true);
      setLoadError(null);
      
      try {
        console.log('Fetching fresh lotteries data...');
        const lotteries = await fetchLotteries(true); // Force refresh
        
        if (!lotteries || lotteries.length === 0) {
          console.warn('No active lotteries found or returned');
          setLoadedLotteries([]);
          showNotification('info', 'lottery', false, 'Aucune loterie active disponible');
        } else {
          console.log(`Fetched ${lotteries.length} lotteries, filtering active ones`);
          const activeLotteries = lotteries.filter(lottery => lottery.status === 'active');
          console.log(`Found ${activeLotteries.length} active lotteries`);
          setLoadedLotteries(activeLotteries);
        }
      } catch (error) {
        console.error("Error loading lotteries:", error);
        setLoadError(error instanceof Error ? error.message : 'Erreur inconnue');
        showNotification('error', 'lottery', false, 'Impossible de charger les loteries');
      } finally {
        setLoading(false);
      }
    };
    
    loadLotteries();
  }, []);
  
  // Use provided lotteries or loaded ones
  const activeLotteries = propActiveLotteries || loadedLotteries;

  // Log pour le débogage
  useEffect(() => {
    console.log('Active lotteries in component:', activeLotteries);
    console.log('Selected lotteries:', selectedLotteries);
  }, [activeLotteries, selectedLotteries]);
  
  if (!tickets || tickets <= 0) return null;

  return (
    <div className="space-y-4">
      <Label className="text-white flex items-center">
        <Ticket size={16} className="mr-2" />
        Choisissez {tickets > 1 ? 'vos loteries' : 'votre loterie'}
      </Label>
      
      {loading ? (
        <div className="text-gray-400 text-sm">Chargement des loteries...</div>
      ) : loadError ? (
        <div className="text-red-400 text-sm">Erreur: {loadError}</div>
      ) : activeLotteries.length === 0 ? (
        <div className="text-yellow-400 text-sm">Aucune loterie active disponible</div>
      ) : (
        Array.from({ length: tickets }).map((_, index) => (
          <div key={index} className="space-y-1">
            <Label className="text-sm text-gray-400">Ticket {index + 1}</Label>
            <Select
              value={selectedLotteries[index] || ''}
              onValueChange={(value) => handleLotteryChange(value, index)}
            >
              <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                <SelectValue placeholder="Choisir une loterie" />
              </SelectTrigger>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                {activeLotteries.map((lottery) => (
                  <SelectItem key={lottery.id} value={lottery.id.toString()}>
                    {lottery.title} - {lottery.value}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))
      )}
    </div>
  );
};

export default LotterySelection;
