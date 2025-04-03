
import { Visual, VisualCategory } from '@/types/visual';

/**
 * Custom hook to access mockup visuals data
 */
export const useVisuals = () => {
  /**
   * Get all visuals from the localStorage or fallback to empty array
   */
  const getAllVisuals = (): Visual[] => {
    try {
      const storedVisuals = localStorage.getItem('visuals');
      if (storedVisuals) {
        return JSON.parse(storedVisuals);
      }
    } catch (error) {
      console.error('Error loading visuals:', error);
    }
    return [];
  };
  
  /**
   * Get visuals filtered by category ID
   */
  const getVisualsByCategory = (categoryId: number): Visual[] => {
    const allVisuals = getAllVisuals();
    return allVisuals.filter(visual => visual.categoryId === categoryId);
  };

  /**
   * Same as getVisualsByCategory but with a different name for compatibility
   */
  const getVisualsByCategoryId = (categoryId: number): Visual[] => {
    return getVisualsByCategory(categoryId);
  };

  /**
   * Get a specific visual by ID
   */
  const getVisualById = (visualId: number): Visual | null => {
    const allVisuals = getAllVisuals();
    return allVisuals.find(visual => visual.id === visualId) || null;
  };
  
  /**
   * Get all visual categories from localStorage or fallback to empty array
   */
  const getCategories = (): VisualCategory[] => {
    try {
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        return JSON.parse(storedCategories);
      }
    } catch (error) {
      console.error('Error loading visual categories:', error);
    }
    return [];
  };
  
  return {
    getAllVisuals,
    getVisualsByCategory,
    getVisualById,
    getCategories,
    getVisualsByCategoryId
  };
};
