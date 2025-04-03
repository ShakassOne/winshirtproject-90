
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Ticket, Image, Upload, Truck, Weight } from 'lucide-react';
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
import { uploadImage } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { VisualCategory } from '@/types/visual';

interface ProductFormProps {
  isCreating: boolean;
  selectedProductId: number | null;
  form: UseFormReturn<any>;
  activeLotteries: ExtendedLottery[];
  visualCategories: VisualCategory[];
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
  visualCategories,
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
  const watchedAllowCustomization = form.watch('allowCustomization');
  
  // Ajout des refs pour les inputs de type file
  const primaryImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);
  
  // Fonction pour télécharger l'image vers Supabase
  const handleImageUpload = async (inputRef: React.RefObject<HTMLInputElement>, fieldName: string) => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      // Afficher un toast de chargement
      toast.loading(`Upload de l'image en cours...`);
      
      try {
        // Télécharger l'image vers Supabase Storage
        const imageUrl = await uploadImage(file);
        
        if (imageUrl) {
          // Mettre à jour le formulaire avec l'URL de l'image
          form.setValue(fieldName, imageUrl);
          form.trigger(fieldName);
          toast.success(`Image téléchargée avec succès`);
        } else {
          toast.error(`Erreur lors du téléchargement de l'image`);
        }
      } catch (error) {
        console.error("Erreur d'upload:", error);
        toast.error(`Erreur lors du téléchargement: ${error}`);
      }
    }
  };
  
  // Fonctions pour gérer la sélection des loteries
  const handleSelectAllLotteries = () => {
    const allLotteryIds = activeLotteries.map(lottery => lottery.id.toString());
    form.setValue('linkedLotteries', allLotteryIds);
  };
  
  const handleDeselectAllLotteries = () => {
    form.setValue('linkedLotteries', []);
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
        {/* Basic product info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name field */}
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
          
          {/* Price field */}
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
        
        {/* Description field */}
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
        
        {/* Allow Customization */}
        <FormField
          control={form.control}
          name="allowCustomization"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border border-winshirt-purple/20 rounded-md">
              <div className="space-y-0.5">
                <FormLabel className="text-white text-lg">Personnalisation</FormLabel>
                <FormDescription className="text-gray-400">
                  Autoriser les clients à personnaliser ce produit avec des visuels
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-winshirt-purple"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Image fields */}
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
              {field.value && (
                <div className="mt-2">
                  <img 
                    src={field.value} 
                    alt="Aperçu" 
                    className="h-24 object-contain rounded border border-winshirt-purple/30" 
                  />
                </div>
              )}
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
              {field.value && (
                <div className="mt-2">
                  <img 
                    src={field.value} 
                    alt="Aperçu" 
                    className="h-24 object-contain rounded border border-winshirt-purple/30" 
                  />
                </div>
              )}
              <FormDescription className="text-gray-400 text-base">
                URL de l'image secondaire du produit (optionnelle)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Product type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-lg">Type de produit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 h-12">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space-light border-winshirt-purple/30">
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-lg">Catégorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 h-12">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space-light border-winshirt-purple/30">
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30 h-12">
                      <SelectValue placeholder="Type de manches" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-winshirt-space-light border-winshirt-purple/30">
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
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg">Tailles disponibles</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableSizes.map(size => (
                  <Button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (watchedSizes.includes(size)) {
                        removeSize(size);
                      } else {
                        addSize(size);
                      }
                    }}
                    variant={watchedSizes.includes(size) ? "default" : "outline"}
                    className={
                      watchedSizes.includes(size)
                        ? "bg-winshirt-blue hover:bg-winshirt-blue-dark"
                        : "border-winshirt-blue-light/30 text-white"
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Colors */}
        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg">Couleurs disponibles</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableColors.map(color => (
                  <Button
                    key={color}
                    type="button"
                    onClick={() => {
                      if (watchedColors.includes(color)) {
                        removeColor(color);
                      } else {
                        addColor(color);
                      }
                    }}
                    variant={watchedColors.includes(color) ? "default" : "outline"}
                    className={
                      watchedColors.includes(color)
                        ? "bg-winshirt-purple hover:bg-winshirt-purple-dark"
                        : "border-winshirt-purple-light/30 text-white"
                    }
                  >
                    {color}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tickets */}
        <FormField
          control={form.control}
          name="tickets"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-lg">Tickets de loterie</FormLabel>
              <FormDescription className="text-gray-400 text-base">
                Nombre de tickets de loterie offerts à l'achat de ce produit
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {ticketOptions.map(number => (
                  <Button
                    key={number}
                    type="button"
                    onClick={() => {
                      // Convertir explicitement en nombre
                      const numValue = Number(number);
                      form.setValue('tickets', numValue);
                    }}
                    variant={watchedTickets === number ? "default" : "outline"}
                    className={
                      watchedTickets === number
                        ? "bg-winshirt-blue hover:bg-winshirt-blue-dark flex items-center gap-2"
                        : "border-winshirt-blue-light/30 text-white flex items-center gap-2"
                    }
                  >
                    <Ticket size={16} />
                    {number}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Linked Lotteries */}
        <FormField
          control={form.control}
          name="linkedLotteries"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-white text-lg">Loteries associées</FormLabel>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllLotteries}
                    className="border-winshirt-blue/30 text-winshirt-blue-light hover:bg-winshirt-blue/20"
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllLotteries}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
                {activeLotteries.map(lottery => (
                  <div 
                    key={lottery.id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center ${
                      watchedLotteries.includes(lottery.id.toString()) 
                        ? 'bg-winshirt-blue/30' 
                        : 'bg-winshirt-space-light'
                    }`}
                    onClick={() => toggleLottery(lottery.id.toString())}
                  >
                    <div className="mr-3 flex items-center justify-center w-5 h-5">
                      {watchedLotteries.includes(lottery.id.toString()) ? (
                        <div className="w-4 h-4 bg-winshirt-blue-light rounded-full" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center flex-grow truncate">
                      <div className="truncate">
                        <h4 className="font-medium text-white truncate">{lottery.title}</h4>
                        <p className="text-sm text-gray-400 truncate">
                          Valeur: {lottery.value.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Stock & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-lg flex items-center gap-2">
                  <Package size={18} /> Stock disponible
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="100" 
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
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-lg flex items-center gap-2">
                  <Weight size={18} /> Poids (g)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    step="1"
                    placeholder="250" 
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
            name="shippingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-lg flex items-center gap-2">
                  <Truck size={18} /> Délai d'expédition (jours)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    step="1"
                    placeholder="3" 
                    {...field}
                    className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit and Cancel buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-winshirt-purple/50 text-white hover:bg-winshirt-purple/20"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark px-8"
          >
            {isCreating ? "Créer" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
