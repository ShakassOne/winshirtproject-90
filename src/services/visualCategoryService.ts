
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { VisualCategory } from '@/types/visual';
import { toast } from '@/lib/toast';

// Create visual category
export const createVisualCategory = async (data: Partial<VisualCategory>) => {
  try {
    const { data: result, error } = await supabase
      .from('visual_categories')
      .insert([data]);

    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error('Error creating visual category:', error);
    throw error;
  }
};

// Update visual category
export const updateVisualCategory = async (id: number, data: Partial<VisualCategory>) => {
  try {
    const { data: result, error } = await supabase
      .from('visual_categories')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error('Error updating visual category:', error);
    throw error;
  }
};

// Delete visual category
export const deleteVisualCategory = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('visual_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error deleting visual category:', error);
    throw error;
  }
};

// Get all visual categories hook
export const useVisualCategories = () => {
  const [visualCategories, setVisualCategories] = useState<VisualCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVisualCategories = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('visual_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setVisualCategories(data as VisualCategory[]);
        
        // Store in localStorage as fallback
        localStorage.setItem('visual_categories', JSON.stringify(data));
      } else {
        // Fallback to localStorage
        const storedCategories = localStorage.getItem('visual_categories');
        if (storedCategories) {
          setVisualCategories(JSON.parse(storedCategories));
        } else {
          setVisualCategories([]);
        }
      }
    } catch (err) {
      console.error("Error fetching visual categories:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedCategories = localStorage.getItem('visual_categories');
      if (storedCategories) {
        try {
          setVisualCategories(JSON.parse(storedCategories));
        } catch (e) {
          setVisualCategories([]);
        }
      } else {
        setVisualCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshVisualCategories = async () => {
    await fetchVisualCategories();
  };

  useEffect(() => {
    fetchVisualCategories();
  }, []);

  return { visualCategories, loading, error, refreshVisualCategories };
};

// Sync visual categories to Supabase
export const syncVisualCategoriesToSupabase = async () => {
  try {
    const storedCategories = localStorage.getItem('visual_categories');
    if (!storedCategories) {
      toast.error("No local visual categories to sync");
      return false;
    }
    
    const categories = JSON.parse(storedCategories);
    
    for (const category of categories) {
      const { error } = await supabase
        .from('visual_categories')
        .upsert(category, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error syncing category ID ${category.id}:`, error);
        toast.error(`Error syncing category: ${error.message}`);
      }
    }
    
    toast.success("Visual categories synced successfully");
    return true;
  } catch (error) {
    console.error('Error syncing visual categories:', error);
    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};
