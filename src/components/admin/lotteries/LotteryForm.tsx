
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus } from 'lucide-react';
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
import { ExtendedLottery } from '@/types/lottery';
import { Product } from '@/components/ProductCard';
import ProductSelection from './ProductSelection';

interface LotteryFormProps {
  isCreating: boolean;
  selectedLotteryId: number | null;
  form: UseFormReturn<any>;
  lotteryStatuses: string[];
  products: Product[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onCreateClick: () => void;
  toggleProduct: (productId: string) => void;
  selectAllProducts: () => void;
  deselectAllProducts: () => void;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  isCreating,
  selectedLotteryId,
  form,
  lotteryStatuses,
  products,
  onSubmit,
  onCancel,
  onCreateClick,
  toggleProduct,
  selectAllProducts,
  deselectAllProducts
}) => {
  const selectedProducts = form.watch('linkedProducts') || [];

  if (!isCreating && !selectedLotteryId) {
    return (
      <div className="text-center py-12">
        <Award size={48} className="mx-auto text-winshirt-blue-light mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">Aucune loterie sélectionnée</h3>
        <p className="text-gray-400 mb-6">Sélectionnez une loterie à modifier ou créez-en une nouvelle</p>
        <Button 
          onClick={onCreateClick}
          className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
        >
          <Plus size={16} className="mr-1" /> Créer une loterie
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
        <ProductSelection 
          products={products}
          selectedProducts={selectedProducts}
          onToggleProduct={toggleProduct}
          onSelectAll={selectAllProducts}
          onDeselectAll={deselectAllProducts}
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
            className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
          >
            {isCreating ? "Créer la loterie" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LotteryForm;
