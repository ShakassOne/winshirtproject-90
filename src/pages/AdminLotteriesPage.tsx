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
import AdminNavigation from '@/components/admin/AdminNavigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Chargement des données depuis toutes les sources, optimisé
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Forcer le rafraîchissement des données pour s'assurer qu'elles sont à jour
        const apiLotteries = await fetchLotteries(true);
        
        if (apiLotteries && apiLotteries.length > 0) {
          console.log("Admin: Loaded from API:", apiLotteries.length);
          
          // S'assurer que les loteries spéciales sont incluses
          const allLotteries = [...apiLotteries];
          specialLotteries.forEach(specialLottery => {
            if (!allLotteries.some(l => l.id === specialLottery.id)) {
              allLotteries.push(specialLottery);
            }
          });
          
          // Vérifier si la loterie iPhone existe
          const iPhoneLotteryExists = allLotteries.some(
            lottery => lottery.title.toLowerCase().includes('iphone')
          );
          
          if (!iPhoneLotteryExists) {
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
          }
          
          setLotteries(allLotteries);
        } else {
          setLotteries([...specialLotteries]);
        }
        
        // Charger les produits
        try {
          const fetchedProducts = await fetchProducts();
          if (fetchedProducts && fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          }
        } catch (err) {
          console.error("Admin: Error loading products:", err);
        }
      } catch (error) {
        console.error("Admin: Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
        
        // Fallback aux données spéciales en cas d'erreur
        setLotteries([...specialLotteries]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:lotteries')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lotteries' }, 
        () => {
          console.log("Admin: Lottery data changed, reloading...");
          loadData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
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

  // Vérifier périodiquement si des loteries sont prêtes pour le tirage,
  // avec optimisation pour éviter trop de vérifications
  useEffect(() => {
    const readyLotteries = checkLotteriesReadyForDraw();
    if (readyLotteries.length > 0) {
      toast.info(`${readyLotteries.length} loterie(s) prête(s) pour le tirage !`, {
        description: "Certaines loteries ont atteint leur objectif ou leur date limite."
      });
    }

    // Vérifier toutes les 5 minutes au lieu de chaque minute pour réduire la charge
    const interval = setInterval(() => {
      const readyLotteries = checkLotteriesReadyForDraw();
      if (readyLotteries.length > 0) {
        toast.info(`${readyLotteries.length} loterie(s) prête(s) pour le tirage !`, {
          description: "Certaines loteries ont atteint leur objectif ou leur date limite."
        });
      }
    }, 300000); // 5 minutes

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
      <AdminNavigation />
      
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

          <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
            {/* Lottery List - Default 40% width, can be resized */}
            <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
              <LotteryList
                lotteries={lotteries}
                selectedLotteryId={selectedLotteryId}
                onCreateLottery={handleCreateLottery}
                onEditLottery={handleEditLottery}
                onDeleteLottery={handleDeleteLottery}
                onDrawWinner={handleDrawWinner}
                onToggleFeatured={handleToggleFeatured}
              />
            </ResizablePanel>
            
            {/* Resizable handle */}
            <ResizableHandle withHandle />
            
            {/* Lottery Form - Default 60% width, can be resized */}
            <ResizablePanel defaultSize={60} minSize={30} maxSize={70}>
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
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </section>
    </>
  );
};

export default AdminLotteriesPage;
