
import { Visual, VisualCategory } from '@/types/visual';

/**
 * Mock data for visual categories
 */
export const mockVisualCategories: VisualCategory[] = [
  {
    id: 1,
    name: "Logos",
    description: "Logos et symboles populaires",
    slug: "logos",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Textes",
    description: "Phrases et citations",
    slug: "textes",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Personnages",
    description: "Personnages populaires",
    slug: "personnages",
    createdAt: new Date().toISOString()
  }
];

/**
 * Mock data for visuals
 */
export const mockVisuals: Visual[] = [
  {
    id: 1,
    name: "Logo Winshirt",
    description: "Logo officiel de Winshirt",
    image: "https://placehold.co/400x400/252338/FFFFFF?text=Logo+Winshirt",
    categoryId: 1,
    categoryName: "Logos",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Etoile filante",
    description: "Une étoile filante scintillante",
    image: "https://placehold.co/400x400/252338/FFFFFF?text=Etoile+filante",
    categoryId: 1,
    categoryName: "Logos",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Win the Day",
    description: "Texte motivant",
    image: "https://placehold.co/400x400/252338/FFFFFF?text=Win+the+Day",
    categoryId: 2,
    categoryName: "Textes",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Just Do It",
    description: "Slogan motivant",
    image: "https://placehold.co/400x400/252338/FFFFFF?text=Just+Do+It",
    categoryId: 2,
    categoryName: "Textes",
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Astronaute",
    description: "Un astronaute en mission",
    image: "https://placehold.co/400x400/252338/FFFFFF?text=Astronaute",
    categoryId: 3,
    categoryName: "Personnages",
    createdAt: new Date().toISOString()
  }
];

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
