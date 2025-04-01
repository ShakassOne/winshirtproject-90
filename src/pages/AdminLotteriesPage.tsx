
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { ExtendedLottery } from '@/types/lottery';
import { Product } from '@/components/ProductCard';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useLotteryForm } from '@/hooks/useLotteryForm';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gift } from 'lucide-react';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminLotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>(mockLotteries as ExtendedLottery[]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const lotteryStatuses = ['active', 'completed', 'relaunched', 'cancelled'];
  
  // Charger les produits depuis localStorage au montage
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
    }
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
    checkLotteriesReadyForDraw
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
  }, [lotteries]);
  
  const lotteriesReadyForDraw = checkLotteriesReadyForDraw();

  return (
    <>
      <StarBackground />
      
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

      <AdminNavigation />
    </>
  );
};

export default AdminLotteriesPage;
