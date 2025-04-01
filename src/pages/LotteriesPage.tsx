
import React, { useState, useEffect } from 'react';
import { mockLotteries } from '../data/mockData';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/admin/AdminNavigation';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lotteries, setLotteries] = useState(mockLotteries);
  
  // Load lotteries from storage on mount and when URL changes
  useEffect(() => {
    const loadLotteries = () => {
      // Try localStorage first
      const localLotteries = localStorage.getItem('lotteries');
      if (localLotteries) {
        try {
          const parsedLotteries = JSON.parse(localLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Sync with sessionStorage
            sessionStorage.setItem('lotteries', localLotteries);
            return;
          }
        } catch (error) {
          console.error("Error loading lotteries from localStorage:", error);
        }
      }
      
      // Fallback to sessionStorage
      const sessionLotteries = sessionStorage.getItem('lotteries');
      if (sessionLotteries) {
        try {
          const parsedLotteries = JSON.parse(sessionLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
            // Sync with localStorage
            localStorage.setItem('lotteries', sessionLotteries);
          }
        } catch (error) {
          console.error("Error loading lotteries from sessionStorage:", error);
        }
      }
    };
    
    // Load on component mount
    loadLotteries();
    
    // Add event listener to detect URL changes
    window.addEventListener('popstate', loadLotteries);
    
    return () => {
      window.removeEventListener('popstate', loadLotteries);
    };
  }, []);
  
  const filteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-24">
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
