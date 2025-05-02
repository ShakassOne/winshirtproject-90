
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LotterySelectionProps {
  tickets: number;
  selectedLotteries: string[];
  handleLotteryChange: (lotteryId: string, index: number) => void;
}

interface Lottery {
  id: number;
  title: string;
  status: string;
}

const LotterySelection: React.FC<LotterySelectionProps> = ({
  tickets,
  selectedLotteries,
  handleLotteryChange
}) => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get lotteries from Supabase
        const { data, error } = await supabase
          .from('lotteries')
          .select('*')
          .eq('status', 'active');
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} active lotteries in Supabase`);
          setLotteries(data);
        } else {
          // Fall back to local storage if Supabase fails or returns no data
          const localLotteries = localStorage.getItem('lotteries');
          if (localLotteries) {
            const parsedLotteries = JSON.parse(localLotteries);
            const activeLotteries = parsedLotteries.filter((l: any) => l.status === 'active');
            console.log(`Found ${activeLotteries.length} active lotteries in localStorage`);
            setLotteries(activeLotteries);
          } else {
            setError('Aucune loterie active disponible. Veuillez contacter l\'administrateur.');
          }
        }
      } catch (err) {
        console.error("Error fetching lotteries:", err);
        
        // Try fallback to localStorage if Supabase fails
        try {
          const localLotteries = localStorage.getItem('lotteries');
          if (localLotteries) {
            const parsedLotteries = JSON.parse(localLotteries);
            const activeLotteries = parsedLotteries.filter((l: any) => l.status === 'active');
            console.log(`Fallback: Found ${activeLotteries.length} active lotteries in localStorage`);
            if (activeLotteries.length > 0) {
              setLotteries(activeLotteries);
              setError(null);
            } else {
              setError('Aucune loterie active disponible. Veuillez contacter l\'administrateur.');
            }
          } else {
            setError('Aucune loterie active disponible. Veuillez contacter l\'administrateur.');
          }
        } catch (fallbackErr) {
          console.error("Fallback error:", fallbackErr);
          setError('Aucune loterie active disponible. Veuillez contacter l\'administrateur.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchLotteries();
  }, []);

  // Create array for multiple ticket selection
  const ticketIndices = Array.from({ length: tickets }, (_, i) => i);

  if (loading) {
    return (
      <div className="animate-pulse bg-winshirt-blue/10 p-4 rounded-md">
        <div className="h-4 bg-winshirt-blue/20 rounded w-3/4 mb-2"></div>
        <div className="h-10 bg-winshirt-blue/20 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-winshirt-space border border-winshirt-red/30">
        <div className="text-winshirt-red text-center">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Trophy className="h-5 w-5 text-winshirt-purple" />
        <h3 className="text-lg font-medium">Participation à la loterie</h3>
      </div>

      {ticketIndices.map((index) => (
        <div key={index} className="space-y-2">
          <Label htmlFor={`lottery-${index}`}>
            {tickets > 1 ? `Ticket ${index + 1}` : 'Choisissez une loterie'}
          </Label>
          <Select
            value={selectedLotteries[index] || ''}
            onValueChange={(value) => handleLotteryChange(value, index)}
          >
            <SelectTrigger id={`lottery-${index}`} className="bg-winshirt-space/80 border-winshirt-purple/30">
              <SelectValue placeholder="Sélectionnez une loterie" />
            </SelectTrigger>
            <SelectContent>
              {lotteries.map((lottery) => (
                <SelectItem key={lottery.id} value={lottery.id.toString()}>
                  {lottery.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      
      <p className="text-sm text-gray-400">
        En choisissant un produit, vous participez automatiquement à la loterie sélectionnée.
      </p>
    </div>
  );
};

export default LotterySelection;
