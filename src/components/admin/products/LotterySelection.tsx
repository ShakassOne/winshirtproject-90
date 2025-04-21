
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';

interface LotterySelectionProps {
  lotteries: ExtendedLottery[];
  selectedLotteries: string[];
  onToggleLottery: (lotteryId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  maxSelections?: number;
  enforceMaxSelection?: boolean;
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  lotteries,
  selectedLotteries,
  onToggleLottery,
  onSelectAll,
  onDeselectAll,
  maxSelections = 1,
  enforceMaxSelection = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debug info
  console.log('Available lotteries in admin:', lotteries);
  console.log('Currently selected lotteries:', selectedLotteries);

  // Filter lotteries based on search term
  const filteredLotteries = lotteries.filter(lottery => 
    lottery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lottery.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle toggle with better error messages
  const handleToggle = (lotteryId: string) => {
    if (enforceMaxSelection && !selectedLotteries.includes(lotteryId) && selectedLotteries.length >= maxSelections) {
      toast.warning(`Vous ne pouvez pas sélectionner plus de ${maxSelections} loterie${maxSelections > 1 ? 's' : ''}`);
      return;
    }
    onToggleLottery(lotteryId);
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <div className="text-white text-sm font-medium">
          {enforceMaxSelection && maxSelections > 1 
            ? `Loteries associées (${selectedLotteries.length}/${maxSelections})` 
            : "Loteries associées"}
        </div>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/20"
          >
            Tout sélectionner
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onDeselectAll}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Tout désélectionner
          </Button>
        </div>
      </div>
      
      {/* Lottery search */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher des loteries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-winshirt-space-light border-winshirt-purple/30"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
        {filteredLotteries.length > 0 ? (
          filteredLotteries.map(lottery => {
            const isSelected = selectedLotteries.includes(lottery.id.toString());
            // N'appliquer la limite que si enforceMaxSelection est vrai
            const isDisabled = enforceMaxSelection && !isSelected && selectedLotteries.length >= maxSelections;
            
            return (
              <div 
                key={lottery.id}
                className={`p-3 rounded-lg flex items-center ${
                  isSelected 
                    ? 'bg-winshirt-purple/30 cursor-pointer' 
                    : isDisabled 
                      ? 'bg-winshirt-space-light opacity-50 cursor-not-allowed' 
                      : 'bg-winshirt-space-light cursor-pointer'
                }`}
                onClick={() => !isDisabled && handleToggle(lottery.id.toString())}
              >
                <div className="mr-3 flex items-center justify-center w-5 h-5">
                  {isSelected ? (
                    <Check size={16} className="text-winshirt-purple-light" />
                  ) : (
                    <div className={`w-4 h-4 border rounded ${isDisabled ? 'border-gray-600' : 'border-gray-400'}`} />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white">{lottery.title}</h4>
                  <p className="text-sm text-gray-400">Valeur: {lottery.value.toFixed(2)} €</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-center py-4">
            {lotteries.length === 0 
              ? "Aucune loterie disponible. Veuillez en créer dans la section Loteries." 
              : "Aucune loterie ne correspond à votre recherche"}
          </p>
        )}
      </div>

      {/* Debug info for troubleshooting */}
      {lotteries.length === 0 && (
        <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-md">
          <p className="text-amber-200 text-sm">
            Aucune loterie active trouvée. Vérifiez que vous avez créé des loteries avec le statut "active".
          </p>
        </div>
      )}
    </div>
  );
};

export default LotterySelection;
