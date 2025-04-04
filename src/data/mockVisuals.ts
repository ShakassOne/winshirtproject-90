
import { useState, useEffect } from 'react';
import { Visual, VisualCategory } from '@/types/visual';

// Exemple de catégories de visuels
export const mockVisualCategories: VisualCategory[] = [
  {
    id: 1,
    name: "Sports",
    description: "Visuels liés aux sports",
    slug: "sports"
  },
  {
    id: 2,
    name: "Animaux",
    description: "Visuels d'animaux",
    slug: "animaux"
  },
  {
    id: 3,
    name: "Nature",
    description: "Visuels de nature et paysages",
    slug: "nature"
  },
  {
    id: 4,
    name: "Abstrait",
    description: "Designs abstraits et artistiques",
    slug: "abstrait"
  }
];

// Exemple de visuels
export const mockVisuals: Visual[] = [
  {
    id: 1,
    name: "Football",
    description: "Ballon de football",
    image: "https://placehold.co/300x300/2a2a5e/white?text=Football",
    categoryId: 1,
    categoryName: "Sports"
  },
  {
    id: 2,
    name: "Basketball",
    description: "Ballon de basketball",
    image: "https://placehold.co/300x300/e95420/white?text=Basketball",
    categoryId: 1,
    categoryName: "Sports"
  },
  {
    id: 3,
    name: "Chat",
    description: "Silhouette de chat",
    image: "https://placehold.co/300x300/2e2e2e/white?text=Chat",
    categoryId: 2,
    categoryName: "Animaux"
  },
  {
    id: 4,
    name: "Chien",
    description: "Silhouette de chien",
    image: "https://placehold.co/300x300/663399/white?text=Chien",
    categoryId: 2,
    categoryName: "Animaux"
  },
  {
    id: 5,
    name: "Montagne",
    description: "Paysage de montagne",
    image: "https://placehold.co/300x300/2c3e50/white?text=Montagne",
    categoryId: 3,
    categoryName: "Nature"
  },
  {
    id: 6,
    name: "Plage",
    description: "Paysage de plage",
    image: "https://placehold.co/300x300/3498db/white?text=Plage",
    categoryId: 3,
    categoryName: "Nature"
  },
  {
    id: 7,
    name: "Vagues",
    description: "Design abstrait de vagues",
    image: "https://placehold.co/300x300/2c3e50/white?text=Vagues",
    categoryId: 4,
    categoryName: "Abstrait"
  },
  {
    id: 8,
    name: "Géométrique",
    description: "Design abstrait géométrique",
    image: "https://placehold.co/300x300/e74c3c/white?text=Géometrique",
    categoryId: 4,
    categoryName: "Abstrait"
  }
];

export const useVisuals = () => {
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [visuals, setVisuals] = useState<Visual[]>([]);
  
  // Charger les catégories et visuels depuis le localStorage (ou utiliser les defaults)
  useEffect(() => {
    const loadCategoriesAndVisuals = () => {
      // Charger les catégories
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            setCategories(parsedCategories);
          } else {
            setCategories(mockVisualCategories);
            localStorage.setItem('visualCategories', JSON.stringify(mockVisualCategories));
          }
        } catch (error) {
          console.error("Error loading visual categories:", error);
          setCategories(mockVisualCategories);
          localStorage.setItem('visualCategories', JSON.stringify(mockVisualCategories));
        }
      } else {
        setCategories(mockVisualCategories);
        localStorage.setItem('visualCategories', JSON.stringify(mockVisualCategories));
      }
      
      // Charger les visuels
      const storedVisuals = localStorage.getItem('visuals');
      if (storedVisuals) {
        try {
          const parsedVisuals = JSON.parse(storedVisuals);
          if (Array.isArray(parsedVisuals) && parsedVisuals.length > 0) {
            setVisuals(parsedVisuals);
          } else {
            setVisuals(mockVisuals);
            localStorage.setItem('visuals', JSON.stringify(mockVisuals));
          }
        } catch (error) {
          console.error("Error loading visuals:", error);
          setVisuals(mockVisuals);
          localStorage.setItem('visuals', JSON.stringify(mockVisuals));
        }
      } else {
        setVisuals(mockVisuals);
        localStorage.setItem('visuals', JSON.stringify(mockVisuals));
      }
    };
    
    loadCategoriesAndVisuals();
  }, []);
  
  // Obtenir toutes les catégories
  const getCategories = (): VisualCategory[] => {
    return categories;
  };
  
  // Obtenir une catégorie par son ID
  const getCategoryById = (id: number): VisualCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };
  
  // Obtenir tous les visuels
  const getAllVisuals = (): Visual[] => {
    return visuals;
  };
  
  // Obtenir un visuel par son ID
  const getVisualById = (id: number): Visual | undefined => {
    return visuals.find(visual => visual.id === id);
  };
  
  // Obtenir les visuels d'une catégorie
  const getVisualsByCategory = (categoryId: number): Visual[] => {
    return visuals.filter(visual => visual.categoryId === categoryId);
  };

  // Alias de getVisualsByCategory pour la compatibilité
  const getVisualsByCategoryId = (categoryId: number): Visual[] => {
    return getVisualsByCategory(categoryId);
  };
  
  // Ajouter un visuel
  const addVisual = (visual: Omit<Visual, 'id'>): Visual => {
    const newId = visuals.length > 0 ? Math.max(...visuals.map(v => v.id)) + 1 : 1;
    const newVisual: Visual = {
      ...visual,
      id: newId
    };
    
    const updatedVisuals = [...visuals, newVisual];
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
    
    return newVisual;
  };
  
  // Mettre à jour un visuel
  const updateVisual = (id: number, updates: Partial<Visual>): boolean => {
    const index = visuals.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    const updatedVisuals = [...visuals];
    updatedVisuals[index] = { ...updatedVisuals[index], ...updates };
    
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
    
    return true;
  };
  
  // Supprimer un visuel
  const deleteVisual = (id: number): boolean => {
    const index = visuals.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    const updatedVisuals = visuals.filter(v => v.id !== id);
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
    
    return true;
  };
  
  return {
    categories,
    visuals,
    getCategories,
    getCategoryById,
    getAllVisuals,
    getVisualById,
    getVisualsByCategory,
    getVisualsByCategoryId,
    addVisual,
    updateVisual,
    deleteVisual
  };
};
