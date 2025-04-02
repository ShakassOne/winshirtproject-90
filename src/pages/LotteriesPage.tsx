
import React, { useState, useEffect } from 'react';
import { mockLotteries } from '../data/mockData';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { ExtendedLottery } from '@/types/lottery';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  
  // Fonction pour charger les loteries depuis localStorage ou fallback aux mocks
  const getInitialLotteries = () => {
    try {
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        const parsedLotteries = JSON.parse(storedLotteries);
        if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
          return parsedLotteries;
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des loteries:", error);
    }
    
    // Fallback aux loteries mock si rien n'est trouvé dans localStorage
    return mockLotteries;
  };
  
  // Ajouter la loterie iPhone si elle n'existe pas déjà
  const addIPhoneLottery = (currentLotteries: ExtendedLottery[]): ExtendedLottery[] => {
    // Vérifier si une loterie avec l'iPhone existe déjà
    const iPhoneLotteryExists = currentLotteries.some(
      lottery => lottery.title.toLowerCase().includes('iphone')
    );
    
    if (!iPhoneLotteryExists) {
      // Créer une nouvelle loterie iPhone
      const iPhoneLottery: ExtendedLottery = {
        id: Math.max(...currentLotteries.map(l => l.id)) + 1, // ID unique
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
      
      return [...currentLotteries, iPhoneLottery];
    }
    
    return currentLotteries;
  };
  
  // Charger les loteries au montage du composant
  useEffect(() => {
    let loadedLotteries = getInitialLotteries();
    
    // Ajouter la loterie iPhone si nécessaire
    loadedLotteries = addIPhoneLottery(loadedLotteries);
    
    // Mettre à jour l'état et localStorage
    setLotteries(loadedLotteries);
    localStorage.setItem('lotteries', JSON.stringify(loadedLotteries));
    
    // Ajouter un écouteur d'événement pour détecter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lotteries') {
        let updatedLotteries = getInitialLotteries();
        updatedLotteries = addIPhoneLottery(updatedLotteries);
        setLotteries(updatedLotteries);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', () => {
      let updatedLotteries = getInitialLotteries();
      updatedLotteries = addIPhoneLottery(updatedLotteries);
      setLotteries(updatedLotteries);
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', () => {});
    };
  }, []);
  
  const filteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  // Check if there are any featured lotteries
  const hasFeaturedLotteries = lotteries.some(lottery => lottery.featured);
  
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
