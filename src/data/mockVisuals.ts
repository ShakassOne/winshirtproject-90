
import { Visual, VisualCategory } from '@/types/visual';

export const mockVisualCategories: VisualCategory[] = [
  {
    id: 1,
    name: "Jeux Vidéo",
    description: "Designs inspirés de jeux vidéo populaires",
    slug: "jeux-video"
  },
  {
    id: 2,
    name: "Films & Séries",
    description: "Visuels basés sur des films et séries cultes",
    slug: "films-series"
  },
  {
    id: 3,
    name: "Musique",
    description: "Designs inspirés de la musique et des artistes",
    slug: "musique"
  },
  {
    id: 4,
    name: "Humour",
    description: "Designs amusants et citations drôles",
    slug: "humour"
  },
  {
    id: 5,
    name: "Animaux",
    description: "Designs avec des animaux",
    slug: "animaux"
  }
];

export const mockVisuals: Visual[] = [
  {
    id: 1,
    name: "Retro Gaming Controller",
    description: "Manette de jeu rétro classique",
    image: "https://placehold.co/400x400/333/FFF?text=Controller",
    categoryId: 1,
    categoryName: "Jeux Vidéo"
  },
  {
    id: 2,
    name: "Space Invaders",
    description: "Les envahisseurs classiques",
    image: "https://placehold.co/400x400/333/FFF?text=Invaders",
    categoryId: 1,
    categoryName: "Jeux Vidéo"
  },
  {
    id: 3,
    name: "Sci-Fi Robot",
    description: "Robot de science-fiction",
    image: "https://placehold.co/400x400/333/FFF?text=Robot",
    categoryId: 2,
    categoryName: "Films & Séries"
  },
  {
    id: 4,
    name: "Guitar Silhouette",
    description: "Silhouette de guitare électrique",
    image: "https://placehold.co/400x400/333/FFF?text=Guitar",
    categoryId: 3,
    categoryName: "Musique"
  },
  {
    id: 5,
    name: "Audio Waves",
    description: "Ondes audio visuelles",
    image: "https://placehold.co/400x400/333/FFF?text=Waves",
    categoryId: 3,
    categoryName: "Musique"
  },
  {
    id: 6,
    name: "Coffee Addict",
    description: "Pour les accros au café",
    image: "https://placehold.co/400x400/333/FFF?text=Coffee",
    categoryId: 4,
    categoryName: "Humour"
  },
  {
    id: 7,
    name: "Cat Silhouette",
    description: "Silhouette de chat",
    image: "https://placehold.co/400x400/333/FFF?text=Cat",
    categoryId: 5,
    categoryName: "Animaux"
  }
];

// Hook pour récupérer les visuels (simule une API)
export const useVisuals = () => {
  const getAllVisuals = () => {
    // Ajouter categoryName à chaque visuel en joignant les données
    return mockVisuals.map(visual => {
      const category = mockVisualCategories.find(c => c.id === visual.categoryId);
      return {
        ...visual,
        categoryName: category?.name || 'Sans catégorie'
      };
    });
  };

  const getVisualsByCategory = (categoryId: number) => {
    return getAllVisuals().filter(visual => visual.categoryId === categoryId);
  };
  
  // Add the missing method
  const getVisualsByCategoryId = (categoryId: number) => {
    return getVisualsByCategory(categoryId);
  };

  const getVisualById = (visualId: number) => {
    return getAllVisuals().find(visual => visual.id === visualId);
  };

  const getCategories = () => {
    return mockVisualCategories;
  };

  const getCategoryById = (categoryId: number) => {
    return mockVisualCategories.find(category => category.id === categoryId);
  };

  return {
    getAllVisuals,
    getVisualsByCategory,
    getVisualsByCategoryId,
    getVisualById,
    getCategories,
    getCategoryById
  };
};
