
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
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    // Si on désactive la personnalisation, on réinitialise la catégorie de visuel
                    if (!checked) {
                      form.setValue("visualCategoryId", null);
                    } else {
                      // Si on active la personnalisation et qu'il y a des catégories, on sélectionne la première
                      if (visualCategories.length > 0) {
                        form.setValue("visualCategoryId", visualCategories[0].id);
                      }
                    }
                  }}
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
                    alt="Aperçu secondaire" 
                    className="h-24 object-contain rounded border border-winshirt-purple/30" 
                  />
                </div>
              )}
              <FormDescription className="text-gray-400 text-base">
                URL d'une image secondaire ou alternative du produit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Delivery section */}
        <div className="p-4 border border-winshirt-purple/30 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck size={18} /> Informations de livraison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight field */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-lg flex items-center gap-2">
                    <Weight size={16} /> Poids (g)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 text-base">
                    Poids du produit en grammes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Delivery price field */}
            <FormField
              control={form.control}
              name="deliveryPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-lg flex items-center gap-2">
                    <Truck size={16} /> Frais de livraison (€)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="4.99" 
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      className="bg-winshirt-space-light border-winshirt-purple/30 text-lg h-12"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 text-base">
                    Frais de livraison spécifiques à ce produit (laisser vide pour tarif standard)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Product attributes */}
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
        
        {/* Tickets field */}
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
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
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
                  ? `Les clients pourront sélectionner jusqu'à ${watchedTickets} loteries sur votre sélection` 
                  : "Les clients pourront sélectionner 1 loterie sur votre sélection"}
              </FormDescription>
              
              <div className="flex justify-between mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => form.setValue("linkedLotteries", activeLotteries.map(l => l.id.toString()))}
                  className="border-winshirt-purple/30 text-winshirt-purple-light hover:bg-winshirt-purple/20"
                >
                  Tout sélectionner
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => form.setValue("linkedLotteries", [])}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Tout désélectionner
                </Button>
              </div>
              
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
        
        {/* Form actions */}
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
