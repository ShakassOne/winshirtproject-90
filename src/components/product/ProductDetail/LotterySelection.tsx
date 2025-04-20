
import React, { useState } from 'react';
import { Ticket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ExtendedLottery } from '@/types/lottery';
import { Card, CardContent } from '@/components/ui/card';

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
  activeLotteries = []
}) => {
  if (!tickets || tickets <= 0) return null;

  return (
    <div className="space-y-4">
      <Label className="text-white flex items-center">
        <Ticket className="h-4 w-4 mr-2" />
        Choisissez {tickets > 1 ? 'vos loteries' : 'votre loterie'}
      </Label>
      
      {Array.from({ length: tickets }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Label className="text-sm text-gray-400">
            Ticket {index + 1}
          </Label>
          
          {/* Dropdown styled as custom select */}
          <div className="relative">
            <select
              value={selectedLotteries[index] || ''}
              onChange={(e) => handleLotteryChange(e.target.value, index)}
              className="w-full p-3 rounded-lg bg-winshirt-space-light border border-winshirt-purple/30 text-white appearance-none cursor-pointer"
            >
              <option value="">Choisir une loterie</option>
              {activeLotteries.map((lottery) => (
                <option key={lottery.id} value={lottery.id}>
                  {lottery.title} - {lottery.value}€
                </option>
              ))}
            </select>
          </div>

          {/* Selected Lottery Preview */}
          {selectedLotteries[index] && (
            <Card className="mt-2 bg-white">
              <CardContent className="p-4">
                {activeLotteries.map((lottery) => {
                  if (lottery.id.toString() === selectedLotteries[index]) {
                    return (
                      <div key={lottery.id} className="flex gap-4 items-start">
                        <img 
                          src={lottery.image || 'https://placehold.co/100x100'} 
                          alt={lottery.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {lottery.title}
                          </h3>
                          <p className="text-lg font-bold text-winshirt-purple">
                            Valeur: {lottery.value}€
                          </p>
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
                              {lottery.current_participants} / {lottery.target_participants} participants
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-winshirt-purple h-2 rounded-full" 
                                style={{ 
                                  width: `${(lottery.current_participants / lottery.target_participants) * 100}%` 
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
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
};

export default LotterySelection;
