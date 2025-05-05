
import { VisualCategory } from '@/types/visual';

/**
 * Get visual category name by id
 */
export const getVisualCategoryName = (categoryId?: number | null): string => {
  if (!categoryId) return 'Aucune';
  
  try {
    // Try to get from localStorage
    const storedCategories = localStorage.getItem('visualCategories');
    if (storedCategories) {
      const categories = JSON.parse(storedCategories) as VisualCategory[];
      const category = categories.find(c => c.id === categoryId);
      return category?.name || `Catégorie #${categoryId}`;
    }
  } catch (error) {
    console.error("Error getting visual category name:", error);
  }
  
  return `Catégorie #${categoryId}`;
};

/**
 * Get all visual categories
 */
export const getVisualCategories = (): VisualCategory[] => {
  try {
    // Try to get from localStorage
    const storedCategories = localStorage.getItem('visualCategories');
    if (storedCategories) {
      return JSON.parse(storedCategories) as VisualCategory[];
    }
  } catch (error) {
    console.error("Error getting visual categories:", error);
  }
  
  return [];
};
