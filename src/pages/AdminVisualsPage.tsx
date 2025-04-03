
import React, { useState, useEffect } from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockVisualCategories, mockVisuals } from '@/data/mockVisuals';
import { Visual, VisualCategory } from '@/types/visual';
import { toast } from '@/lib/toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash, FolderPlus, Edit, ImagePlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminVisualsPage = () => {
  // States
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [visualDialogOpen, setVisualDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'category' | 'visual' } | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<Partial<VisualCategory>>({
    name: '',
    description: '',
    slug: ''
  });
  
  const [visualForm, setVisualForm] = useState<Partial<Visual>>({
    name: '',
    description: '',
    image: '',
    categoryId: null
  });
  
  // Load data
  useEffect(() => {
    // Try to load from localStorage first
    const savedCategories = localStorage.getItem('visualCategories');
    const savedVisuals = localStorage.getItem('visuals');
    
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories(parsedCategories);
      } catch (error) {
        console.error("Error parsing visual categories:", error);
        setCategories(mockVisualCategories);
      }
    } else {
      setCategories(mockVisualCategories);
    }
    
    if (savedVisuals) {
      try {
        const parsedVisuals = JSON.parse(savedVisuals);
        setVisuals(parsedVisuals);
      } catch (error) {
        console.error("Error parsing visuals:", error);
        setVisuals(mockVisuals);
      }
    } else {
      setVisuals(mockVisuals);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('visualCategories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('visuals', JSON.stringify(visuals));
  }, [visuals]);
  
  // Category handlers
  const openAddCategoryDialog = () => {
    setCategoryForm({
      name: '',
      description: '',
      slug: ''
    });
    setCategoryDialogOpen(true);
  };
  
  const openEditCategoryDialog = (category: VisualCategory) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.slug
    });
    setCategoryDialogOpen(true);
  };
  
  const saveCategory = () => {
    if (!categoryForm.name) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }
    
    // Generate slug if not provided
    if (!categoryForm.slug) {
      categoryForm.slug = categoryForm.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
    }
    
    if (categoryForm.id) {
      // Edit existing category
      setCategories(prev => prev.map(cat => 
        cat.id === categoryForm.id 
          ? { ...cat, ...categoryForm } as VisualCategory
          : cat
      ));
      toast.success("Catégorie mise à jour avec succès");
    } else {
      // Add new category
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      const newCategory: VisualCategory = {
        id: newId,
        name: categoryForm.name,
        description: categoryForm.description,
        slug: categoryForm.slug,
        createdAt: new Date().toISOString()
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success("Catégorie ajoutée avec succès");
    }
    
    setCategoryDialogOpen(false);
  };
  
  // Visual handlers
  const openAddVisualDialog = (categoryId?: number) => {
    setVisualForm({
      name: '',
      description: '',
      image: '',
      categoryId: categoryId || null
    });
    setVisualDialogOpen(true);
  };
  
  const openEditVisualDialog = (visual: Visual) => {
    setVisualForm({
      id: visual.id,
      name: visual.name,
      description: visual.description || '',
      image: visual.image,
      categoryId: visual.categoryId
    });
    setVisualDialogOpen(true);
  };
  
  const saveVisual = () => {
    if (!visualForm.name) {
      toast.error("Le nom du visuel est requis");
      return;
    }
    
    if (!visualForm.image) {
      toast.error("L'image du visuel est requise");
      return;
    }
    
    if (!visualForm.categoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    
    // Find category name
    const categoryName = categories.find(c => c.id === visualForm.categoryId)?.name || '';
    
    if (visualForm.id) {
      // Edit existing visual
      setVisuals(prev => prev.map(vis => 
        vis.id === visualForm.id 
          ? { 
              ...vis, 
              ...visualForm, 
              categoryName
            } as Visual
          : vis
      ));
      toast.success("Visuel mis à jour avec succès");
    } else {
      // Add new visual
      const newId = Math.max(...visuals.map(v => v.id), 0) + 1;
      const newVisual: Visual = {
        id: newId,
        name: visualForm.name,
        description: visualForm.description,
        image: visualForm.image,
        categoryId: visualForm.categoryId as number,
        categoryName,
        createdAt: new Date().toISOString()
      };
      setVisuals(prev => [...prev, newVisual]);
      toast.success("Visuel ajouté avec succès");
    }
    
    setVisualDialogOpen(false);
  };
  
  // Delete handlers
  const confirmDelete = (id: number, type: 'category' | 'visual') => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'category') {
      // Check if category has visuals
      const hasVisuals = visuals.some(v => v.categoryId === itemToDelete.id);
      if (hasVisuals) {
        toast.error("Impossible de supprimer cette catégorie car elle contient des visuels");
        setDeleteConfirmOpen(false);
        return;
      }
      
      setCategories(prev => prev.filter(cat => cat.id !== itemToDelete.id));
      toast.success("Catégorie supprimée avec succès");
    } else {
      setVisuals(prev => prev.filter(vis => vis.id !== itemToDelete.id));
      toast.success("Visuel supprimé avec succès");
    }
    
    setDeleteConfirmOpen(false);
  };
  
  const getVisualsForCategory = (categoryId: number) => {
    return visuals.filter(v => v.categoryId === categoryId);
  };

  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Gestion des Visuels</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="visuals">Visuels</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Category Card */}
                <Card className="bg-winshirt-space/40 border-winshirt-purple/30 hover:shadow-lg hover:shadow-winshirt-purple/10 transition-shadow cursor-pointer" onClick={openAddCategoryDialog}>
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <FolderPlus size={48} className="text-winshirt-purple mb-4" />
                    <h3 className="text-xl text-white font-medium">Ajouter une catégorie</h3>
                  </CardContent>
                </Card>
                
                {/* Category Cards */}
                {categories.map(category => (
                  <Card key={category.id} className="bg-winshirt-space/40 border-winshirt-purple/30 hover:shadow-lg hover:shadow-winshirt-purple/10 transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white">{category.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-winshirt-blue-light" onClick={() => openEditCategoryDialog(category)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => confirmDelete(category.id, 'category')}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">
                        {getVisualsForCategory(category.id).length} visuels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {category.description && <p className="text-sm text-gray-300">{category.description}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="ghost" className="text-winshirt-blue-light" onClick={() => {
                        setSelectedCategoryId(category.id);
                        setActiveTab('visuals');
                      }}>
                        Voir les visuels
                      </Button>
                      <Button variant="outline" className="text-winshirt-purple border-winshirt-purple" onClick={() => openAddVisualDialog(category.id)}>
                        <Plus size={16} className="mr-2" /> Ajouter un visuel
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="visuals" className="mt-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl text-white">
                  {selectedCategoryId
                    ? `Visuels de ${categories.find(c => c.id === selectedCategoryId)?.name}`
                    : "Tous les visuels"}
                </h2>
                <div className="flex gap-3">
                  {selectedCategoryId ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-winshirt-blue-light border-winshirt-blue-light"
                        onClick={() => setSelectedCategoryId(null)}
                      >
                        Voir tous les visuels
                      </Button>
                      <Button 
                        className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                        onClick={() => openAddVisualDialog(selectedCategoryId)}
                      >
                        <Plus size={16} className="mr-2" /> Ajouter un visuel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                      onClick={() => openAddVisualDialog()}
                    >
                      <Plus size={16} className="mr-2" /> Ajouter un visuel
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Visual Card (only show if a category is selected) */}
                {selectedCategoryId && (
                  <Card className="bg-winshirt-space/40 border-winshirt-purple/30 hover:shadow-lg hover:shadow-winshirt-purple/10 transition-shadow cursor-pointer" onClick={() => openAddVisualDialog(selectedCategoryId)}>
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                      <ImagePlus size={48} className="text-winshirt-purple mb-4" />
                      <h3 className="text-xl text-white font-medium">Ajouter un visuel</h3>
                    </CardContent>
                  </Card>
                )}
                
                {/* Visual Cards */}
                {visuals
                  .filter(visual => selectedCategoryId ? visual.categoryId === selectedCategoryId : true)
                  .map(visual => (
                    <Card key={visual.id} className="bg-winshirt-space/40 border-winshirt-purple/30 hover:shadow-lg hover:shadow-winshirt-purple/10 transition-shadow">
                      <img 
                        src={visual.image} 
                        alt={visual.name} 
                        className="w-full h-48 object-contain p-4 bg-gray-800"
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white">{visual.name}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-winshirt-blue-light" onClick={() => openEditVisualDialog(visual)}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => confirmDelete(visual.id, 'visual')}>
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-winshirt-blue-light">
                          {categories.find(c => c.id === visual.categoryId)?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {visual.description && <p className="text-sm text-gray-300">{visual.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {categoryForm.id ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
            <DialogDescription>
              Les catégories permettent d'organiser les visuels par thème.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom</Label>
              <Input 
                id="category-name" 
                value={categoryForm.name} 
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (optionnel)</Label>
              <Textarea 
                id="category-description" 
                value={categoryForm.description || ''} 
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug (pour URL)</Label>
              <Input 
                id="category-slug" 
                value={categoryForm.slug} 
                onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                placeholder="generé-automatiquement"
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
              <p className="text-xs text-gray-400">Laissez vide pour générer automatiquement</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="border-winshirt-purple/30 text-gray-300" onClick={() => setCategoryDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark" onClick={saveCategory}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Visual Dialog */}
      <Dialog open={visualDialogOpen} onOpenChange={setVisualDialogOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {visualForm.id ? "Modifier le visuel" : "Ajouter un visuel"}
            </DialogTitle>
            <DialogDescription>
              Les visuels peuvent être appliqués aux produits par les clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="visual-name">Nom</Label>
              <Input 
                id="visual-name" 
                value={visualForm.name} 
                onChange={(e) => setVisualForm({...visualForm, name: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visual-category">Catégorie</Label>
              <Select 
                value={visualForm.categoryId?.toString()} 
                onValueChange={(value) => setVisualForm({...visualForm, categoryId: parseInt(value)})}
              >
                <SelectTrigger id="visual-category" className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visual-image">URL de l'image</Label>
              <Input 
                id="visual-image" 
                value={visualForm.image} 
                onChange={(e) => setVisualForm({...visualForm, image: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
              {visualForm.image && (
                <div className="mt-2 p-2 border border-winshirt-purple/20 rounded">
                  <p className="text-xs mb-1 text-gray-400">Aperçu :</p>
                  <img src={visualForm.image} alt="Aperçu" className="h-32 object-contain" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visual-description">Description (optionnel)</Label>
              <Textarea 
                id="visual-description" 
                value={visualForm.description || ''} 
                onChange={(e) => setVisualForm({...visualForm, description: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="border-winshirt-purple/30 text-gray-300" onClick={() => setVisualDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-winshirt-purple hover:bg-winshirt-purple-dark" onClick={saveVisual}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmation de suppression</DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === 'category' 
                ? "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
                : "Êtes-vous sûr de vouloir supprimer ce visuel ? Cette action est irréversible."}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" className="border-winshirt-purple/30 text-gray-300" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AdminNavigation />
    </>
  );
};

export default AdminVisualsPage;
