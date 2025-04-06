
import React, { useState, useEffect } from 'react';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import { ExtendedLottery } from '@/types/lottery';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';
import { fetchLotteries } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load lotteries from Supabase with force refresh
  useEffect(() => {
    const loadLotteries = async () => {
      setIsLoading(true);
      try {
        // Force refresh to ensure we have the latest data
        const lotteriesData = await fetchLotteries(true);
        console.log("Loaded lotteries:", lotteriesData);
        setLotteries(lotteriesData);
      } catch (error) {
        console.error('Error loading lotteries:', error);
        toast.error("Erreur lors du chargement des loteries");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLotteries();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:lotteries')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lotteries' }, 
        (payload) => {
          console.log("Lottery data changed, reloading...", payload);
          loadLotteries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter lotteries based on active filter
  const safeFilteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  // Check if there are featured lotteries
  const hasFeaturedLotteries = lotteries.some(lottery => lottery.featured);
  
  if (isLoading) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-24 flex justify-center items-center">
          <div className="text-white text-xl">Chargement des loteries...</div>
        </div>
      </>
    );
  }
  
  return (
    <>
      {/* Show featured lottery slider if there are any featured lotteries */}
      {hasFeaturedLotteries && (
        <FeaturedLotterySlider lotteries={lotteries} />
      )}
      
      <StarBackground />
      
      <section className={`${hasFeaturedLotteries ? 'pt-16' : 'pt-32'} pb-24`}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Nos Loteries
          </h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Participez à nos loteries exclusives et tentez de gagner des prix exceptionnels.
          </p>
          
          {/* Status Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              className={activeFilter === 'all' ? 'bg-winshirt-blue hover:bg-winshirt-blue-dark' : 'border-winshirt-blue-light/30 text-white'}
              onClick={() => setActiveFilter('all')}
            >
              Toutes
            </Button>
            <Button
              variant={activeFilter === 'active' ? 'default' : 'outline'}
              className={activeFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600/30 text-white'}
              onClick={() => setActiveFilter('active')}
            >
              Actives
            </Button>
            <Button
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              className={activeFilter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600/30 text-white'}
              onClick={() => setActiveFilter('completed')}
            >
              Terminées
            </Button>
            <Button
              variant={activeFilter === 'relaunched' ? 'default' : 'outline'}
              className={activeFilter === 'relaunched' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-600/30 text-white'}
              onClick={() => setActiveFilter('relaunched')}
            >
              Relancées
            </Button>
          </div>
          
          {/* Debug Information */}
          <div className="mb-6 text-center text-sm text-gray-500">
            {lotteries.length} loteries chargées
          </div>
          
          {/* Lotteries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {safeFilteredLotteries.map(lottery => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>
          
          {safeFilteredLotteries.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-400 mb-2">Aucune loterie trouvée</h3>
              <p className="text-gray-500">Il n'y a actuellement aucune loterie correspondant à ce filtre</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LotteriesPage;
