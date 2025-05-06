import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useLotteryForm } from '@/hooks/useLotteryForm';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gift, Database, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchLotteries } from '@/api/lotteryApi';
import { fetchProducts } from '@/api/productApi';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AdminLotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const lotteryStatuses = ['active', 'completed', 'relaunched', 'cancelled'];
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Fonction pour vérifier la connexion à Supabase
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      // D'abord vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Pas de session d'authentification active");
        // Tentative de connexion automatique
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'alan@shakass.com',
            password: 'admin123'
          });
          
          if (error) {
            console.error("Erreur lors de la connexion automatique:", error);
            setIsSupabaseConnected(false);
            return false;
          }
          
          console.log("Connecté automatiquement:", data?.user?.email);
        } catch (loginError) {
          console.error("Exception lors de la connexion automatique:", loginError);
        }
      } else {
        console.log("Session active détectée:", session.user.email);
      }
      
      // Maintenant tester la connexion à la base
      const { data, error } = await supabase.from('lotteries').select('id').limit(1);
      const connected = !error;
      setIsSupabaseConnected(connected);
      
      // Si connecté mais erreur, vérifier le type d'erreur
      if (!connected && error) {
        console.log("Erreur de connexion spécifique:", error.code, error.message);
        if (error.code === '42501' || error.message.includes('policy')) {
          toast.warning("Erreur de politique RLS: Vous n'avez peut-être pas les droits admin nécessaires");
        }
      }
      
      return connected;
    } catch (error) {
      console.error("Erreur de connexion Supabase:", error);
      setIsSupabaseConnected(false);
      return false;
    }
  };

  // Fonction pour vérifier si les tables de loteries existent
  const ensureLotteryTablesExist = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('lotteries').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error("Échec de la validation des tables de loterie:", error);
      return false;
    }
  };

  // Fonction pour afficher les informations de débogage
  const showDebugInfo = () => {
    try {
      const localStorage1 = localStorage.getItem('lotteries');
      const sessionStorage1 = sessionStorage.getItem('lotteries');
      
      const debugText = `
        Local Storage: ${localStorage1 ? JSON.parse(localStorage1).length + ' loteries' : 'vide'}
        Session Storage: ${sessionStorage1 ? JSON.parse(sessionStorage1).length + ' loteries' : 'vide'}
        État React: ${lotteries.length} loteries chargées
        Statut Supabase: ${isSupabaseConnected ? 'Connecté' : 'Non connecté'}
      `;
      
      setDebugInfo(debugText);
      
      // Log loteries pour debug
      if (localStorage1) {
        const parsedLotteries = JSON.parse(localStorage1);
        console.log("Loteries dans localStorage:", parsedLotteries);
      }
    } catch (error) {
      setDebugInfo(`Erreur lors de la récupération des infos: ${error}`);
    }
  };

  // Chargement des données avec le test d'authentification
  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Vérifier la connexion à Supabase et l'authentification
      const connected = await testSupabaseConnection();
      
      // Si non connecté, essayer une fois de plus après une courte pause
      if (!connected) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testSupabaseConnection();
      }
      
      // S'assurer que les tables existent
      await ensureLotteryTablesExist();
      
      // Forcer le rafraîchissement des données pour s'assurer qu'elles sont à jour
      const apiLotteries = await fetchLotteries();
      
      if (apiLotteries && apiLotteries.length > 0) {
        console.log("Admin: Loaded lotteries:", apiLotteries.length);
        toast.success(`${apiLotteries.length} loterie(s) chargée(s)`, { position: "bottom-right" });
        setLotteries(apiLotteries);
      } else {
        console.log("Admin: No lotteries found, initializing empty array");
        toast.info("Aucune loterie trouvée", { position: "bottom-right" });
        setLotteries([]);
      }
      
      // Charger les produits
      try {
        const fetchedProducts = await fetchProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          console.log("Admin: No products found, initializing empty array");
          setProducts([]);
        }
      } catch (err) {
        console.error("Admin: Error loading products:", err);
        setLoadError("Erreur lors du chargement des produits. Veuillez actualiser la page.");
      }
    } catch (error) {
      console.error("Admin: Erreur lors du chargement des données:", error);
      setLoadError("Erreur lors du chargement des loteries. Veuillez actualiser la page.");
      setLotteries([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Exécuter la fonction de chargement des données au chargement initial
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
    isSubmitting,
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
        description: "Certaines loteries ont atteint leur objectif ou leur date limite.",
        position: "bottom-right"
      });
    }

    // Vérifier toutes les 5 minutes au lieu de chaque minute pour réduire la charge
    const interval = setInterval(() => {
      const readyLotteries = checkLotteriesReadyForDraw();
      if (readyLotteries.length > 0) {
        toast.info(`${readyLotteries.length} loterie(s) prête(s) pour le tirage !`, {
          description: "Certaines loteries ont atteint leur objectif ou leur date limite.",
          position: "bottom-right"
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
        <AdminNavigation />
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
          {!isSupabaseConnected && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Mode hors-ligne actif</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                La connexion à Supabase n'est pas établie. Les modifications seront sauvegardées uniquement localement.
                <div className="flex gap-2 mt-2">
                  <Button 
                    onClick={() => testSupabaseConnection()} 
                    variant="outline" 
                    className="self-start"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> 
                    Tester la connexion
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {loadError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                {loadError}
                <Button 
                  onClick={loadData} 
                  variant="outline" 
                  className="self-start"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> 
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {debugInfo && (
            <Alert className="mb-6 bg-blue-500/10 border border-blue-500/30">
              <AlertTitle className="flex items-center">
                <span>Informations de débogage</span>
                <Button 
                  onClick={() => setDebugInfo(null)} 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-5 p-0"
                >
                  x
                </Button>
              </AlertTitle>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
              </AlertDescription>
            </Alert>
          )}

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

          <div className="mb-4 flex justify-between">
            <Button 
              onClick={showDebugInfo}
              variant="outline"
              className="text-winshirt-purple border-winshirt-purple/40"
              size="sm"
            >
              <span className="h-4 w-4 mr-2">🐞</span>
              Afficher infos de débogage
            </Button>

            <Button 
              onClick={loadData}
              variant="outline"
              className="text-winshirt-blue border-winshirt-blue/40"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> 
              Actualiser les données
            </Button>
          </div>

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
                  isSubmitting={isSubmitting}
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
