
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useLotteryForm } from '@/hooks/useLotteryForm';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gift } from 'lucide-react';
import { fetchLotteries } from '@/api/lotteryApi';
import { fetchProducts } from '@/api/productApi';
import AdminNavigationHandler from '@/components/AdminNavigationHandler';

const AdminLotteriesPage: React.FC = () => {
  // Création de deux loteries spéciales
  const specialLotteries: ExtendedLottery[] = [
    // 1. Loterie dont la date de fin est passée
    {
      id: 1001,
      title: "Loterie date expirée",
      description: "Cette loterie a dépassé sa date de fin et est prête pour le tirage",
      value: 150,
      targetParticipants: 10,
      currentParticipants: 8, // Pas encore atteint le max
      status: 'active',
      image: "https://placehold.co/600x400/png?text=Date+Expiree",
      endDate: new Date(Date.now() - 86400000).toISOString(), // Date dans le passé (hier)
      linkedProducts: [1, 2],
      participants: [
        { id: 1, name: "Jules Martin", email: "jules@example.com", avatar: "https://i.pravatar.cc/150?u=jules" },
        { id: 2, name: "Sophie Dubois", email: "sophie@example.com", avatar: "https://i.pravatar.cc/150?u=sophie" },
        { id: 3, name: "Marc Lefevre", email: "marc@example.com", avatar: "https://i.pravatar.cc/150?u=marc" },
        { id: 4, name: "Emma Laurent", email: "emma@example.com", avatar: "https://i.pravatar.cc/150?u=emma" },
        { id: 5, name: "Thomas Petit", email: "thomas@example.com", avatar: "https://i.pravatar.cc/150?u=thomas" },
        { id: 6, name: "Julie Moreau", email: "julie@example.com", avatar: "https://i.pravatar.cc/150?u=julie" },
        { id: 7, name: "Nicolas Garcia", email: "nicolas@example.com", avatar: "https://i.pravatar.cc/150?u=nicolas" },
        { id: 8, name: "Camille Robin", email: "camille@example.com", avatar: "https://i.pravatar.cc/150?u=camille" }
      ]
    },
    // 2. Loterie qui a atteint son maximum de participants
    {
      id: 1002,
      title: "Loterie max participants",
      description: "Cette loterie a atteint son nombre maximum de participants et est prête pour le tirage",
      value: 200,
      targetParticipants: 5,
      currentParticipants: 5, // Atteint le max
      status: 'active',
      image: "https://placehold.co/600x400/png?text=Max+Participants",
      endDate: new Date(Date.now() + 86400000).toISOString(), // Date future (demain)
      linkedProducts: [3, 4],
      participants: [
        { id: 1, name: "Louis Fournier", email: "louis@example.com", avatar: "https://i.pravatar.cc/150?u=louis" },
        { id: 2, name: "Clara Simon", email: "clara@example.com", avatar: "https://i.pravatar.cc/150?u=clara" },
        { id: 3, name: "Antoine Mercier", email: "antoine@example.com", avatar: "https://i.pravatar.cc/150?u=antoine" },
        { id: 4, name: "Léa Durand", email: "lea@example.com", avatar: "https://i.pravatar.cc/150?u=lea" },
        { id: 5, name: "Hugo Lemoine", email: "hugo@example.com", avatar: "https://i.pravatar.cc/150?u=hugo" }
      ]
    }
  ];

  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const lotteryStatuses = ['active', 'completed', 'relaunched', 'cancelled'];
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to sync lotteries to storage
  const syncLotteriesToStorage = (lotteriesData: ExtendedLottery[]) => {
    try {
      localStorage.setItem('lotteries', JSON.stringify(lotteriesData));
      sessionStorage.setItem('lotteries', JSON.stringify(lotteriesData));
      
      // Dispatch an event to notify other components that lotteries have been updated
      window.dispatchEvent(new CustomEvent('lotteriesUpdated', { 
        detail: { lotteries: lotteriesData } 
      }));
      
      console.log("Admin: Synced lotteries to storage:", lotteriesData.length);
    } catch (err) {
      console.error("Admin: Error syncing lotteries to storage:", err);
    }
  };
  
  // Chargement des données depuis toutes les sources
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Combine lotteries from all sources to ensure consistency
        let allLotteries: ExtendedLottery[] = [];
        
        // 1. Check localStorage
        try {
          const storedLotteries = localStorage.getItem('lotteries');
          if (storedLotteries) {
            const parsedLotteries = JSON.parse(storedLotteries);
            if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
              allLotteries = [...allLotteries, ...parsedLotteries];
              console.log("Admin: Loaded from localStorage:", parsedLotteries.length);
            }
          }
        } catch (err) {
          console.error("Admin: Error loading lotteries from localStorage:", err);
        }
        
        // 2. Check sessionStorage
        try {
          const sessionLotteries = sessionStorage.getItem('lotteries');
          if (sessionLotteries) {
            const parsedLotteries = JSON.parse(sessionLotteries);
            if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
              // Add only lotteries that aren't already in the array
              parsedLotteries.forEach(lottery => {
                if (!allLotteries.some(l => l.id === lottery.id)) {
                  allLotteries.push(lottery);
                }
              });
              console.log("Admin: Added from sessionStorage:", parsedLotteries.length);
            }
          }
        } catch (err) {
          console.error("Admin: Error loading lotteries from sessionStorage:", err);
        }
        
        // 3. Try API
        try {
          const apiLotteries = await fetchLotteries();
          if (apiLotteries && apiLotteries.length > 0) {
            // Add only lotteries that aren't already in the array
            apiLotteries.forEach(lottery => {
              if (!allLotteries.some(l => l.id === lottery.id)) {
                allLotteries.push(lottery);
              }
            });
            console.log("Admin: Added from API:", apiLotteries.length);
          }
        } catch (err) {
          console.error("Admin: Error fetching lotteries from API:", err);
        }
        
        // 4. If no lotteries found, add special ones
        if (allLotteries.length === 0) {
          allLotteries = [...specialLotteries];
          console.log("Admin: Using special lotteries:", specialLotteries.length);
        } else {
          // Make sure special lotteries are included
          specialLotteries.forEach(specialLottery => {
            if (!allLotteries.some(l => l.id === specialLottery.id)) {
              allLotteries.push(specialLottery);
              console.log(`Admin: Added special lottery ${specialLottery.id}`);
            }
          });
        }
        
        // 5. Check for iPhone lottery
        const iPhoneLotteryExists = allLotteries.some(
          lottery => lottery.title.toLowerCase().includes('iphone')
        );
        
        if (!iPhoneLotteryExists) {
          // Create iPhone lottery
          const iPhoneLottery: ExtendedLottery = {
            id: Math.max(...allLotteries.map(l => l.id), 0) + 1,
            title: "iPhone 16 Pro",
            description: "Gagnez le tout nouveau iPhone 16 Pro avec ses nouvelles couleurs exclusives et ses fonctionnalités révolutionnaires.",
            value: 1299,
            targetParticipants: 30,
            currentParticipants: 12,
            status: "active",
            image: "https://pixelprint.world/wp-content/uploads/2025/04/iPhone-16-Pro-couleurs.jpg",
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            featured: true,
          };
          
          allLotteries.push(iPhoneLottery);
          console.log("Admin: Added iPhone lottery");
        }
        
        // Sync lotteries to storage
        syncLotteriesToStorage(allLotteries);
        setLotteries(allLotteries);
        
        // Récupérer les produits
        const fetchedProducts = await fetchProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          // Load from localStorage if API fails
          try {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
              const parsedProducts = JSON.parse(storedProducts);
              if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
                setProducts(parsedProducts);
              }
            }
          } catch (err) {
            console.error("Admin: Error loading products from localStorage:", err);
          }
        }
      } catch (error) {
        console.error("Admin: Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Listen for lottery updates
    const handleLotteryUpdate = () => {
      loadData();
    };
    
    window.addEventListener('lotteriesUpdated', handleLotteryUpdate);
    
    return () => {
      window.removeEventListener('lotteriesUpdated', handleLotteryUpdate);
    };
  }, []);
  
  const {
    isCreating,
    selectedLotteryId,
    form,
    handleCreateLottery,
    handleEditLottery,
    handleDeleteLottery,
    onSubmit,
    handleCancel,
    toggleProduct,
    selectAllProducts,
    deselectAllProducts,
    handleDrawWinner,
    checkLotteriesReadyForDraw,
    handleToggleFeatured
  } = useLotteryForm(lotteries, setLotteries, products);

  // Vérifier périodiquement si des loteries sont prêtes pour le tirage
  useEffect(() => {
    const readyLotteries = checkLotteriesReadyForDraw();
    if (readyLotteries.length > 0) {
      toast.info(`${readyLotteries.length} loterie(s) prête(s) pour le tirage !`, {
        description: "Certaines loteries ont atteint leur objectif ou leur date limite."
      });
    }

    // Vérifier toutes les minutes
    const interval = setInterval(() => {
      const readyLotteries = checkLotteriesReadyForDraw();
      if (readyLotteries.length > 0) {
        toast.info(`${readyLotteries.length} loterie(s) prête(s) pour le tirage !`, {
          description: "Certaines loteries ont atteint leur objectif ou leur date limite."
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lotteries, checkLotteriesReadyForDraw]);
  
  const lotteriesReadyForDraw = checkLotteriesReadyForDraw();

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
      <StarBackground />
      <AdminNavigationHandler />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          {lotteriesReadyForDraw.length > 0 && (
            <Alert className="mb-6 bg-green-500/20 border border-green-500/40">
              <Gift className="h-5 w-5 text-green-500" />
              <AlertTitle>Loteries prêtes pour le tirage au sort</AlertTitle>
              <AlertDescription>
                {lotteriesReadyForDraw.length} loterie(s) {lotteriesReadyForDraw.length > 1 ? 'sont prêtes' : 'est prête'} pour le tirage au sort ! 
                Cliquez sur le bouton "Tirer au sort" pour désigner un gagnant.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lottery List */}
            <div className="w-full lg:w-1/3">
              <LotteryList
                lotteries={lotteries}
                selectedLotteryId={selectedLotteryId}
                onCreateLottery={handleCreateLottery}
                onEditLottery={handleEditLottery}
                onDeleteLottery={handleDeleteLottery}
                onDrawWinner={handleDrawWinner}
                onToggleFeatured={handleToggleFeatured}
              />
            </div>
            
            {/* Lottery Form */}
            <div className="w-full lg:w-2/3">
              <div className="winshirt-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isCreating ? "Créer une nouvelle loterie" : selectedLotteryId ? "Modifier la loterie" : "Sélectionnez ou créez une loterie"}
                </h2>
                
                <LotteryForm
                  isCreating={isCreating}
                  selectedLotteryId={selectedLotteryId}
                  form={form}
                  lotteryStatuses={lotteryStatuses}
                  products={products}
                  onSubmit={onSubmit}
                  onCancel={handleCancel}
                  onCreateClick={handleCreateLottery}
                  toggleProduct={toggleProduct}
                  selectAllProducts={selectAllProducts}
                  deselectAllProducts={deselectAllProducts}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminLotteriesPage;
