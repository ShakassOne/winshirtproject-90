
import React, { useState } from 'react';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';
import { toast } from '@/lib/toast';
import { useLotteries } from '@/services/lotteryService';
import { Loader2, RefreshCw } from 'lucide-react';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { lotteries, loading, error, refreshLotteries } = useLotteries();
  
  const safeFilteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  // Check if there are featured lotteries
  const hasFeaturedLotteries = lotteries.some(lottery => lottery.featured);
  
  const handleDebug = () => {
    try {
      const localStorageLotteries = localStorage.getItem('lotteries');
      console.log('Contenu du localStorage (lotteries):', localStorageLotteries ? JSON.parse(localStorageLotteries) : null);
      toast.info("Données des loteries affichées dans la console");
    } catch (error) {
      console.error("Erreur lors de la lecture du localStorage:", error);
      toast.error("Erreur lors de la lecture du localStorage");
    }
  };
  
  if (loading) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-24 flex justify-center items-center">
          <div className="flex items-center gap-2 text-xl text-white">
            <Loader2 className="h-6 w-6 animate-spin text-winshirt-blue" />
            Chargement des loteries...
          </div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center">
          <div className="text-red-400 text-xl mb-4">Erreur lors du chargement des loteries</div>
          <Button onClick={refreshLotteries} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mt-[-6rem]"> 
        {hasFeaturedLotteries && (
          <FeaturedLotterySlider lotteries={lotteries} />
        )}
      </div>
      
      <StarBackground />
      <section className={`${hasFeaturedLotteries ? 'pt-0' : 'pt-32'} pb-24`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
              Nos Loteries
            </h1>
            
            <div className="flex gap-2">
              <Button 
                onClick={refreshLotteries} 
                variant="outline"
                className="text-winshirt-blue border-winshirt-blue/40"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
              </Button>
              
              <Button
                onClick={handleDebug}
                variant="outline"
                size="sm"
                className="text-winshirt-purple border-winshirt-purple/40"
              >
                Debug
              </Button>
            </div>
          </div>
          
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Participez à nos loteries exclusives et tentez de gagner des prix exceptionnels.
          </p>
          
          {/* Status Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              className={activeFilter === 'all' ? 'bg-winshirt-blue hover:bg-winshirt-blue-dark' : 'border-winshirt-blue-light/30 white-text'}
              onClick={() => setActiveFilter('all')}
            >
              Toutes
            </Button>
            <Button
              variant={activeFilter === 'active' ? 'default' : 'outline'}
              className={activeFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600/30 white-text'}
              onClick={() => setActiveFilter('active')}
            >
              Actives
            </Button>
            <Button
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              className={activeFilter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600/30 white-text'}
              onClick={() => setActiveFilter('completed')}
            >
              Terminées
            </Button>
            <Button
              variant={activeFilter === 'relaunched' ? 'default' : 'outline'}
              className={activeFilter === 'relaunched' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-600/30 white-text'}
              onClick={() => setActiveFilter('relaunched')}
            >
              Relancées
            </Button>
          </div>
          
          {/* Connection Status */}
          <div className="mb-6 text-center text-sm text-gray-500">
            {lotteries.length} loterie{lotteries.length !== 1 ? 's' : ''} chargée{lotteries.length !== 1 ? 's' : ''}
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
