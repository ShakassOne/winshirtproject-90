
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Plus, Trash } from 'lucide-react';
import { ExtendedLottery, Participant } from '@/types/lottery';
import DrawWinnerButton from './DrawWinnerButton';

interface LotteryListProps {
  lotteries: ExtendedLottery[];
  selectedLotteryId: number | null;
  onCreateLottery: () => void;
  onEditLottery: (lotteryId: number) => void;
  onDeleteLottery: (lotteryId: number) => void;
  onDrawWinner: (lotteryId: number, winner: Participant) => void;
}

const LotteryList: React.FC<LotteryListProps> = ({
  lotteries,
  selectedLotteryId,
  onCreateLottery,
  onEditLottery,
  onDeleteLottery,
  onDrawWinner
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'completed':
        return 'text-blue-400';
      case 'relaunched':
        return 'text-purple-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="winshirt-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Loteries</h2>
        <Button 
          onClick={onCreateLottery}
          className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
        >
          <Plus size={16} className="mr-1" /> Nouvelle
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {lotteries.map(lottery => (
          <div 
            key={lottery.id}
            className={`p-4 rounded-lg transition-colors ${selectedLotteryId === lottery.id ? 'bg-winshirt-blue/20' : 'bg-winshirt-space-light hover:bg-winshirt-space-light/70'}`}
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center cursor-pointer flex-grow"
                onClick={() => onEditLottery(lottery.id)}
              >
                <Award className="mr-3 text-winshirt-blue-light" />
                <div>
                  <h3 className="font-medium text-white">{lottery.title}</h3>
                  <div className="flex items-center text-sm">
                    <span className={`${getStatusColor(lottery.status)}`}>
                      {lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
                    </span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-400">{lottery.value.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DrawWinnerButton 
                  lottery={lottery} 
                  onDrawWinner={onDrawWinner} 
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteLottery(lottery.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {lotteries.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucune loterie disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryList;
