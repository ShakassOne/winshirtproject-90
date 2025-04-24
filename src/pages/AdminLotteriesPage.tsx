
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useLotteryForm } from '@/hooks/useLotteryForm';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gift, Database, Loader2 } from 'lucide-react';
import { fetchLotteries, clearAllLotteryData } from '@/api/lotteryApi';
import { fetchProducts } from '@/api/productApi';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { supabase } from '@/integrations/supabase/client';

const AdminLotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const lotteryStatuses = ['active', 'completed', 'relaunched', 'cancelled'];
  const [isLoading, setIsLoading] = useState(true);
  
  // Chargement des données depuis Supabase uniquement
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Effacer toutes les données existantes au chargement
      await clearAllLotteryData();
      
      // Forcer le rafraîchissement des données pour s'assurer qu'elles sont à jour
      const apiLotteries = await fetchLotteries(true);
      
      if (apiLotteries && apiLotteries.length > 0) {
        console.log("Admin: Loaded from Supabase:", apiLotteries.length);
        setLotteries(apiLotteries);
      } else {
        setLotteries([]);
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
      setLotteries([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Exécuter la fonction de suppression des données au chargement initial
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
          <div className="flex items-center gap-2 text-xl text-white">
            <Loader2 className="h-6 w-6 animate-spin text-winshirt-blue" />
            Chargement des loteries...
          </div>
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
