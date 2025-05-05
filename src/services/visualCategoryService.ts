
import { useState, useEffect } from 'react';
import { VisualCategory } from '@/types/visual';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch and manage visual categories
 */
export const useVisualCategories = () => {
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('visual_categories')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data to match VisualCategory type
        const formattedCategories = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          slug: category.slug || '',
          created_at: category.created_at,
          updated_at: category.updated_at,
          // Add camelCase aliases
          createdAt: category.created_at,
          updatedAt: category.updated_at
        })) as VisualCategory[];
        
        setCategories(formattedCategories);
        
        // Store in localStorage as fallback
        localStorage.setItem('visual_categories', JSON.stringify(formattedCategories));
      } else {
        // Fallback to localStorage
        const storedCategories = localStorage.getItem('visual_categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          // If no data in localStorage, use empty array
          setCategories([]);
        }
      }
      return true;
    } catch (err) {
      console.error("Error fetching visual categories:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedCategories = localStorage.getItem('visual_categories');
      if (storedCategories) {
        try {
          setCategories(JSON.parse(storedCategories));
        } catch (e) {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async (): Promise<boolean> => {
    return await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refreshCategories };
};

/**
 * Create a new visual category
 * @param categoryData The category data to create
 * @returns Promise with the created category
 */
export const createVisualCategory = async (categoryData: Partial<VisualCategory>) => {
  try {
    // Prepare data for Supabase format
    const supabaseCategory = {
      name: categoryData.name,
      description: categoryData.description,
      slug: categoryData.slug || categoryData.name?.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('visual_categories')
      .insert([supabaseCategory])
      .select();
      
    if (error) throw error;
    
    toast.success('Category created successfully');
    return data?.[0];
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error('Failed to create category');
    throw error;
  }
};

/**
 * Update a visual category
 * @param id The category ID to update
 * @param categoryData The updated category data
 * @returns Promise with the updated category
 */
export const updateVisualCategory = async (id: number, categoryData: Partial<VisualCategory>) => {
  try {
    // Prepare data for Supabase format
    const supabaseCategory = {
      name: categoryData.name,
      description: categoryData.description,
      slug: categoryData.slug || categoryData.name?.toLowerCase().replace(/\s+/g, '-'),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('visual_categories')
      .update(supabaseCategory)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    toast.success('Category updated successfully');
    return data?.[0];
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Failed to update category');
    throw error;
  }
};

/**
 * Delete a visual category
 * @param id The category ID to delete
 * @returns Promise indicating success
 */
export const deleteVisualCategory = async (id: number) => {
  try {
    const { error } = await supabase
      .from('visual_categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Category deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error('Failed to delete category');
    throw error;
  }
};
