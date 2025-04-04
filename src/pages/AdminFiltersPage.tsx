
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit, Trash2, Save, Download, Upload } from "lucide-react";
import { toast } from '@/lib/toast';
import { ProductFilters } from '@/types/product';
import { isLightColor } from '@/lib/utils';

interface FilterType {
  name: string;
  key: keyof ProductFilters;
}

const filterTypes: FilterType[] = [
  { name: "Types de produit", key: "productTypes" },
  { name: "Types de manches", key: "sleeveTypes" },
  { name: "Genres", key: "genders" },
  { name: "Matières", key: "materials" },
  { name: "Coupes", key: "fits" },
  { name: "Marques", key: "brands" },
  { name: "Tailles", key: "sizes" },
  { name: "Couleurs", key: "colors" }
];

const AdminFiltersPage: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    productTypes: [],
    sleeveTypes: [],
    genders: [],
    materials: [],
    fits: [],
    brands: [],
    sizes: [],
    colors: []
  });
  
  const [activeTab, setActiveTab] = useState<keyof ProductFilters>("productTypes");
  const [newValue, setNewValue] = useState("");
  const [colorPickerValue, setColorPickerValue] = useState("#000000");
  
  // Chargement des filtres depuis le localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('productFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(prev => ({
          ...prev,
          ...parsedFilters
        }));
      } catch (error) {
        console.error("Erreur lors du chargement des filtres:", error);
      }
    }
  }, []);
  
  // Sauvegarde des filtres
  const saveFilters = () => {
    localStorage.setItem('productFilters', JSON.stringify(filters));
    toast.success("Les filtres ont été enregistrés avec succès");
  };
  
  // Ajout d'une nouvelle valeur
  const addValue = () => {
    if (!newValue.trim()) return;
    
    if (filters[activeTab].includes(newValue.trim())) {
      toast.error("Cette valeur existe déjà");
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newValue.trim()]
    }));
    
    setNewValue("");
    if (activeTab === "colors") {
      setColorPickerValue("#000000");
    }
    
    toast.success(`La valeur a été ajoutée aux ${getFilterTypeName(activeTab)}`);
  };
  
  // Suppression d'une valeur
  const removeValue = (value: string) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(v => v !== value)
    }));
    
    toast.success(`La valeur a été supprimée des ${getFilterTypeName(activeTab)}`);
  };
  
  // Obtenir le nom du type de filtre actif
  const getFilterTypeName = (key: keyof ProductFilters): string => {
    const filterType = filterTypes.find(ft => ft.key === key);
    return filterType ? filterType.name : key;
  };
  
  // Exportation des filtres
  const handleExportFilters = () => {
    try {
      const dataStr = JSON.stringify(filters, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `winshirt-filters-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Filtres exportés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation des filtres");
    }
  };
  
  // Importation des filtres
  const handleImportFilters = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedFilters = JSON.parse(event.target?.result as string);
          
          // Vérifier que la structure est correcte
          if (!importedFilters || typeof importedFilters !== 'object') {
            toast.error("Format de fichier invalide");
            return;
          }
          
          // Fusionner avec les filtres existants
          setFilters(prev => ({
            ...prev,
            ...importedFilters
          }));
          
          toast.success("Filtres importés avec succès");
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          toast.error("Erreur lors de l'importation des filtres");
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Gestion des Filtres Produits</h1>
            <div className="flex gap-3">
              <Button 
                onClick={saveFilters}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                <Save size={16} className="mr-2" /> Enregistrer
              </Button>
              <Button 
                onClick={handleExportFilters}
                className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
              >
                <Download size={16} className="mr-2" /> Exporter
              </Button>
              <Button 
                onClick={handleImportFilters}
                variant="outline"
                className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
              >
                <Upload size={16} className="mr-2" /> Importer
              </Button>
            </div>
          </div>
          
          <Card className="winshirt-card">
            <CardHeader>
              <CardTitle>Attributs produits</CardTitle>
              <CardDescription>
                Gérez les attributs qui seront disponibles dans les formulaires produits et les filtres côté client.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={value => setActiveTab(value as keyof ProductFilters)}>
                <TabsList className="grid grid-cols-4 mb-6">
                  {filterTypes.map((type, index) => (
                    <TabsTrigger key={index} value={type.key}>
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {filterTypes.map((type, index) => (
                  <TabsContent key={index} value={type.key} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{type.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-6 min-h-12">
                        {filters[type.key].map((value) => (
                          <Badge
                            key={value}
                            variant="outline"
                            className={`flex items-center gap-1 px-3 py-1.5 ${type.key !== 'colors' ? 'bg-winshirt-space-light' : ''}`}
                            style={type.key === 'colors' ? {
                              backgroundColor: value,
                              color: isLightColor(value) ? 'black' : 'white',
                            } : {}}
                          >
                            {value}
                            <button
                              type="button"
                              onClick={() => removeValue(value)}
                              className="ml-1 text-gray-400 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                        
                        {filters[type.key].length === 0 && (
                          <p className="text-gray-400 text-sm">Aucune valeur définie</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        {type.key === 'colors' ? (
                          <>
                            <div className="flex-1">
                              <Input
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
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
                                  setNewValue(e.target.value);
                                }}
                                className="w-12 h-12 p-1 cursor-pointer"
                              />
                            </div>
                          </>
                        ) : (
                          <Input
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder={`Nouvelle valeur pour ${type.name}`}
                            className="bg-winshirt-space-light border-winshirt-purple/30 flex-1"
                          />
                        )}
                        
                        <Button
                          type="button"
                          onClick={addValue}
                          className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                          disabled={!newValue.trim()}
                        >
                          <Plus size={16} className="mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <p className="text-sm text-gray-400 mr-auto">
                Les attributs seront utilisés dans les filtres de la boutique et les formulaires de création de produits.
              </p>
              <Button 
                onClick={saveFilters}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                <Save size={16} className="mr-2" /> Enregistrer tous les filtres
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <AdminNavigation />
    </>
  );
};

export default AdminFiltersPage;
