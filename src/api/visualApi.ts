
// Gardez le début du fichier jusqu'à validateVisualData
import { Visual, VisualCategory } from "@/types/visual";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { checkSupabaseConnection } from '@/lib/supabase';
import { validateVisuals, showValidationErrors } from '@/lib/syncValidator';

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
  if (!visual.image && !visual.imageUrl) return "L'image du visuel est requise";
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
      image: visual.image_url || visual.image, // Map 'image_url' to 'image'
      imageUrl: visual.image_url, // Store original value in imageUrl
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
    // Ensure visual has a valid image
    if (!visual.image) {
      visual.image = 'https://placehold.co/600x400?text=Image+Manquante';
    }
    
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
      imageUrl: data.image_url, // Also store in imageUrl
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
    // Ensure visual has a valid image if being updated
    if (visual.image === null || visual.image === undefined) {
      visual.image = 'https://placehold.co/600x400?text=Image+Manquante';
    }
  
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
      imageUrl: data.image_url, // Also store in imageUrl
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

    const visuals: Visual[] = JSON.parse(localData);
    if (!Array.isArray(visuals) || visuals.length === 0) {
      toast.warning("Aucun visuel trouvé");
      return false;
    }
    
    // Valider les visuels avant la synchronisation
    const validationResult = validateVisuals(visuals);
    if (!showValidationErrors(validationResult, 'Visuel')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Préparer les données pour Supabase avec image par défaut si nécessaire
    const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=Image+Manquante';
    
    const supabaseData = visuals
      .filter(visual => visual && typeof visual === 'object')  // Filtrer les entrées nulles ou non-objets
      .map(visual => {
        // Vérifier si le visuel a une image valide
        let image_url = DEFAULT_IMAGE; // Valeur par défaut
        
        if (visual.image && typeof visual.image === 'string') {
          image_url = visual.image;
        } else if (visual.imageUrl && typeof visual.imageUrl === 'string') {
          image_url = visual.imageUrl;
        }
        
        // Création d'un nouvel objet avec les propriétés nécessaires
        return {
          id: visual.id,
          name: visual.name || 'Sans nom',
          description: visual.description || null,
          image_url: image_url, // Utiliser l'image avec fallback
          category_id: visual.categoryId || null,
          category_name: visual.categoryName || null,
          created_at: visual.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: Array.isArray(visual.tags) ? visual.tags : []
        };
      });
    
    console.log(`Prêt à synchroniser ${supabaseData.length} visuels préparés`);

    // Synchroniser un visuel à la fois pour éviter les erreurs groupées
    for (const visual of supabaseData) {
      const { error } = await supabase
        .from('visuals')
        .upsert(visual, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Erreur lors de la synchronisation du visuel ID ${visual.id}:`, error);
        toast.error(`Erreur: Visuel ID ${visual.id} - ${error.message || 'Erreur inconnue'}`, { position: "bottom-right" });
        // Continue with next visual
      }
    }

    toast.success(`${supabaseData.length} visuels synchronisés avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error("Erreur synchronisation:", error);
    toast.error(`Erreur synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
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
