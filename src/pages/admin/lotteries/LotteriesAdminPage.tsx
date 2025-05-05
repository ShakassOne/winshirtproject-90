import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/lib/toast';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExtendedLottery, Participant } from '@/types/lottery';
import LotteryList from '@/components/admin/lotteries/LotteryList';
import LotteryForm from '@/components/admin/lotteries/LotteryForm';
import { useLotteries, createLottery, updateLottery, deleteLottery, drawLotteryWinner } from '@/services/lotteryService';
import { useProducts } from '@/services/productService';
import { ExtendedProduct } from '@/types/product';

const LotteriesAdminPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [filteredLotteries, setFilteredLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the hooks
  const { lotteries: lotteriesData, loading: lotteriesLoading, error: lotteriesError, refreshLotteries } = useLotteries();
  const { products } = useProducts();
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      image: '',
      endDate: '',
      ticketPrice: 5,
      totalParticipants: 100,
      status: 'active',
      value: 0,
      linkedProducts: [],
      featured: false
    }
  });
  
  useEffect(() => {
    if (lotteriesData) {
      setLotteries(lotteriesData);
      setFilteredLotteries(lotteriesData);
      setLoading(false);
    }
  }, [lotteriesData]);
  
  useEffect(() => {
    if (lotteriesError) {
      setError(lotteriesError.message);
      setLoading(false);
    }
  }, [lotteriesError]);
  
  const fetchLotteries = async () => {
    setLoading(true);
    try {
      // Use the useLotteries hook data instead of calling getLotteries
      // The lotteries data will already be available from the useLotteries hook
      setLotteries(lotteries || []);
      setFilteredLotteries(lotteries || []);
    } catch (error) {
      console.error('Error fetching lotteries:', error);
      setError('Failed to load lotteries');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateLottery = () => {
    setIsCreating(true);
    setSelectedLotteryId(null);
    form.reset({
      title: '',
      description: '',
      image: '',
      endDate: '',
      ticketPrice: 5,
      totalParticipants: 100,
      status: 'active',
      value: 0,
      linkedProducts: [],
      featured: false
    });
  };
  
  const handleEditLottery = (lotteryId: number) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (lottery) {
      setIsCreating(false);
      setSelectedLotteryId(lotteryId);
      
      // Convert the lottery data to form values
      form.reset({
        title: lottery.title,
        description: lottery.description,
        image: lottery.image,
        endDate: lottery.endDate ? new Date(lottery.endDate).toISOString().split('T')[0] : '',
        ticketPrice: lottery.ticketPrice || 5,
        totalParticipants: lottery.totalParticipants || 100,
        status: lottery.status || 'active',
        value: lottery.value || 0,
        linkedProducts: lottery.linkedProducts?.map(id => String(id)) || [],
        featured: lottery.featured || false
      });
    }
  };
  
  const onDeleteLottery = async (lotteryId: number) => {
    if (window.confirm('Are you sure you want to delete this lottery?')) {
      try {
        await deleteLottery(lotteryId);
        // Refresh lotteries after deletion
        // Instead of calling getLotteries, we'll set the state directly
        const updatedLotteries = lotteries.filter(lottery => lottery.id !== lotteryId);
        setLotteries(updatedLotteries);
        setFilteredLotteries(updatedLotteries);
        
        setIsCreating(false);
        setSelectedLotteryId(null);
        form.reset();
        toast.success('Lottery deleted successfully!');
      } catch (error) {
        console.error('Error deleting lottery:', error);
        toast.error('Failed to delete lottery');
      }
    }
  };
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Convert string IDs to numbers for linkedProducts
      const formattedData = {
        ...data,
        linkedProducts: data.linkedProducts?.map((id: string) => Number(id)) || []
      };
      
      if (isCreating) {
        await createLottery(formattedData);
        toast.success('Lottery created successfully!');
      } else if (selectedLotteryId) {
        await updateLottery(selectedLotteryId, formattedData);
        toast.success('Lottery updated successfully!');
      }
      
      // Refresh lotteries after creation/update
      await refreshLotteries();
      const updatedLotteries = await refreshLotteries();
      setLotteries(updatedLotteries);
      setFilteredLotteries(updatedLotteries);
      
      // Reset form and state
      setIsCreating(false);
      setSelectedLotteryId(null);
      form.reset();
    } catch (error) {
      console.error('Error submitting lottery:', error);
      toast.error('Failed to save lottery');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onCancel = () => {
    setIsCreating(false);
    setSelectedLotteryId(null);
    form.reset();
  };
  
  const onDrawWinner = async (lotteryId: number, winner: Participant) => {
    try {
      await drawLotteryWinner(lotteryId, winner);
      toast.success(`Winner drawn: ${winner.name}!`);
      
      // Refresh lotteries after drawing winner
      await refreshLotteries();
      const updatedLotteries = await refreshLotteries();
      setLotteries(updatedLotteries);
      setFilteredLotteries(updatedLotteries);
    } catch (error) {
      console.error('Error drawing winner:', error);
      toast.error('Failed to draw winner');
    }
  };
  
  const onToggleFeatured = async (lotteryId: number, featured: boolean) => {
    try {
      const lottery = lotteries.find(l => l.id === lotteryId);
      if (lottery) {
        await updateLottery(lotteryId, { ...lottery, featured });
        toast.success(`Lottery ${featured ? 'featured' : 'unfeatured'} successfully!`);
        
        // Refresh lotteries after updating featured status
        await refreshLotteries();
        const updatedLotteries = await refreshLotteries();
        setLotteries(updatedLotteries);
        setFilteredLotteries(updatedLotteries);
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };
  
  const toggleProduct = (productId: string) => {
    const linkedProducts = form.getValues('linkedProducts') || [];
    if (linkedProducts.includes(productId)) {
      form.setValue('linkedProducts', linkedProducts.filter(id => id !== productId));
    } else {
      form.setValue('linkedProducts', [...linkedProducts, productId]);
    }
  };
  
  const selectAllProducts = () => {
    const allProductIds = products?.map(product => String(product.id)) || [];
    form.setValue('linkedProducts', allProductIds);
  };
  
  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    filterLotteries(term, statusFilter);
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    
    filterLotteries(searchTerm, status);
  };
  
  const filterLotteries = (term: string, status: string) => {
    let filtered = lotteries;
    
    // Apply search term filter
    if (term) {
      filtered = filtered.filter(lottery => 
        lottery.title.toLowerCase().includes(term) || 
        lottery.description.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(lottery => lottery.status === status);
    }
    
    setFilteredLotteries(filtered);
  };
  
  const lotteryStatuses = ['active', 'completed', 'cancelled', 'relaunched'];
  
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Gestion des loteries
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              {loading ? (
                <Card className="p-6">
                  <div className="text-center py-8">Chargement des loteries...</div>
                </Card>
              ) : error ? (
                <Card className="p-6">
                  <div className="text-center py-8 text-red-500">Erreur: {error}</div>
                </Card>
              ) : (
                <LotteryList 
                  lotteries={filteredLotteries}
                  selectedLotteryId={selectedLotteryId}
                  onCreateLottery={handleCreateLottery}
                  onEditLottery={handleEditLottery}
                  onDeleteLottery={onDeleteLottery}
                  onDrawWinner={onDrawWinner}
                  onToggleFeatured={onToggleFeatured}
                />
              )}
            </div>
            
            <div className="col-span-1">
              <Card className="p-6">
                <LotteryForm 
                  isCreating={isCreating}
                  selectedLotteryId={selectedLotteryId}
                  form={form}
                  lotteryStatuses={lotteryStatuses}
                  products={products || []}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  onCreateClick={handleCreateLottery}
                  toggleProduct={toggleProduct}
                  selectAllProducts={selectAllProducts}
                  deselectAllProducts={deselectAllProducts}
                  isSubmitting={isSubmitting}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LotteriesAdminPage;
