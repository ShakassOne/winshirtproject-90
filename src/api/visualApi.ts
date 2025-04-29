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

    const visuals = data.map(visual => ({
      id: visual.id,
      name: visual.name,
      description: visual.description || '',
      image: visual.image_url,
      categoryId: visual.category_id,
      categoryName: visual.category_name || '',
      createdAt: visual.created_at,
      updatedAt: visual.updated_at
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
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Création impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData = {
      name: visual.name,
      description: visual.description,
      image_url: visual.image,
      category_id: visual.categoryId,
      category_name: visual.categoryName,
    };

    const { data, error } = await supabase
      .from('visuals')
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw error;

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
    const isConnected = await testVisualsConnection();
    if (!isConnected) {
      toast.error("Mise à jour impossible - Mode hors-ligne");
      return null;
    }

    const supabaseData: any = {};
    if (visual.name) supabaseData.name = visual.name;
    if (visual.description) supabaseData.description = visual.description;
    if (visual.image) supabaseData.image_url = visual.image;
    if (visual.categoryId) supabaseData.category_id = visual.categoryId;
    if (visual.categoryName) supabaseData.category_name = visual.categoryName;

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
      image: data.image_url,
      categoryId: data.category_id,
      categoryName: data.category_name || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
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

// Synchronisation fiable
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

    // Upsert (insert or update automatiquement)
    const { error } = await supabase
      .from('visuals')
      .upsert(visuals, { onConflict: ['id'] });

    if (error) throw error;

    toast.success(`${visuals.length} visuels synchronisés`);
    return true;
  } catch (error) {
    console.error("Erreur synchronisation:", error);
    toast.error("Erreur synchronisation visuels");
    return false;
  }
};

// Helpers locaux
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
    const stored = localStorage.getItem('visual_categories');
    if (stored) return JSON.parse(stored);
    return [];
  }
};
