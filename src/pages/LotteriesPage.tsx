
import React, { useState, useEffect } from 'react';
import { mockLotteries } from '../data/mockData';
import LotteryCard from '../components/LotteryCard';
import StarBackground from '../components/StarBackground';
import { Button } from '@/components/ui/button';
import { ExtendedLottery } from '@/types/lottery';
import FeaturedLotterySlider from '@/components/FeaturedLotterySlider';
import { fetchLotteries } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';

const LotteriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fonction optimisée pour ajouter la loterie iPhone
  const addSpecialLotteries = (currentLotteries: ExtendedLottery[]): ExtendedLottery[] => {
    let updatedLotteries = [...currentLotteries];
    
    // Vérifier si une loterie avec l'iPhone existe déjà
    const iPhoneLotteryExists = updatedLotteries.some(
      lottery => lottery.title.toLowerCase().includes('iphone')
    );
    
    if (!iPhoneLotteryExists) {
      // Créer une nouvelle loterie iPhone
      const iPhoneLottery: ExtendedLottery = {
        id: Math.max(...updatedLotteries.map(l => l.id), 0) + 1, // ID unique
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
      
      updatedLotteries.push(iPhoneLottery);
    }
    
    // Vérifier si une loterie qui va se terminer existe déjà
    const expiringLotteryExists = updatedLotteries.some(
      lottery => lottery.title.toLowerCase().includes('se termine bientôt')
    );
    
    if (!expiringLotteryExists) {
      // Créer une loterie qui va bientôt se terminer
      const expiringLottery: ExtendedLottery = {
        id: Math.max(...updatedLotteries.map(l => l.id), 0) + 2, // ID unique
        title: "PS5 Pro Edition Limitée - Se termine bientôt",
        description: "Dernière chance de gagner cette PS5 Pro en édition limitée! Le tirage aura lieu dans quelques heures.",
        value: 899,
        targetParticipants: 20,
        currentParticipants: 20, // Complète
        status: "active",
        image: "https://pixelprint.world/wp-content/uploads/2025/04/ps5-limited-edition.jpg",
        endDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 heure à partir de maintenant
        featured: true,
      };
      
      updatedLotteries.push(expiringLottery);
    }
    
    // Vérifier si une loterie complétée existe déjà
    const completedLotteryExists = updatedLotteries.some(
      lottery => lottery.status === "completed" && lottery.title.toLowerCase().includes('macbook')
    );
    
    if (!completedLotteryExists) {
      // Ajouter une loterie déjà complétée
      const completedLottery: ExtendedLottery = {
        id: Math.max(...updatedLotteries.map(l => l.id), 0) + 3, // ID unique
        title: "MacBook Pro M3 Max",
        description: "Cette loterie pour un MacBook Pro avec la puce M3 Max est maintenant terminée. Félicitations au gagnant!",
        value: 1999,
        targetParticipants: 40,
        currentParticipants: 40,
        status: "completed",
        image: "https://pixelprint.world/wp-content/uploads/2025/04/macbook-pro-m3.jpg",
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours avant aujourd'hui
        drawDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 jour avant aujourd'hui
        winner: {
          id: 123,
          name: "Jean Dupont",
          email: "jean.dupont@example.com",
          avatar: "https://ui-avatars.com/api/?name=Jean+Dupont"
        }
      };
      
      updatedLotteries.push(completedLottery);
    }
    
    return updatedLotteries;
  };
  
  // Fonction optimisée pour synchroniser les loteries avec le stockage
  const syncAllLotteriesToStorage = (loadedLotteries: ExtendedLottery[]) => {
    try {
      // Optimisation: stringify une seule fois
      const stringifiedData = JSON.stringify(loadedLotteries);
      localStorage.setItem('lotteries', stringifiedData);
      sessionStorage.setItem('lotteries', stringifiedData);
      
      // Un seul événement dispatch
      window.dispatchEvent(new CustomEvent('lotteriesUpdated', { 
        detail: { lotteries: loadedLotteries } 
      }));
      
      console.log("Lotteries synced to storage:", loadedLotteries.length);
    } catch (err) {
      console.error("Error syncing lotteries to storage:", err);
    }
  };
  
  // Charger les loteries au montage du composant avec une approche optimisée
  useEffect(() => {
    const loadLotteries = async () => {
      setIsLoading(true);
      let allLotteries: ExtendedLottery[] = [];
      
      try {
        // 1. Essayer d'abord le localStorage pour un chargement rapide
        try {
          const storedLotteries = localStorage.getItem('lotteries');
          if (storedLotteries) {
            const parsedLotteries = JSON.parse(storedLotteries);
            if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
              allLotteries = parsedLotteries;
              console.log("Loaded from localStorage:", parsedLotteries.length);
            }
          }
        } catch (err) {
          console.error("Error parsing localStorage lotteries:", err);
        }
        
        // 2. Si pas de données en localStorage, essayer l'API
        if (allLotteries.length === 0) {
          try {
            const apiLotteries = await fetchLotteries();
            if (apiLotteries && apiLotteries.length > 0) {
              allLotteries = apiLotteries;
              console.log("Loaded from API:", apiLotteries.length);
            }
          } catch (err) {
            console.error("Error fetching lotteries from API:", err);
          }
        }
        
        // 3. Si toujours pas de données, utiliser les mock lotteries
        if (allLotteries.length === 0) {
          allLotteries = mockLotteries as ExtendedLottery[];
          console.log("Using mock lotteries:", allLotteries.length);
        }
        
        // 4. Ajouter les loteries spéciales
        const specialLotteriesIds = [1001, 1002]; // IDs des loteries spéciales
        
        specialLotteriesIds.forEach(id => {
          const exists = allLotteries.some(lottery => lottery.id === id);
          if (!exists) {
            // Créer une version simplifiée des loteries spéciales
            const specialLottery: ExtendedLottery = {
              id: id,
              title: id === 1001 ? "Loterie date expirée" : "Loterie max participants",
              description: id === 1001 
                ? "Cette loterie a dépassé sa date de fin et est prête pour le tirage" 
                : "Cette loterie a atteint son nombre maximum de participants et est prête pour le tirage",
              value: id === 1001 ? 150 : 200,
              targetParticipants: id === 1001 ? 10 : 5,
              currentParticipants: id === 1001 ? 8 : 5,
              status: 'active',
              image: id === 1001 
                ? "https://placehold.co/600x400/png?text=Date+Expiree"
                : "https://placehold.co/600x400/png?text=Max+Participants",
              endDate: id === 1001
                ? new Date(Date.now() - 86400000).toISOString()
                : new Date(Date.now() + 86400000).toISOString(),
            };
            allLotteries.push(specialLottery);
          }
        });
        
        // 5. Ajouter les loteries spéciales (iPhone, expirante, complétée)
        allLotteries = addSpecialLotteries(allLotteries);
        
        // 6. Synchroniser toutes les loteries
        syncAllLotteriesToStorage(allLotteries);
        
        // Mettre à jour l'état
        setLotteries(allLotteries);
      } catch (error) {
        console.error('Erreur lors du chargement des loteries:', error);
        toast.error("Erreur lors du chargement des loteries");
        
        // Fallback aux mock data si tout échoue
        let loadedLotteries = mockLotteries as ExtendedLottery[];
        loadedLotteries = addSpecialLotteries(loadedLotteries);
        setLotteries(loadedLotteries);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLotteries();
    
    // Optimisation: Ne réagir qu'aux événements essentiels
    const handleLotteryUpdate = (event: Event) => {
      // Vérifier si une mise à jour complète est nécessaire
      if ((event as CustomEvent).detail?.forceReload) {
        loadLotteries();
      }
    };
    
    window.addEventListener('storageUpdate', handleLotteryUpdate);
    window.addEventListener('lotteriesUpdated', handleLotteryUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleLotteryUpdate);
      window.removeEventListener('lotteriesUpdated', handleLotteryUpdate);
    };
  }, []);
  
  // Filtrer les loteries selon le statut sélectionné
  const safeFilteredLotteries = activeFilter === 'all' 
    ? lotteries 
    : lotteries.filter(lottery => lottery.status === activeFilter);
  
  // Vérifier s'il y a des loteries en vedette
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
