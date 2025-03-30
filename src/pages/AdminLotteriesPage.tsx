import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Award, Plus, Trash } from 'lucide-react';
import StarBackground from '@/components/StarBackground';
import { mockLotteries, mockProducts } from '@/data/mockData';
import { toast } from '@/lib/toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Extend the mock lottery type with the fields we need
interface ExtendedLottery {
  id: number;
  title: string;
  description: string;
  value: number;
  targetParticipants: number;
  currentParticipants: number;
  status: string;
  image: string;
  linkedProducts?: number[];
  participants?: any[];
  winner?: any;
  drawDate?: any;
}

const AdminLotteriesPage: React.FC = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>(mockLotteries as ExtendedLottery[]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [searchProductTerm, setSearchProductTerm] = useState('');
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      value: '',
      targetParticipants: '',
      status: 'active',
      linkedProducts: [] as string[],
      image: ''
    }
  });
  
  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      value: '',
      targetParticipants: '',
      status: 'active',
      linkedProducts: [],
      image: ''
    });
  };
  
  const handleCreateLottery = () => {
    setIsCreating(true);
    setSelectedLotteryId(null);
    resetForm();
  };
  
  const handleEditLottery = (lotteryId: number) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery) return;
    
    setIsCreating(false);
    setSelectedLotteryId(lotteryId);
    
    form.reset({
      title: lottery.title,
      description: lottery.description,
      value: lottery.value.toString(),
      targetParticipants: lottery.targetParticipants.toString(),
      status: lottery.status,
      linkedProducts: lottery.linkedProducts?.map(id => id.toString()) || [],
      image: lottery.image
    });
  };
  
  const handleDeleteLottery = (lotteryId: number) => {
    setLotteries(prevLotteries => prevLotteries.filter(l => l.id !== lotteryId));
    toast.success("Loterie supprimée avec succès");
    
    if (selectedLotteryId === lotteryId) {
      setSelectedLotteryId(null);
      resetForm();
    }
  };
  
  const onSubmit = (data: any) => {
    const newLottery: ExtendedLottery = {
      id: isCreating ? Math.max(...lotteries.map(l => l.id)) + 1 : selectedLotteryId!,
      title: data.title,
      description: data.description,
      value: parseFloat(data.value),
      targetParticipants: parseInt(data.targetParticipants),
      currentParticipants: isCreating ? 0 : lotteries.find(l => l.id === selectedLotteryId)?.currentParticipants || 0,
      status: data.status,
      linkedProducts: data.linkedProducts.map(Number),
      image: data.image || 'https://placehold.co/600x400/png',
      participants: isCreating ? [] : lotteries.find(l => l.id === selectedLotteryId)?.participants || [],
      winner: null,
      drawDate: null
    };
    
    if (isCreating) {
      setLotteries(prev => [...prev, newLottery]);
      toast.success("Loterie créée avec succès");
    } else {
      setLotteries(prev => prev.map(l => l.id === selectedLotteryId ? newLottery : l));
      toast.success("Loterie mise à jour avec succès");
    }
    
    resetForm();
    setIsCreating(false);
    setSelectedLotteryId(null);
  };
  
  const lotteryStatuses = ['active', 'completed', 'relaunched', 'cancelled'];
  
  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setSelectedLotteryId(null);
    setSearchProductTerm('');
  };
  
  const toggleProduct = (productId: string) => {
    const currentProducts = form.getValues('linkedProducts');
    if (currentProducts.includes(productId)) {
      form.setValue('linkedProducts', currentProducts.filter(id => id !== productId));
    } else {
      form.setValue('linkedProducts', [...currentProducts, productId]);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'completed':
        return 'text-blue-400';
      case 'relaunched':
        return 'text-purple-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Filter products based on search term
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchProductTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchProductTerm.toLowerCase())
  );
  
  // Function to select all products
  const selectAllProducts = () => {
    const allProductIds = mockProducts.map(product => product.id.toString());
    form.setValue('linkedProducts', allProductIds);
  };
  
  // Function to deselect all products
  const deselectAllProducts = () => {
    form.setValue('linkedProducts', []);
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lottery List */}
            <div className="w-full lg:w-1/3">
              <div className="winshirt-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Loteries</h2>
                  <Button 
                    onClick={handleCreateLottery}
                    className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
                  >
                    <Plus size={16} className="mr-1" /> Nouvelle
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {lotteries.map(lottery => (
                    <div 
                      key={lottery.id}
                      className={`p-4 rounded-lg transition-colors flex items-center justify-between ${selectedLotteryId === lottery.id ? 'bg-winshirt-blue/20' : 'bg-winshirt-space-light hover:bg-winshirt-space-light/70'}`}
                    >
                      <div 
                        className="flex items-center cursor-pointer flex-grow"
                        onClick={() => handleEditLottery(lottery.id)}
                      >
                        <Award className="mr-3 text-winshirt-blue-light" />
                        <div>
                          <h3 className="font-medium text-white">{lottery.title}</h3>
                          <div className="flex items-center text-sm">
                            <span className={`${getStatusColor(lottery.status)}`}>
                              {lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-gray-400">{lottery.value.toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLottery(lottery.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  ))}
                  
                  {lotteries.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Aucune loterie disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lottery Form */}
            <div className="w-full lg:w-2/3">
              <div className="winshirt-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isCreating ? "Créer une nouvelle loterie" : selectedLotteryId ? "Modifier la loterie" : "Sélectionnez ou créez une loterie"}
                </h2>
                
                {(isCreating || selectedLotteryId) ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Titre de la loterie</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Montre Rolex Submariner" 
                                  {...field}
                                  className="bg-winshirt-space-light border-winshirt-purple/30"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Valeur du lot (€)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="5000" 
                                  {...field}
                                  className="bg-winshirt-space-light border-winshirt-purple/30"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Description détaillée de la loterie et du lot à gagner..." 
                                {...field}
                                className="bg-winshirt-space-light border-winshirt-purple/30 min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">URL de l'image</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/image.jpg" 
                                  {...field}
                                  className="bg-winshirt-space-light border-winshirt-purple/30"
                                />
                              </FormControl>
                              <FormDescription className="text-gray-400">
                                Entrez l'URL de l'image du lot
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="targetParticipants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Seuil de participants</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="100" 
                                  {...field}
                                  className="bg-winshirt-space-light border-winshirt-purple/30"
                                />
                              </FormControl>
                              <FormDescription className="text-gray-400">
                                Nombre minimum de participations requis
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Statut de la loterie</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                                {lotteryStatuses.map(status => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Linked Products */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <FormLabel className="text-white">Produits associés</FormLabel>
                          <div className="space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={selectAllProducts}
                              className="border-winshirt-blue/30 text-winshirt-blue-light hover:bg-winshirt-blue/20"
                            >
                              Tout sélectionner
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={deselectAllProducts}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Tout désélectionner
                            </Button>
                          </div>
                        </div>
                        
                        {/* Product search */}
                        <div className="mb-4">
                          <Input
                            placeholder="Rechercher des produits..."
                            value={searchProductTerm}
                            onChange={(e) => setSearchProductTerm(e.target.value)}
                            className="bg-winshirt-space-light border-winshirt-purple/30"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
                          {filteredProducts.map(product => {
                            const isSelected = form.getValues('linkedProducts').includes(product.id.toString());
                            return (
                              <div 
                                key={product.id}
                                className={`p-3 rounded-lg cursor-pointer flex items-center ${isSelected ? 'bg-winshirt-blue/30' : 'bg-winshirt-space-light'}`}
                                onClick={() => toggleProduct(product.id.toString())}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="mr-3"
                                />
                                <div className="flex items-center flex-grow">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                  <div>
                                    <h4 className="font-medium text-white">{product.name}</h4>
                                    <p className="text-sm text-gray-400">
                                      {product.type && <span className="mr-2">{product.type}</span>}
                                      <span>Prix: {product.price.toFixed(2)} €</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {filteredProducts.length === 0 && (
                            <p className="text-gray-400 text-center py-4">Aucun produit ne correspond à votre recherche</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel}
                          className="border-winshirt-purple/30 text-white"
                        >
                          Annuler
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
                        >
                          {isCreating ? "Créer la loterie" : "Mettre à jour"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center py-12">
                    <Award size={48} className="mx-auto text-winshirt-blue-light mb-4" />
                    <h3 className="text-xl text-gray-300 mb-2">Aucune loterie sélectionnée</h3>
                    <p className="text-gray-400 mb-6">Sélectionnez une loterie à modifier ou créez-en une nouvelle</p>
                    <Button 
                      onClick={handleCreateLottery}
                      className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
                    >
                      <Plus size={16} className="mr-1" /> Créer une loterie
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminLotteriesPage;
