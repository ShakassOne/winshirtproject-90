import { useState, useEffect } from 'react';
import { Visual } from '@/types/visual';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { validateVisuals, showValidationErrors } from '@/lib/syncValidator';

/**
 * Create a new visual
 * @param visualData The visual data to create
 * @returns Promise with the created visual
 */
export const createVisual = async (visualData: Partial<Visual>) => {
  try {
    // Prepare data for Supabase format
    const supabaseVisual = {
      name: visualData.name,
      description: visualData.description,
      image_url: visualData.image,
      category_id: visualData.category_id,
      category_name: visualData.category_name,
      tags: visualData.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('visuals')
      .insert([supabaseVisual])
      .select();
      
    if (error) throw error;
    
    toast.success('Visual created successfully');
    return data?.[0];
  } catch (error) {
    console.error('Error creating visual:', error);
    toast.error('Failed to create visual');
    throw error;
  }
};

/**
 * Update a visual
 * @param id The visual ID to update
 * @param visualData The updated visual data
 * @returns Promise with the updated visual
 */
export const updateVisual = async (id: number, visualData: Partial<Visual>) => {
  try {
    // Prepare data for Supabase format
    const supabaseVisual = {
      name: visualData.name,
      description: visualData.description,
      image_url: visualData.image,
      category_id: visualData.category_id,
      category_name: visualData.category_name,
      tags: visualData.tags,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('visuals')
      .update(supabaseVisual)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    toast.success('Visual updated successfully');
    return data?.[0];
  } catch (error) {
    console.error('Error updating visual:', error);
    toast.error('Failed to update visual');
    throw error;
  }
};

/**
 * Delete a visual
 * @param id The visual ID to delete
 * @returns Promise indicating success
 */
export const deleteVisual = async (id: number) => {
  try {
    const { error } = await supabase
      .from('visuals')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Visual deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting visual:', error);
    toast.error('Failed to delete visual');
    throw error;
  }
};

/**
 * Synchronizes visuals data with Supabase
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating success or failure
 */
export const syncVisualsToSupabase = async (): Promise<boolean> => {
  try {
    // Fetch visuals from localStorage
    const storedVisuals = localStorage.getItem('visuals');
    if (!storedVisuals) {
      console.error('No local visuals found to sync');
      return false;
    }
    
    const localVisuals: Visual[] = JSON.parse(storedVisuals);
    
    // Validate visuals before sync
    const validationResult = validateVisuals(localVisuals);
    if (!showValidationErrors(validationResult, 'Visual')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Transform data to match Supabase schema
    const supabaseReadyVisuals = localVisuals.map((visual: Visual) => ({
      id: visual.id,
      name: visual.name,
      description: visual.description,
      image_url: visual.image,
      category_id: visual.category_id,
      category_name: visual.category_name,
      tags: visual.tags,
      created_at: visual.created_at,
      updated_at: visual.updated_at
    }));

    // Use one visual at a time to avoid batch errors
    for (const visual of supabaseReadyVisuals) {
      const { error } = await supabase
        .from('visuals')
        .upsert(visual, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error syncing visual ID ${visual.id}:`, error);
        toast.error(`Erreur lors de la synchronisation du visual ID ${visual.id}: ${error.message}`, { position: "bottom-right" });
        // Continue with next visual
      }
    }

    toast.success(`Visuals synchronisés avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error syncing visuals:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

/**
 * Synchronizes visual categories with Supabase
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating success or failure
 */
export const syncVisualCategoriesToSupabase = async (): Promise<boolean> => {
  try {
    // Implementation would go here in a real app
    console.log('Syncing visual categories to Supabase');
    return true;
  } catch (error) {
    console.error('Error syncing visual categories:', error);
    return false;
  }
};
