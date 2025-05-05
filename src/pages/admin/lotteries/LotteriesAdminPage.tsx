
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminSetup from '@/components/AdminSetup';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useForm } from 'react-hook-form';
import { createLottery, updateLottery, deleteLottery, getLotteries, drawLotteryWinner } from '@/services/lotteryService';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { toast } from '@/lib/toast';

const LotteriesAdminPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const lotteryStatuses = ["active", "completed", "relaunched", "cancelled"];
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      value: 0,
      targetParticipants: 10,
      status: "active",
      image: "",
      linkedProducts: [] as string[],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      featured: false
    }
  });
  
  // Load lotteries and products
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load lotteries
        const lotteriesData = await getLotteries(false);
        setLotteries(lotteriesData);
        
        // Load products
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          console.log("Admin: No products found, initializing empty array");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
        toast.error("Erreur lors du chargement des données");
      }
    };
    
    loadData();
  }, []);
  
  // Reset form when selectedLotteryId changes
  useEffect(() => {
    if (selectedLotteryId) {
      const lottery = lotteries.find(l => l.id === selectedLotteryId);
      if (lottery) {
        // Format the date to YYYY-MM-DD for the date input
        const endDateFormatted = lottery.endDate ? 
          new Date(lottery.endDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
          
        // Convert linked products to strings for the form
        const linkedProducts = lottery.linkedProducts ? 
          lottery.linkedProducts.map(p => p.toString()) : 
          [];
        
        form.reset({
          title: lottery.title,
          description: lottery.description || "",
          value: lottery.value,
          targetParticipants: lottery.targetParticipants,
          status: lottery.status,
          image: lottery.image || "",
          linkedProducts,
          endDate: endDateFormatted,
          featured: lottery.featured || false
        });
      }
    } else if (isCreating) {
      form.reset({
        title: "",
        description: "",
        value: 0,
        targetParticipants: 10,
        status: "active",
        image: "",
        linkedProducts: [] as string[],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        featured: false
      });
    }
  }, [selectedLotteryId, isCreating, form, lotteries]);
  
  const handleCreateLottery = () => {
    setSelectedLotteryId(null);
    setIsCreating(true);
  };
  
  const handleEditLottery = (lotteryId: number) => {
    setSelectedLotteryId(lotteryId);
    setIsCreating(false);
  };
  
  const handleDeleteLottery = async (lotteryId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette loterie ?")) {
      try {
        const success = await deleteLottery(lotteryId);
        if (success) {
          // Refresh lotteries
          const lotteriesData = await getLotteries(false);
          setLotteries(lotteriesData);
          
          if (selectedLotteryId === lotteryId) {
            setSelectedLotteryId(null);
          }
          
          toast.success("Loterie supprimée avec succès");
        }
      } catch (error) {
        console.error("Error deleting lottery:", error);
        toast.error("Erreur lors de la suppression de la loterie");
      }
    }
  };
  
  const handleCancel = () => {
    setSelectedLotteryId(null);
    setIsCreating(false);
    form.reset();
  };
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Submitting lottery form:", data);
    
    try {
      // Convert linkedProducts back to numbers
      const linkedProducts = data.linkedProducts
        ? data.linkedProducts.map((id: string) => parseInt(id))
        : [];
      
      const lotteryData = {
        title: data.title,
        description: data.description,
        value: Number(data.value),
        targetParticipants: Number(data.targetParticipants),
        status: data.status,
        image: data.image,
        linkedProducts,
        endDate: data.endDate,
        featured: data.featured || false
      };
      
      if (isCreating) {
        // Create new lottery
        await createLottery(lotteryData);
      } else if (selectedLotteryId) {
        // Update existing lottery
        await updateLottery(selectedLotteryId, lotteryData);
      }
      
      // Refresh lotteries
      const lotteriesData = await getLotteries(false);
      setLotteries(lotteriesData);
      
      // Reset form
      handleCancel();
    } catch (error) {
      console.error("Error submitting lottery:", error);
      toast.error("Erreur lors de l'enregistrement de la loterie");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDrawWinner = async (lotteryId: number, winner: Participant) => {
    try {
      await drawLotteryWinner(lotteryId);
      
      // Refresh lotteries
      const lotteriesData = await getLotteries(false);
      setLotteries(lotteriesData);
      
      toast.success("Gagnant tiré avec succès");
    } catch (error) {
      console.error("Error drawing winner:", error);
      toast.error("Erreur lors du tirage du gagnant");
    }
  };
  
  const handleToggleFeatured = async (lotteryId: number, featured: boolean) => {
    try {
      await updateLottery(lotteryId, { featured });
      
      // Refresh lotteries
      const lotteriesData = await getLotteries(false);
      setLotteries(lotteriesData);
      
      toast.success(featured 
        ? "Loterie mise en vedette" 
        : "Loterie retirée des vedettes");
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };
  
  const toggleProduct = (productId: string) => {
    const currentProducts = form.getValues('linkedProducts') || [];
    if (currentProducts.includes(productId)) {
      form.setValue('linkedProducts', 
        currentProducts.filter((id: string) => id !== productId));
    } else {
      form.setValue('linkedProducts', [...currentProducts, productId]);
    }
  };
  
  const selectAllProducts = () => {
    const allProductIds = products.map(p => p.id.toString());
    form.setValue('linkedProducts', allProductIds);
  };
  
  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
  };
  
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion des Loteries
          </h1>
          
          <AdminSetup />
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
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
            
            <div>
              <LotteryForm
                isCreating={isCreating}
                selectedLotteryId={selectedLotteryId}
                form={form}
                lotteryStatuses={lotteryStatuses}
                products={products}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onCreateClick={handleCreateLottery}
                toggleProduct={toggleProduct}
                selectAllProducts={selectAllProducts}
                deselectAllProducts={deselectAllProducts}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LotteriesAdminPage;
