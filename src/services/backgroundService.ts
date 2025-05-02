
import { BackgroundSetting, PageBackgroundSettings } from "@/types/background";
import { toast } from "@/lib/toast";

const STORAGE_KEY = 'page_backgrounds';

// Récupérer tous les paramètres de fond d'écran
export const getAllBackgroundSettings = (): PageBackgroundSettings => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de fond:', error);
  }
  return {};
};

// Récupérer le paramètre de fond pour une page spécifique
export const getBackgroundSetting = (pageId: string): BackgroundSetting | undefined => {
  const allSettings = getAllBackgroundSettings();
  return allSettings[pageId];
};

// Vérifier si un réglage global est actif
export const hasGlobalBackgroundSetting = (): boolean => {
  const allSettings = getAllBackgroundSettings();
  return !!allSettings['all'];
};

// Sauvegarder un paramètre de fond pour une page spécifique
export const saveBackgroundSetting = (pageId: string, setting: BackgroundSetting): boolean => {
  try {
    const allSettings = getAllBackgroundSettings();
    allSettings[pageId] = {
      ...setting,
      pageId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
    
    // Dispatch an event to notify that backgrounds have been updated
    window.dispatchEvent(new CustomEvent('backgroundsUpdated', { 
      detail: { pageId, setting }
    }));
    
    // Message spécial pour le réglage global
    if (pageId === 'all') {
      toast.success('Fond d\'écran global appliqué à toutes les pages');
    } else {
      toast.success('Fond d\'écran mis à jour');
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du paramètre de fond:', error);
    toast.error('Erreur lors de la mise à jour du fond d\'écran');
    return false;
  }
};

// Supprimer un paramètre de fond pour une page spécifique
export const removeBackgroundSetting = (pageId: string): boolean => {
  try {
    const allSettings = getAllBackgroundSettings();
    if (allSettings[pageId]) {
      delete allSettings[pageId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      
      // Dispatch an event to notify that backgrounds have been updated
      window.dispatchEvent(new CustomEvent('backgroundsUpdated', { 
        detail: { pageId, removed: true }
      }));
      
      // Message spécial pour le réglage global
      if (pageId === 'all') {
        toast.success('Fond d\'écran global supprimé');
      } else {
        toast.success('Fond d\'écran réinitialisé');
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la suppression du paramètre de fond:', error);
    toast.error('Erreur lors de la réinitialisation du fond d\'écran');
    return false;
  }
};

// Liste des fonds prédéfinis
export const predefinedBackgrounds = {
  colors: [
    { name: 'Deep Space Gradient', value: 'linear-gradient(to bottom, #0f0f1a, #2e2e5a)' },
    { name: 'Purple Horizon', value: 'linear-gradient(135deg, #4a3b78 0%, #7e69AB 100%)' },
    { name: 'Cosmic Blend', value: 'radial-gradient(circle, #7e69AB 0%, #1a1a35 100%)' },
    { name: 'Dark Charcoal', value: '#221F26' },
  ],
  images: [
    { name: 'green', value: 'https://pixelprint.world/wp-content/uploads/2025/04/360_F_740283743_YbR4YLfwl5wS3laOBFIkJjLDLMvWu9nn.jpg' },
    { name: 'Black', value: 'https://pixelprint.world/wp-content/uploads/2025/04/desmumtz11-scaled.jpg' },
  ]
};

// Upload an image and return the URL
export const uploadBackgroundImage = async (file: File): Promise<string | null> => {
  try {
    // For now, we're just creating a local object URL
    // In a production environment, you would upload this to a server
    const objectUrl = URL.createObjectURL(file);
    return objectUrl;
    
    // When implementing real image uploads, use this:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('folder', 'backgrounds');
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // });
    // if (!response.ok) throw new Error('Upload failed');
    // const data = await response.json();
    // return data.url;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    toast.error('Erreur lors du téléchargement de l\'image');
    return null;
  }
};
