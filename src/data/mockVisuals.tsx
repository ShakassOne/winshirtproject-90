
import { useState, useEffect } from 'react';
import { Visual, VisualCategory } from '@/types/visual';

// Sample visual categories
const defaultCategories: VisualCategory[] = [
  { id: 1, name: 'Sports', description: 'Images liées au sport', slug: 'sports' },
  { id: 2, name: 'Musique', description: 'Images liées à la musique', slug: 'music' },
  { id: 3, name: 'Animaux', description: 'Images d\'animaux', slug: 'animals' },
  { id: 4, name: 'Nature', description: 'Images de nature', slug: 'nature' },
];

// Sample visuals
const defaultVisuals: Visual[] = [
  {
    id: 1,
    name: "Logo Football",
    description: "Logo football pour t-shirt",
    image: "/assets/visuals/football.png",
    categoryId: 1,
    categoryName: "Sports"
  },
  {
    id: 2,
    name: "Note de musique",
    description: "Note de musique pour t-shirt",
    image: "/assets/visuals/music.png",
    categoryId: 2,
    categoryName: "Musique"
  },
  {
    id: 3,
    name: "Chien",
    description: "Image de chien pour t-shirt",
    image: "/assets/visuals/dog.png",
    categoryId: 3,
    categoryName: "Animaux"
  },
];

/**
 * Hook pour gérer les visuels
 */
export const useVisuals = () => {
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [categories, setCategories] = useState<VisualCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadLocalData = () => {
      try {
        // Charger les catégories
        const storedCategories = localStorage.getItem('visualCategories');
        if (storedCategories) {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            setCategories(parsedCategories);
          } else {
            setCategories(defaultCategories);
            localStorage.setItem('visualCategories', JSON.stringify(defaultCategories));
          }
        } else {
          setCategories(defaultCategories);
          localStorage.setItem('visualCategories', JSON.stringify(defaultCategories));
        }

        // Charger les visuels
        const storedVisuals = localStorage.getItem('visuals');
        if (storedVisuals) {
          const parsedVisuals = JSON.parse(storedVisuals);
          if (Array.isArray(parsedVisuals) && parsedVisuals.length > 0) {
            // Assurez-vous que chaque visuel a un categoryName
            const enrichedVisuals = parsedVisuals.map((visual: Visual) => {
              if (!visual.categoryName) {
                const category = defaultCategories.find(c => c.id === visual.categoryId);
                return {
                  ...visual,
                  categoryName: category ? category.name : "Autre"
                };
              }
              return visual;
            });
            setVisuals(enrichedVisuals);
          } else {
            setVisuals(defaultVisuals);
            localStorage.setItem('visuals', JSON.stringify(defaultVisuals));
          }
        } else {
          setVisuals(defaultVisuals);
          localStorage.setItem('visuals', JSON.stringify(defaultVisuals));
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données de visuels:', error);
        // Fallback en cas d'erreur
        setCategories(defaultCategories);
        setVisuals(defaultVisuals);
      } finally {
        setLoading(false);
      }
    };

    loadLocalData();
  }, []);

  /**
   * Récupérer les catégories de visuels
   */
  const getCategories = (): VisualCategory[] => {
    return categories;
  };

  /**
   * Récupérer un visuel par ID
   */
  const getVisualById = (id: number): Visual | undefined => {
    return visuals.find(visual => visual.id === id);
  };

  /**
   * Récupérer les visuels par catégorie
   */
  const getVisualsByCategory = (categoryId: number): Visual[] => {
    return visuals.filter(visual => visual.categoryId === categoryId);
  };

  /**
   * Ajouter un nouveau visuel
   */
  const addVisual = (visual: Omit<Visual, 'id'>): void => {
    const newId = Math.max(0, ...visuals.map(v => v.id)) + 1;
    const category = categories.find(c => c.id === visual.categoryId);
    const newVisual = {
      ...visual,
      id: newId,
      categoryName: category ? category.name : "Autre"
    };
    
    const updatedVisuals = [...visuals, newVisual];
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
  };

  /**
   * Mettre à jour un visuel existant
   */
  const updateVisual = (id: number, visualData: Partial<Visual>): void => {
    const updatedVisuals = visuals.map(visual => 
      visual.id === id 
        ? { 
            ...visual, 
            ...visualData,
            categoryName: visualData.categoryId 
              ? categories.find(c => c.id === visualData.categoryId)?.name || visual.categoryName
              : visual.categoryName
          } 
        : visual
    );
    
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
  };

  /**
   * Supprimer un visuel
   */
  const deleteVisual = (id: number): void => {
    const updatedVisuals = visuals.filter(visual => visual.id !== id);
    setVisuals(updatedVisuals);
    localStorage.setItem('visuals', JSON.stringify(updatedVisuals));
  };

  return {
    visuals,
    categories,
    loading,
    getCategories,
    getVisualById,
    getVisualsByCategory,
    addVisual,
    updateVisual,
    deleteVisual
  };
};
