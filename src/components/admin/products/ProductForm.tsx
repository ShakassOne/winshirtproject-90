import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Ticket, Image, Upload } from 'lucide-react';
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
import { toast } from '@/lib/toast';

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
  const ticketOptions = [1, 2, 3, 4, 5];

  // Use form watch to update the component when sizes change
  const watchedSizes = form.watch('sizes') || [];
  const watchedColors = form.watch('colors') || [];
  const watchedLotteries = form.watch('linkedLotteries') || [];
  const watchedTickets = form.watch('tickets') || 1;
  
  // Ajout des refs pour les inputs de type file
  const primaryImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);
  
  // Fonction pour simuler l'upload d'image (sera implémentée en production)
  const handleImageUpload = (inputRef: React.RefObject<HTMLInputElement>, fieldName: string) => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      // En production, nous téléchargerions le fichier sur un serveur
      // Pour l'instant, nous simulons avec un message et nous n'utilisons pas vraiment le fichier
      toast.success(`Image "${file.name}" sélectionnée`);
      
      // En production, nous obtiendrions l'URL de l'image téléchargée
      // Pour l'instant, nous utilisons une URL de placeholder
      const mockImageUrl = `https://placehold.co/600x400/png?text=${encodeURIComponent(file.name)}`;
      form.setValue(fieldName, mockImageUrl);
      form.trigger(fieldName);
    }
  };

  if (!isCreating && !selectedProductId) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-winshirt-purple-light mb-4" />
        <h3 className="text-xl text-gray-300 mb-2">Aucun produit sélectionné</h3>
        <p className="text-gray-400 mb-6">Sélectionnez un produit à modifier ou créez-en un nouveau</p>
        <Button 
          onClick={onCreateProduct}
          className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-lg px-6 py-3 h-auto"
        >
          <Plus size={20} className="mr-2" /> Créer un produit
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
                <FormLabel className="text-white text-lg">Nom du produit</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="T-shirt Space Invader" 
                    {...field}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12"
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
                <FormLabel className="text-white text-lg">Prix (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="29.99" 
                    {...field}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12"
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
              <FormLabel className="text-white text-lg">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du produit..." 
                  {...field}
                  className="bg-winshirt-space-light border-winshirt-purple/30 min-h-[100px] text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image principale avec bouton parcourir */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg flex items-center gap-2">
                <Image size={18} /> Image principale
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    {...field}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 flex-1"
                  />
                </FormControl>
                <input 
                  type="file" 
                  ref={primaryImageInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={() => handleImageUpload(primaryImageInputRef, 'image')}
                />
                <Button 
                  type="button" 
                  onClick={() => primaryImageInputRef.current?.click()}
                  className="bg-winshirt-blue"
                >
                  <Upload size={16} className="mr-2" /> Parcourir
                </Button>
              </div>
              <FormDescription className="text-gray-400 text-base">
                URL de l'image principale du produit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Nouvelle image secondaire avec bouton parcourir */}
        <FormField
          control={form.control}
          name="secondaryImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg flex items-center gap-2">
                <Image size={18} /> Image secondaire (optionnelle)
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image2.jpg" 
                    {...field}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 flex-1"
                  />
                </FormControl>
                <input 
                  type="file" 
                  ref={secondaryImageInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={() => handleImageUpload(secondaryImageInputRef, 'secondaryImage')}
                />
                <Button 
                  type="button" 
                  onClick={() => secondaryImageInputRef.current?.click()}
                  className="bg-winshirt-blue"
                >
                  <Upload size={16} className="mr-2" /> Parcourir
                </Button>
              </div>
              <FormDescription className="text-gray-400 text-base">
                URL d'une image secondaire ou alternative du produit
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
                <FormLabel className="text-white text-lg">Gamme de produit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12">
                      <SelectValue placeholder="Sélectionner une gamme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30 text-lg">
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
                <FormLabel className="text-white text-lg">Type de produit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30 text-lg">
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
                <FormLabel className="text-white text-lg">Type de manches</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30 text-lg">
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
        
        {/* Nouveau champ: nombre de tickets */}
        <FormField
          control={form.control}
          name="tickets"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg flex items-center gap-2">
                <Ticket size={18} />
                Nombre de tickets
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Si le nombre de tickets diminue, on réduit la sélection de loteries
                  const currentLotteries = form.getValues('linkedLotteries') || [];
                  if (currentLotteries.length > Number(value)) {
                    form.setValue('linkedLotteries', currentLotteries.slice(0, Number(value)));
                    form.trigger('linkedLotteries');
                  }
                }} 
                defaultValue={field.value?.toString() || "1"}
              >
                <FormControl>
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12 max-w-xs">
                    <SelectValue placeholder="Nombre de tickets" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30 text-lg">
                  {ticketOptions.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} {option === 1 ? 'ticket' : 'tickets'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-gray-400 text-base">
                Nombre de participations à des loteries offertes avec ce produit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Sizes */}
        <FormField
          control={form.control}
          name="sizes"
          render={() => (
            <FormItem>
              <FormLabel className="text-white text-lg">Tailles disponibles</FormLabel>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                {availableSizes.map(size => {
                  const isSelected = watchedSizes.includes(size);
                  return (
                    <Button
                      key={size}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`${isSelected ? "bg-winshirt-purple hover:bg-winshirt-purple-dark" : "border-winshirt-purple/30 text-white"} text-lg h-12`}
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
              <FormLabel className="text-white text-lg">Couleurs disponibles</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {availableColors.map(color => {
                  const isSelected = watchedColors.includes(color);
                  return (
                    <Button
                      key={color}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`${isSelected ? "bg-winshirt-purple hover:bg-winshirt-purple-dark" : "border-winshirt-purple/30 text-white"} text-lg h-12`}
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
              <FormLabel className="text-white text-lg">Loteries associées</FormLabel>
              <FormDescription className="text-gray-400 text-base mb-2">
                {watchedTickets > 1 
                  ? `Vous pouvez sélectionner jusqu'à ${watchedTickets} loteries différentes` 
                  : "Sélectionnez une loterie à associer"}
              </FormDescription>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {activeLotteries.map(lottery => {
                  const isSelected = watchedLotteries.includes(lottery.id.toString());
                  return (
                    <div 
                      key={lottery.id}
                      className={`p-4 rounded-lg cursor-pointer flex items-center ${isSelected ? 'bg-winshirt-purple/30' : 'bg-winshirt-space-light'}`}
                      onClick={() => toggleLottery(lottery.id.toString())}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}}
                        className="mr-4 h-5 w-5"
                      />
                      <div>
                        <h4 className="font-medium text-white text-lg">{lottery.title}</h4>
                        <p className="text-base text-gray-400">Valeur: {lottery.value.toFixed(2)} €</p>
                      </div>
                    </div>
                  );
                })}
                
                {activeLotteries.length === 0 && (
                  <p className="text-gray-400 text-lg">Aucune loterie active disponible</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-winshirt-purple/30 text-white text-lg px-6 py-3 h-auto"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-lg px-6 py-3 h-auto"
          >
            {isCreating ? "Créer le produit" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
