
import React from 'react';
import { Ticket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtendedLottery } from '@/types/lottery';

interface LotterySelectionProps {
  tickets: number;
  selectedLotteries: string[];
  handleLotteryChange: (lotteryId: string, index: number) => void;
  activeLotteries: ExtendedLottery[];
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  tickets,
  selectedLotteries,
  handleLotteryChange,
  activeLotteries
}) => {
  if (!tickets || tickets <= 0) return null;

  return (
    <div className="space-y-4">
      <Label className="text-white flex items-center">
        <Ticket size={16} className="mr-2" />
        Choisissez {tickets > 1 ? 'vos loteries' : 'votre loterie'}
      </Label>
      
      {Array.from({ length: tickets }).map((_, index) => (
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
      ))}
    </div>
  );
};

export default LotterySelection;
