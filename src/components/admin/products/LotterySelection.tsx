
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { ExtendedLottery } from '@/types/lottery';

interface LotterySelectionProps {
  lotteries: ExtendedLottery[];
  selectedLotteries: string[];
  onToggleLottery: (lotteryId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  lotteries,
  selectedLotteries,
  onToggleLottery,
  onSelectAll,
  onDeselectAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les loteries en fonction du terme de recherche
  const filteredLotteries = lotteries.filter(lottery => 
    lottery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lottery.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-2">
        <FormLabel className="text-white">Loteries associées</FormLabel>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            className="border-winshirt-blue/30 text-winshirt-blue-light hover:bg-winshirt-blue/20"
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
      
      {/* Recherche de loteries */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher des loteries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-winshirt-space-light border-winshirt-purple/30"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
        {filteredLotteries.map(lottery => {
          const isSelected = selectedLotteries.includes(lottery.id.toString());
          return (
            <div 
              key={lottery.id}
              className={`p-3 rounded-lg cursor-pointer flex items-center ${isSelected ? 'bg-winshirt-blue/30' : 'bg-winshirt-space-light'}`}
              onClick={() => onToggleLottery(lottery.id.toString())}
            >
              <div className="mr-3 flex items-center justify-center w-5 h-5">
                {isSelected ? (
                  <Check size={16} className="text-winshirt-blue-light" />
                ) : (
                  <div className="w-4 h-4 border border-gray-400 rounded" />
                )}
              </div>
              <div className="flex items-center flex-grow">
                <img
                  src={lottery.image}
                  alt={lottery.title}
                  className="w-10 h-10 object-cover rounded mr-3"
                />
                <div>
                  <h4 className="font-medium text-white">{lottery.title}</h4>
                  <p className="text-sm text-gray-400">
                    <span className="mr-2">{lottery.status}</span>
                    <span>Valeur: {lottery.value.toFixed(2)} €</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredLotteries.length === 0 && (
          <p className="text-gray-400 text-center py-4">Aucune loterie ne correspond à votre recherche</p>
        )}
      </div>
    </div>
  );
};

export default LotterySelection;
