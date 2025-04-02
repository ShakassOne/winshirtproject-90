
import React, { useState, useEffect } from 'react';
import { mockLotteries } from '../data/mockData';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { ExtendedLottery } from '@/types/lottery';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';
import { fetchLotteries } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ajouter la loterie iPhone si elle n'existe pas déjà
  const addIPhoneLottery = (currentLotteries: ExtendedLottery[]): ExtendedLottery[] => {
    // Vérifier si une loterie avec l'iPhone existe déjà
    const iPhoneLotteryExists = currentLotteries.some(
      lottery => lottery.title.toLowerCase().includes('iphone')
    );
    
    if (!iPhoneLotteryExists) {
      // Créer une nouvelle loterie iPhone
      const iPhoneLottery: ExtendedLottery = {
        id: Math.max(...currentLotteries.map(l => l.id), 0) + 1, // ID unique
        title: "iPhone 16 Pro",
        description: "Gagnez le tout nouveau iPhone 16 Pro avec ses nouvelles couleurs exclusives et ses fonctionnalités révolutionnaires.",
        value: 1299,
        targetParticipants: 30,
        currentParticipants: 12,
        status: "active",
        image: "https://pixelprint.world/wp-content/uploads/2025/04/iPhone-16-Pro-couleurs.jpg",
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 jours à partir d'aujourd'hui
        featured: true, // Set iPhone lottery as featured by default
      };
      
      // Essayer d'ajouter la loterie à Supabase (en arrière-plan)
      fetch('/api/lotteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iPhoneLottery)
      }).catch(error => {
        console.error("Erreur lors de l'ajout de la loterie iPhone:", error);
      });
      
      return [...currentLotteries, iPhoneLottery];
    }
    
    return currentLotteries;
  };
  
  // Charger les loteries au montage du composant
  useEffect(() => {
    const loadLotteries = async () => {
      setIsLoading(true);
      try {
        let loadedLotteries = await fetchLotteries();
        
        // Fallback to mock data if no lotteries in Supabase
        if (loadedLotteries.length === 0) {
          loadedLotteries = mockLotteries as ExtendedLottery[];
        }
        
        // Ajouter la loterie iPhone si nécessaire
        loadedLotteries = addIPhoneLottery(loadedLotteries);
        
        setLotteries(loadedLotteries);
      } catch (error) {
        console.error('Erreur lors du chargement des loteries:', error);
        toast.error("Erreur lors du chargement des loteries");
        
        // Fallback to mock data
        let loadedLotteries = mockLotteries as ExtendedLottery[];
        loadedLotteries = addIPhoneLottery(loadedLotteries);
        setLotteries(loadedLotteries);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLotteries();
    
    // Mettre en place un écouteur pour les mises à jour
    const handleStorageUpdate = () => {
      loadLotteries();
    };
    
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, []);
  
  const filteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  // Check if there are any featured lotteries
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
          
          {/* Lotteries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredLotteries.map(lottery => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>
          
          {filteredLotteries.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-400 mb-2">Aucune loterie trouvée</h3>
              <p className="text-gray-500">Il n'y a actuellement aucune loterie correspondant à ce filtre</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Add space at the bottom to prevent content from being hidden by the admin menu */}
      <AdminNavigation />
    </>
  );
};

export default LotteriesPage;
