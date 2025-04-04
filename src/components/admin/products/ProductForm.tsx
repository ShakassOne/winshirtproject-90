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

interface LotterySelectionProps {
  lotteries: any[];
  selectedLotteries: string[];
  onToggleLottery: (lotteryId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

interface PrintAreaManagerProps {
  printAreas: any[];
  selectedAreaId: number | null;
  onSelectArea: (id: number) => void;
  onAddArea: (printArea: any) => void;
  onUpdateArea: (id: number, updatedData: any) => void;
  onRemoveArea: (id: number) => void;
}

// Import components
import LotterySelection from './LotterySelection';
import PrintAreaManager from './PrintAreaManager';

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
  addPrintArea?: (printArea: Omit<PrintArea, 'id'>) => void;
  updatePrintArea?: (id: number, updatedData: Partial<PrintArea>) => void;
  removePrintArea?: (id: number) => void;
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
  removePrintArea = () => {}
}) => {
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [colorPickerValue, setColorPickerValue] = useState('#000000');
  const [selectedPrintAreaId, setSelectedPrintAreaId] = useState<number | null>(null);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Onglets pour organiser les différentes sections du formulaire */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="basic">Infos de base</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="loteries">Loteries</TabsTrigger>
            <TabsTrigger value="printAreas">Zones d'impression</TabsTrigger>
            <TabsTrigger value="filters">Filtres avancés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
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

              {/* Personnalisation - Déplacé depuis l'onglet Options */}
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
                    <FormDescription className="text-gray-400">
                      Poids du produit en grammes
                    </FormDescription>
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
                    <FormDescription className="text-gray-400">
                      Frais de livraison spécifiques pour ce produit
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-6">
            {/* Tailles disponibles */}
            <div>
              <FormLabel>Tailles disponibles</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch('sizes')?.map((size: string) => (
                  <Badge
                    key={size}
                    className="bg-winshirt-purple flex items-center gap-1"
                  >
                    {size}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSize(size)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Nouvelle taille"
                  className="bg-winshirt-space-light border-winshirt-purple/30 w-32"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleAddSize}
                  variant="outline"
                  className="border-winshirt-purple hover:bg-winshirt-purple/10"
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Couleurs disponibles */}
            <div>
              <FormLabel>Couleurs disponibles</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch('colors')?.map((color: string) => (
                  <Badge
                    key={color}
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: color.toLowerCase(),
                      color: isLightColor(color) ? 'black' : 'white'
                    }}
                  >
                    {color}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeColor(color)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    className="h-9 w-10 p-1 bg-winshirt-space-light border-winshirt-purple/30"
                    value={colorPickerValue}
                    onChange={(e) => setColorPickerValue(e.target.value)}
                  />
                  <Input
                    placeholder="Nom de la couleur"
                    className="bg-winshirt-space-light border-winshirt-purple/30 w-32"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddColor}
                  variant="outline"
                  className="border-winshirt-purple hover:bg-winshirt-purple/10"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="loteries" className="space-y-6">
            <LotterySelection
              lotteries={activeLotteries}
              selectedLotteries={form.watch('linkedLotteries') || []}
              onToggleLottery={toggleLottery}
              onSelectAll={selectAllLotteries}
              onDeselectAll={deselectAllLotteries}
            />
          </TabsContent>
          
          <TabsContent value="printAreas" className="space-y-6">
            {/* Visualisation des zones d'impression */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <PrintAreaVisualizer
                  productImage={form.watch('image') || 'https://placehold.co/600x400/png'}
                  productSecondaryImage={form.watch('secondaryImage')}
                  printAreas={form.watch('printAreas') || []}
                  selectedAreaId={selectedPrintAreaId}
                  onSelectPrintArea={handlePrintAreaSelect}
                  onUpdateAreaPosition={handleUpdatePrintAreaPosition}
                />
              </div>
              
              <div>
                <PrintAreaManager
                  printAreas={form.watch('printAreas') || []}
                  onAddArea={addPrintArea}
                  onUpdateArea={updatePrintArea}
                  onRemoveArea={removePrintArea}
                  selectedAreaId={selectedPrintAreaId}
                  onSelectArea={handlePrintAreaSelect}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-6">
            {/* Ajout du type de manches ici */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormField
                control={form.control}
                name="sleeveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de manches</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                          <SelectValue placeholder="Type de manches" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                        <SelectItem value="Courtes">Courtes</SelectItem>
                        <SelectItem value="Longues">Longues</SelectItem>
                        <SelectItem value="Sans manches">Sans manches</SelectItem>
                        <SelectItem value="N/A">Non applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <AdvancedFiltersForm form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/10"
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
