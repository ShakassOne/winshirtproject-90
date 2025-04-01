
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus } from 'lucide-react';
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface ProductFormProps {
  isCreating: boolean;
  selectedProductId: number | null;
  form: UseFormReturn<any>;
  activeLotteries: ExtendedLottery[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  onCreateProduct: () => void;
  addSize: (size: string) => void;
  removeSize: (size: string) => void;
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  toggleLottery: (lotteryId: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isCreating,
  selectedProductId,
  form,
  activeLotteries,
  onCancel,
  onSubmit,
  onCreateProduct,
  addSize,
  removeSize,
  addColor,
  removeColor,
  toggleLottery
}) => {
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const availableColors = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Gris', 'Jaune'];
  const productTypes = ['entrée de gamme', 'standard', 'premium'];
  const productCategories = ['T-shirt', 'Sweatshirt', 'Polo', 'Autre'];
  const sleeveTypes = ['Courtes', 'Longues'];

  // Use form watch to update the component when sizes change
  const watchedSizes = form.watch('sizes') || [];
  const watchedColors = form.watch('colors') || [];
  const watchedLotteries = form.watch('linkedLotteries') || [];

  if (!isCreating && !selectedProductId) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-winshirt-purple-light mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">Aucun produit sélectionné</h3>
        <p className="text-gray-400 mb-6">Sélectionnez un produit à modifier ou créez-en un nouveau</p>
        <Button 
          onClick={onCreateProduct}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
        >
          <Plus size={16} className="mr-1" /> Créer un produit
        </Button>
      </div>
    );
  }

  return (
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Gamme de produit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                      <SelectValue placeholder="Sélectionner une gamme" />
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
          
          <FormField
            control={form.control}
            name="productType"
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
                    {productCategories.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sleeveType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Type de manches</FormLabel>
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
                    {sleeveTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Sizes */}
        <FormField
          control={form.control}
          name="sizes"
          render={() => (
            <FormItem>
              <FormLabel className="text-white">Tailles disponibles</FormLabel>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                {availableSizes.map(size => {
                  const isSelected = watchedSizes.includes(size);
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Colors */}
        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel className="text-white">Couleurs disponibles</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {availableColors.map(color => {
                  const isSelected = watchedColors.includes(color);
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Linked Lotteries */}
        <FormField
          control={form.control}
          name="linkedLotteries"
          render={() => (
            <FormItem>
              <FormLabel className="text-white">Loteries associées</FormLabel>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {activeLotteries.map(lottery => {
                  const isSelected = watchedLotteries.includes(lottery.id.toString());
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
                
                {activeLotteries.length === 0 && (
                  <p className="text-gray-400">Aucune loterie active disponible</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
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
  );
};

export default ProductForm;
