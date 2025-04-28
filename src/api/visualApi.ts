
import { Visual, VisualCategory } from "@/types/visual";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/lib/toast';
import { snakeToCamel, camelToSnake } from '@/lib/supabase';

// Function to test connection to Supabase
export const testVisualsConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('visuals').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase visuals connection test failed:", error);
    return false;
  }
};

// Function to fetch all visuals from Supabase
export const fetchVisuals = async (): Promise<Visual[]> => {
  try {
    console.log("Attempting to fetch visuals from Supabase...");
    const { data, error } = await supabase
      .from('visuals')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error from Supabase when fetching visuals:", error);
      throw error;
    }
    
    // Transform from snake_case to camelCase
    const visuals = data.map((visual: any) => ({
      id: visual.id,
      name: visual.name,
      description: visual.description || '',
      image: visual.image_url,
      categoryId: visual.category_id,
      categoryName: visual.category_name || '',
      createdAt: visual.created_at,
      updatedAt: visual.updated_at
    }));
    
    console.log(`Retrieved ${visuals.length} visuals from Supabase`);
    
    // Store in localStorage for offline use
    localStorage.setItem('visuals', JSON.stringify(visuals));
    
    return visuals;
  } catch (error) {
    console.error("Error fetching visuals, falling back to local storage:", error);
    
    // Try to get from localStorage
    const storedVisuals = localStorage.getItem('visuals');
    if (storedVisuals) {
      const parsedVisuals = JSON.parse(storedVisuals);
      console.log(`Using ${parsedVisuals.length} visuals from localStorage`);
      return parsedVisuals;
    }
    
    console.log("No visuals found in any storage, returning empty array");
    return [];
  }
};

// Function to create a new visual
export const createVisual = async (visual: Omit<Visual, 'id'>): Promise<Visual | null> => {
  try {
    // Prepare data for Supabase (convert camelCase to snake_case)
    const supabaseData = {
      name: visual.name,
      description: visual.description,
      image_url: visual.image,
      category_id: visual.categoryId,
      category_name: visual.categoryName
    };
    
    console.log("Creating visual in Supabase:", supabaseData);
    const { data, error } = await supabase
      .from('visuals')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating visual in Supabase:", error);
      toast.error(`Erreur lors de la création: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    const newVisual: Visual = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      image: data.image_url,
      categoryId: data.category_id,
      categoryName: data.category_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    // Update local storage
    updateLocalStorage(newVisual);
    
    toast.success(`Visuel "${visual.name}" créé avec succès`, { position: "bottom-right" });
    return newVisual;
  } catch (error) {
    console.error("Error creating visual:", error);
    toast.error(`Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

// Function to update a visual
export const updateVisual = async (id: number, visual: Partial<Visual>): Promise<Visual | null> => {
  try {
    // Convert to snake_case for Supabase
    const supabaseData: any = {};
    
    if (visual.name !== undefined) supabaseData.name = visual.name;
    if (visual.description !== undefined) supabaseData.description = visual.description;
    if (visual.image !== undefined) supabaseData.image_url = visual.image;
    if (visual.categoryId !== undefined) supabaseData.category_id = visual.categoryId;
    if (visual.categoryName !== undefined) supabaseData.category_name = visual.categoryName;
    
    console.log(`Updating visual ${id} in Supabase:`, supabaseData);
    const { data, error } = await supabase
      .from('visuals')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating visual ${id} in Supabase:`, error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`, { position: "bottom-right" });
      return null;
    }
    
    const updatedVisual: Visual = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      image: data.image_url,
      categoryId: data.category_id,
      categoryName: data.category_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    // Update local storage
    updateLocalStorage(updatedVisual);
    
    toast.success(`Visuel "${data.name}" mis à jour avec succès`, { position: "bottom-right" });
    return updatedVisual;
  } catch (error) {
    console.error(`Error updating visual ${id}:`, error);
    toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return null;
  }
};

// Function to delete a visual
export const deleteVisual = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting visual ${id} from Supabase`);
    const { error } = await supabase
      .from('visuals')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting visual ${id} from Supabase:`, error);
      toast.error(`Erreur lors de la suppression: ${error.message}`, { position: "bottom-right" });
      return false;
    }
    
    // Remove from local storage
    removeFromLocalStorage(id);
    
    toast.success("Visuel supprimé avec succès", { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error(`Error deleting visual ${id}:`, error);
    toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to synchronize visuals from local to Supabase
export const syncVisualsToSupabase = async (): Promise<boolean> => {
  try {
    // Get local data
    const localData = localStorage.getItem('visuals');
    if (!localData) {
      toast.warning("Pas de visuels locaux à synchroniser", { position: "bottom-right" });
      return false;
    }
    
    const visuals = JSON.parse(localData);
    if (!Array.isArray(visuals) || visuals.length === 0) {
      toast.warning("Aucun visuel local trouvé", { position: "bottom-right" });
      return false;
    }
    
    // Convert to snake_case for Supabase
    const supabaseData = visuals.map(visual => ({
      id: visual.id,
      name: visual.name,
      description: visual.description,
      image_url: visual.image,
      category_id: visual.categoryId,
      category_name: visual.categoryName,
      created_at: visual.createdAt,
      updated_at: visual.updatedAt || new Date().toISOString()
    }));
    
    // Delete existing data
    const { error: deleteError } = await supabase
      .from('visuals')
      .delete()
      .gte('id', 0);
      
    if (deleteError) {
      console.error("Error deleting visuals from Supabase:", deleteError);
      toast.error(`Erreur lors de la suppression des visuels: ${deleteError.message}`, { position: "bottom-right" });
      return false;
    }
    
    // Insert new data
    const { error: insertError } = await supabase
      .from('visuals')
      .insert(supabaseData);
      
    if (insertError) {
      console.error("Error inserting visuals to Supabase:", insertError);
      toast.error(`Erreur lors de l'insertion des visuels: ${insertError.message}`, { position: "bottom-right" });
      return false;
    }
    
    toast.success(`${visuals.length} visuels synchronisés avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error("Error syncing visuals to Supabase:", error);
    toast.error(`Erreur lors de la synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Helper function to update local storage with a new or updated visual
const updateLocalStorage = (visual: Visual) => {
  try {
    // Update localStorage
    const localData = localStorage.getItem('visuals');
    let visuals: Visual[] = localData ? JSON.parse(localData) : [];
    
    // Remove existing visual with same ID if it exists
    visuals = visuals.filter(v => v.id !== visual.id);
    
    // Add the new/updated visual
    visuals.push(visual);
    
    // Save back to localStorage
    localStorage.setItem('visuals', JSON.stringify(visuals));
    
    console.log(`Updated visual ${visual.id} in local storage`);
  } catch (error) {
    console.error("Error updating local storage:", error);
  }
};

// Helper function to remove a visual from local storage
const removeFromLocalStorage = (id: number) => {
  try {
    // Update localStorage
    const localData = localStorage.getItem('visuals');
    if (localData) {
      let visuals: Visual[] = JSON.parse(localData);
      visuals = visuals.filter(v => v.id !== id);
      
      // Save back to localStorage
      localStorage.setItem('visuals', JSON.stringify(visuals));
      
      console.log(`Removed visual ${id} from local storage`);
    }
  } catch (error) {
    console.error("Error removing from local storage:", error);
  }
};

// Function to fetch visual categories
export const fetchVisualCategories = async (): Promise<VisualCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('visual_categories')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      console.error("Error fetching visual categories:", error);
      throw error;
    }
    
    const categories = data.map((cat: any) => ({
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
    console.error("Error fetching visual categories:", error);
    
    // Try to get from localStorage
    const storedCategories = localStorage.getItem('visual_categories');
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
    
    return [];
  }
};
