
import { useState, useEffect } from 'react';
import { ExtendedLottery } from '@/types/lottery';
import { supabase } from '@/lib/supabase';
import { snakeToCamel } from '@/lib/supabase';

export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lotteries')
          .select('*')
          .eq('status', 'active');
        
        if (error) throw error;
        
        if (data) {
          // Convertir les noms de propriétés de snake_case à camelCase
          const formattedLotteries = data.map(lottery => snakeToCamel(lottery)) as ExtendedLottery[];
          setLotteries(formattedLotteries);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des loteries:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  return { lotteries, loading, error };
};
