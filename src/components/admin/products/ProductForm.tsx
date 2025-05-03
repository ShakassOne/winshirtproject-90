import React, { useState, useCallback } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { isLightColor } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrintAreaVisualizer from "./PrintAreaVisualizer";
import AdvancedFiltersForm from "./AdvancedFiltersForm";
import { UseFormReturn } from "react-hook-form";
import { VisualCategory } from '@/types/visual';
import { ExtendedLottery } from '@/types/lottery';
import { PrintArea } from '@/types/product';

export interface ProductFormProps {
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
  selectAllLotteries?: () => void;
  deselectAllLotteries?: () => void;
  addPrintArea?: (position: 'front' | 'back') => void;
  updatePrintArea?: (id: number, updatedData: Partial<PrintArea>) => void;
  removePrintArea?: (id: number) => void;
  hideTabList?: boolean; // Nouvelle prop pour cacher les onglets internes
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
  toggleLottery,
  selectAllLotteries = () => {},
  deselectAllLotteries = () => {},
  addPrintArea = () => {},
  updatePrintArea = () => {},
  removePrintArea = () => {},
  hideTabList = false
}) => {
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [colorPickerValue, setColorPickerValue] = useState('#000000');
  const [selectedPrintAreaId, setSelectedPrintAreaId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const handleAddSize = useCallback(() => {
    if (newSize.trim() !== '') {
      addSize(newSize.trim());
      setNewSize('');
    }
  }, [newSize, addSize]);

  const handleAddColor = useCallback(() => {
    if (newColor.trim() !== '') {
      addColor(newColor.trim());
      setNewColor('');
      setColorPickerValue('#000000');
    }
  }, [newColor, addColor]);

  const handlePrintAreaSelect = (id: number) => {
    setSelectedPrintAreaId(id);
  };

  // Fonction pour modifier la position d'une zone d'impression
  const handleUpdatePrintAreaPosition = (id: number, x: number, y: number) => {
    if (updatePrintArea) {
      const currentArea = form.getValues().printAreas?.find((area: any) => area.id === id);
      if (currentArea) {
        updatePrintArea(id, {
          bounds: {
            ...currentArea.bounds,
            x,
            y
          }
        });
      }
    }
  };

  const renderBasicInfoContent = () => (
    <div className="space-y-6">
      {/* Basic info fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom du produit */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom du produit"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prix */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type de produit */}
        <FormField
          control={form.control}
          name="productType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de produit</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="T-shirt">T-shirt</SelectItem>
                  <SelectItem value="Sweatshirt">Sweatshirt</SelectItem>
                  <SelectItem value="Polo">Polo</SelectItem>
                  <SelectItem value="Casquette">Casquette</SelectItem>
                  <SelectItem value="Accessoire">Accessoire</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Personnalisation */}
        <FormField
          control={form.control}
          name="allowCustomization"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-winshirt-purple"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Autoriser la personnalisation</FormLabel>
                <FormDescription>
                  Permet aux clients de personnaliser ce produit avec des visuels
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Description du produit"
                className="bg-winshirt-space-light border-winshirt-purple/30 min-h-32"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Images du produit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image principale */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image principale</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL de l'image"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Entrez l'URL de l'image principale du produit
              </FormDescription>

              {field.value && (
                <div className="mt-2 border rounded-md p-2">
                  <img
                    src={field.value}
                    alt="Aperçu de l'image principale"
                    className="w-full h-40 object-contain"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Image secondaire */}
        <FormField
          control={form.control}
          name="secondaryImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image secondaire (verso)</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL de l'image secondaire"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Entrez l'URL de l'image secondaire (verso du produit)
              </FormDescription>

              {field.value && (
                <div className="mt-2 border rounded-md p-2">
                  <img
                    src={field.value}
                    alt="Aperçu de l'image secondaire"
                    className="w-full h-40 object-contain"
                  />
                </div>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* Détails supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nombre de tickets */}
        <FormField
          control={form.control}
          name="tickets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tickets de loterie</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value?.toString()}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Nombre de tickets" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="1">1 ticket</SelectItem>
                  <SelectItem value="2">2 tickets</SelectItem>
                  <SelectItem value="3">3 tickets</SelectItem>
                  <SelectItem value="4">4 tickets</SelectItem>
                  <SelectItem value="5">5 tickets</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-gray-400">
                Nombre de tickets de loterie offerts avec ce produit
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Poids */}
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poids (g)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Prix de livraison */}
        <FormField
          control={form.control}
          name="deliveryPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix de livraison (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderOptionsContent = () => (
    <div className="space-y-6">
      {/* Tailles */}
      <div>
        <h3 className="text-lg font-medium mb-2">Tailles disponibles</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.getValues().sizes?.map((size: string) => (
            <Badge
              key={size}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 bg-winshirt-space-light"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="ml-1 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Nouvelle taille"
            className="bg-winshirt-space-light border-winshirt-purple/30"
          />
          <Button
            type="button"
            onClick={handleAddSize}
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            disabled={!newSize.trim()}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {/* Couleurs */}
      <div>
        <h3 className="text-lg font-medium mb-2">Couleurs disponibles</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.getValues().colors?.map((color: string) => (
            <Badge
              key={color}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5"
              style={{
                backgroundColor: color,
                color: isLightColor(color) ? 'black' : 'white',
              }}
            >
              {color}
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="ml-1 hover:opacity-80"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Nouvelle couleur (#hex ou nom)"
              className="bg-winshirt-space-light border-winshirt-purple/30"
            />
          </div>
          <div>
            <Input
              type="color"
              value={colorPickerValue}
              onChange={(e) => {
                setColorPickerValue(e.target.value);
                setNewColor(e.target.value);
              }}
              className="w-12 h-12 p-1 cursor-pointer"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddColor}
            className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
            disabled={!newColor.trim()}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {/* Catégorie de visuels */}
      <div>
        <FormField
          control={form.control}
          name="visualCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie de visuels</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                value={field.value === null ? "null" : field.value?.toString()}
                disabled={!form.getValues().allowCustomization}
              >
                <FormControl>
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="null">Aucune</SelectItem>
                  {visualCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-gray-400">
                {form.getValues().allowCustomization
                  ? "Catégorie de visuels proposée par défaut pour ce produit"
                  : "Activez la personnalisation pour choisir une catégorie"}
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Si hideTabList est true, afficher directement les champs sans les onglets
  if (hideTabList) {
    return (
      <div className="space-y-6">
        {renderBasicInfoContent()}
      </div>
    );
  }

  // Sinon, afficher les onglets
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-8">
        <TabsTrigger value="basic">Infos de base</TabsTrigger>
        <TabsTrigger value="options">Options</TabsTrigger>
        <TabsTrigger value="loteries">Loteries</TabsTrigger>
        <TabsTrigger value="printAreas">Zones d'impression</TabsTrigger>
        <TabsTrigger value="filters">Filtres avancés</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6">
        {renderBasicInfoContent()}
      </TabsContent>
      
      <TabsContent value="options" className="space-y-6">
        {renderOptionsContent()}
      </TabsContent>
      
      <TabsContent value="loteries" className="space-y-6">
        
      </TabsContent>
      
      <TabsContent value="printAreas" className="space-y-6">
        
      </TabsContent>
      
      <TabsContent value="filters" className="space-y-6">
        
      </TabsContent>
    </Tabs>
  );
};

export default ProductForm;
