
import { Visual, VisualCategory } from "@/types/visual";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/lib/toast';
import { checkSupabaseConnection } from '@/lib/supabase';

// Vérification connexion
const testVisualsConnection = async (): Promise<boolean> => {
  try {
    return await checkSupabaseConnection();
  } catch (error) {
    console.error("Test de connexion Supabase échoué:", error);
    return false;
  }
};

// Validation functions to ensure data consistency
const validateVisualData = (visual: Partial<Visual>): string | null => {
  if (!visual.name || visual.name.trim() === '') return "Le nom du visuel est requis";
  if (!visual.image || visual.image.trim() === '') return "L'image du visuel est requise";
  return null;
};

const validateCategoryData = (category: Partial<VisualCategory>): string | null => {
  if (!category.name || category.name.trim() === '') return "Le nom de la catégorie est requis";
  return null;
};

// Helpers locaux - defined once at the top of the file
const updateLocalStorage = (visual: Visual) => {
  const localData = localStorage.getItem('visuals');
  let visuals: Visual[] = localData ? JSON.parse(localData) : [];
  visuals = visuals.filter(v => v.id !== visual.id);
  visuals.push(visual);
  localStorage.setItem('visuals', JSON.stringify(visuals));
};

const removeFromLocalStorage = (id: number) => {
  const localData = localStorage.getItem('visuals');
  if (!localData) return;
  let visuals: Visual[] = JSON.parse(localData);
  visuals = visuals.filter(v => v.id !== id);
  localStorage.setItem('visuals', JSON.stringify(visuals));
};

// Récupération des visuels
export const fetchVisuals = async (): Promise<Visual[]> => {
  try {
    const isConnected = await testVisualsConnection();
    if (!isConnected) throw new Error("Mode hors ligne");

    const { data, error } = await supabase
      .from('visuals')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    // Convertir image_url en image pour compatibilité avec l'application
    const visuals = data.map(visual => ({
      id: visual.id,
      name: visual.name,
      description: visual.description || '',
      image: visual.image_url, // Map 'image_url' to 'image'
      categoryId: visual.category_id,
      categoryName: visual.category_name || '',
      createdAt: visual.created_at,
      updatedAt: visual.updated_at,
      tags: visual.tags || []
    }));

    localStorage.setItem('visuals', JSON.stringify(visuals));
    return visuals;
  } catch (error) {
    console.error("Erreur fetch visuals:", error);

    const storedVisuals = localStorage.getItem('visuals');
    if (storedVisuals) return JSON.parse(storedVisuals);
    return [];
  }
};

// Création d'un visuel
export const createVisual = async (visual: Omit<Visual, 'id'>): Promise<Visual | null> => {
  try {
    // Validate visual data before proceeding
    const validationError = validateVisualData(visual);
    if (validationError) {
      toast.error(validationError);
      return null;
    }

    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Création impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData = {
      name: visual.name,
      description: visual.description,
      image_url: visual.image, // Map 'image' to 'image_url' for Supabase
      category_id: visual.categoryId,
      category_name: visual.categoryName,
      tags: visual.tags || []
    };

    const { data, error } = await supabase
      .from('visuals')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase lors de la création:", error);
      throw error;
    }

    const newVisual: Visual = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      image: data.image_url, // Map back to 'image'
      categoryId: data.category_id,
      categoryName: data.category_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    };

    updateLocalStorage(newVisual);
    toast.success(`Visuel "${newVisual.name}" créé`);
    return newVisual;
  } catch (error) {
    console.error("Erreur création visual:", error);
    toast.error("Erreur création visuel");
    return null;
  }
};

// Mise à jour
export const updateVisual = async (id: number, visual: Partial<Visual>): Promise<Visual | null> => {
  try {
    // Validate visual data before proceeding
    const validationError = validateVisualData(visual);
    if (validationError) {
      toast.error(validationError);
      return null;
    }
    
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Mise à jour impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData: any = {};
    if (visual.name) supabaseData.name = visual.name;
    if (visual.description !== undefined) supabaseData.description = visual.description;
    if (visual.image) supabaseData.image_url = visual.image; // Convert to image_url
    if (visual.categoryId) supabaseData.category_id = visual.categoryId;
    if (visual.categoryName) supabaseData.category_name = visual.categoryName;
    if (visual.tags) supabaseData.tags = visual.tags;

    const { data, error } = await supabase
      .from('visuals')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedVisual: Visual = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      image: data.image_url, // Convert back to image
      categoryId: data.category_id,
      categoryName: data.category_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    };

    updateLocalStorage(updatedVisual);
    toast.success(`Visuel "${updatedVisual.name}" mis à jour`);
    return updatedVisual;
  } catch (error) {
    console.error("Erreur mise à jour visual:", error);
    toast.error("Erreur mise à jour visuel");
    return null;
  }
};

// Suppression
export const deleteVisual = async (id: number): Promise<boolean> => {
  try {
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Suppression impossible - Mode hors-ligne");
      return false;
    }

    const { error } = await supabase
      .from('visuals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    removeFromLocalStorage(id);
    toast.success("Visuel supprimé");
    return true;
  } catch (error) {
    console.error("Erreur suppression visual:", error);
    toast.error("Erreur suppression visuel");
    return false;
  }
};

// Synchronisation fiable avec upsert au lieu de delete + insert
export const syncVisualsToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

    const localData = localStorage.getItem('visuals');
    if (!localData) {
      toast.warning("Aucun visuel local à synchroniser");
      return false;
    }

    const visuals = JSON.parse(localData);
    if (!Array.isArray(visuals) || visuals.length === 0) {
      toast.warning("Aucun visuel trouvé");
      return false;
    }

    // Préparer les données pour Supabase (convertir de camelCase à snake_case)
    // et assurer que 'image' est envoyée comme 'image_url'
    const supabaseData = visuals.map(visual => ({
      id: visual.id,
      name: visual.name,
      description: visual.description || null,
      image_url: visual.image, // Map 'image' to 'image_url'
      category_id: visual.categoryId || null,
      category_name: visual.categoryName || null,
      created_at: visual.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log("Données préparées pour Supabase:", supabaseData);

    // Upsert (insert or update automatiquement)
    const { error } = await supabase
      .from('visuals')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Mettre à jour les enregistrements existants en cas de conflit
      });

    if (error) {
      console.error("Erreur lors de l'upsert:", error);
      toast.error(`Erreur de synchronisation: ${error.message}`);
      throw error;
    }

    toast.success(`${visuals.length} visuels synchronisés`);
    return true;
  } catch (error) {
    console.error("Erreur synchronisation:", error);
    toast.error("Erreur synchronisation visuels");
    return false;
  }
};

// Catégories
export const fetchVisualCategories = async (): Promise<VisualCategory[]> => {
  try {
    const isConnected = await testVisualsConnection();
    if (!isConnected) throw new Error("Mode hors ligne");

    const { data, error } = await supabase
      .from('visual_categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const categories = data.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      slug: cat.slug,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    }));

    localStorage.setItem('visual_categories', JSON.stringify(categories));
    return categories;
  } catch (error) {
    console.error("Erreur fetch visual categories:", error);
    const stored = localStorage.getItem('visual_categories');
    if (stored) return JSON.parse(stored);
    return [];
  }
};

// Create a visual category
export const createVisualCategory = async (category: Omit<VisualCategory, 'id'>): Promise<VisualCategory | null> => {
  try {
    // Validate category data
    const validationError = validateCategoryData(category);
    if (validationError) {
      toast.error(validationError);
      return null;
    }
    
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Création impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData = {
      name: category.name,
      description: category.description,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
    };

    const { data, error } = await supabase
      .from('visual_categories')
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw error;

    const newCategory: VisualCategory = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      slug: data.slug,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Update local storage
    const stored = localStorage.getItem('visual_categories');
    const categories = stored ? JSON.parse(stored) : [];
    localStorage.setItem('visual_categories', JSON.stringify([...categories, newCategory]));
    
    toast.success(`Catégorie "${newCategory.name}" créée`);
    return newCategory;
  } catch (error) {
    console.error("Erreur création catégorie:", error);
    toast.error("Erreur création catégorie");
    return null;
  }
};

// Update a visual category
export const updateVisualCategory = async (id: number, category: Partial<VisualCategory>): Promise<VisualCategory | null> => {
  try {
    // Validate category data if name is being updated
    if (category.name && validateCategoryData({name: category.name})) {
      toast.error(validateCategoryData({name: category.name})!);
      return null;
    }
    
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Mise à jour impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData: any = {};
    if (category.name) supabaseData.name = category.name;
    if (category.description !== undefined) supabaseData.description = category.description;
    if (category.slug) supabaseData.slug = category.slug;

    const { data, error } = await supabase
      .from('visual_categories')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedCategory: VisualCategory = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      slug: data.slug,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Update local storage
    const stored = localStorage.getItem('visual_categories');
    if (stored) {
      const categories = JSON.parse(stored);
      const updatedCategories = categories.map((cat: VisualCategory) => 
        cat.id === id ? updatedCategory : cat
      );
      localStorage.setItem('visual_categories', JSON.stringify(updatedCategories));
    }
    
    toast.success(`Catégorie "${updatedCategory.name}" mise à jour`);
    return updatedCategory;
  } catch (error) {
    console.error("Erreur mise à jour catégorie:", error);
    toast.error("Erreur mise à jour catégorie");
    return null;
  }
};
