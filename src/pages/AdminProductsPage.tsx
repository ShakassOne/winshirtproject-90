
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TShirt, Package, Plus, Trash } from 'lucide-react';
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

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState(mockProducts);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      type: 'standard',
      sizes: [] as string[],
      colors: [] as string[],
      linkedLotteries: [] as string[],
      image: ''
    }
  });
  
  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      price: '',
      type: 'standard',
      sizes: [],
      colors: [],
      linkedLotteries: [],
      image: ''
    });
  };
  
  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    resetForm();
  };
  
  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setIsCreating(false);
    setSelectedProductId(productId);
    
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type || 'standard',
      sizes: product.sizes,
      colors: product.colors,
      linkedLotteries: product.linkedLotteries?.map(id => id.toString()) || [],
      image: product.image
    });
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success("Produit supprimé avec succès");
    
    if (selectedProductId === productId) {
      setSelectedProductId(null);
      resetForm();
    }
  };
  
  const onSubmit = (data: any) => {
    const newProduct = {
      id: isCreating ? Math.max(...products.map(p => p.id)) + 1 : selectedProductId!,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      type: data.type,
      sizes: data.sizes,
      colors: data.colors,
      linkedLotteries: data.linkedLotteries.map(Number),
      image: data.image || 'https://placehold.co/600x400/png',
      popularity: Math.random() * 100 // Just for mock data
    };
    
    if (isCreating) {
      setProducts(prev => [...prev, newProduct]);
      toast.success("Produit créé avec succès");
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId ? newProduct : p));
      toast.success("Produit mis à jour avec succès");
    }
    
    resetForm();
    setIsCreating(false);
    setSelectedProductId(null);
  };
  
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const availableColors = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Gris', 'Jaune'];
  const productTypes = ['entrée de gamme', 'standard', 'premium'];
  
  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setSelectedProductId(null);
  };
  
  const addSize = (size: string) => {
    const currentSizes = form.getValues('sizes');
    if (!currentSizes.includes(size)) {
      form.setValue('sizes', [...currentSizes, size]);
    }
  };
  
  const removeSize = (size: string) => {
    const currentSizes = form.getValues('sizes');
    form.setValue('sizes', currentSizes.filter(s => s !== size));
  };
  
  const addColor = (color: string) => {
    const currentColors = form.getValues('colors');
    if (!currentColors.includes(color)) {
      form.setValue('colors', [...currentColors, color]);
    }
  };
  
  const removeColor = (color: string) => {
    const currentColors = form.getValues('colors');
    form.setValue('colors', currentColors.filter(c => c !== color));
  };
  
  const toggleLottery = (lotteryId: string) => {
    const currentLotteries = form.getValues('linkedLotteries');
    if (currentLotteries.includes(lotteryId)) {
      form.setValue('linkedLotteries', currentLotteries.filter(id => id !== lotteryId));
    } else {
      form.setValue('linkedLotteries', [...currentLotteries, lotteryId]);
    }
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product List */}
            <div className="w-full lg:w-1/3">
              <div className="winshirt-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Produits</h2>
                  <Button 
                    onClick={handleCreateProduct}
                    className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
                  >
                    <Plus size={16} className="mr-1" /> Nouveau
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {products.map(product => (
                    <div 
                      key={product.id}
                      className={`p-4 rounded-lg transition-colors flex items-center justify-between ${selectedProductId === product.id ? 'bg-winshirt-purple/20' : 'bg-winshirt-space-light hover:bg-winshirt-space-light/70'}`}
                    >
                      <div 
                        className="flex items-center cursor-pointer flex-grow"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <TShirt className="mr-3 text-winshirt-purple-light" />
                        <div>
                          <h3 className="font-medium text-white">{product.name}</h3>
                          <p className="text-sm text-gray-400">{product.price.toFixed(2)} €</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Aucun produit disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Product Form */}
            <div className="w-full lg:w-2/3">
              <div className="winshirt-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isCreating ? "Créer un nouveau produit" : selectedProductId ? "Modifier le produit" : "Sélectionnez ou créez un produit"}
                </h2>
                
                {(isCreating || selectedProductId) ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Nom du produit</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="T-shirt Space Invader" 
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
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Prix (€)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="29.99" 
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
                                placeholder="Description du produit..." 
                                {...field}
                                className="bg-winshirt-space-light border-winshirt-purple/30 min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                              Entrez l'URL de l'image du produit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Type de produit</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                                  <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                                {productTypes.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Sizes */}
                      <div>
                        <FormLabel className="text-white">Tailles disponibles</FormLabel>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                          {availableSizes.map(size => {
                            const isSelected = form.getValues('sizes').includes(size);
                            return (
                              <Button
                                key={size}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={isSelected ? "bg-winshirt-purple hover:bg-winshirt-purple-dark" : "border-winshirt-purple/30 text-white"}
                                onClick={() => isSelected ? removeSize(size) : addSize(size)}
                              >
                                {size}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Colors */}
                      <div>
                        <FormLabel className="text-white">Couleurs disponibles</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {availableColors.map(color => {
                            const isSelected = form.getValues('colors').includes(color);
                            return (
                              <Button
                                key={color}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={isSelected ? "bg-winshirt-purple hover:bg-winshirt-purple-dark" : "border-winshirt-purple/30 text-white"}
                                onClick={() => isSelected ? removeColor(color) : addColor(color)}
                              >
                                {color}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Linked Lotteries */}
                      <div>
                        <FormLabel className="text-white">Loteries associées</FormLabel>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {mockLotteries
                            .filter(lottery => lottery.status === 'active')
                            .map(lottery => {
                              const isSelected = form.getValues('linkedLotteries').includes(lottery.id.toString());
                              return (
                                <div 
                                  key={lottery.id}
                                  className={`p-3 rounded-lg cursor-pointer flex items-center ${isSelected ? 'bg-winshirt-purple/30' : 'bg-winshirt-space-light'}`}
                                  onClick={() => toggleLottery(lottery.id.toString())}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="mr-3"
                                  />
                                  <div>
                                    <h4 className="font-medium text-white">{lottery.title}</h4>
                                    <p className="text-sm text-gray-400">Valeur: {lottery.value.toFixed(2)} €</p>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {mockLotteries.filter(lottery => lottery.status === 'active').length === 0 && (
                            <p className="text-gray-400">Aucune loterie active disponible</p>
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
                          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                        >
                          {isCreating ? "Créer le produit" : "Mettre à jour"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-winshirt-purple-light mb-4" />
                    <h3 className="text-xl text-gray-300 mb-2">Aucun produit sélectionné</h3>
                    <p className="text-gray-400 mb-6">Sélectionnez un produit à modifier ou créez-en un nouveau</p>
                    <Button 
                      onClick={handleCreateProduct}
                      className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                    >
                      <Plus size={16} className="mr-1" /> Créer un produit
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

export default AdminProductsPage;
