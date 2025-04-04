
import { useState, useEffect } from 'react';
import { Visual, ProductVisualSettings } from '@/types/visual';
import { useVisuals } from '@/data/mockVisuals';
import { PrintArea } from '@/types/product';

const DEFAULT_VISUAL_SETTINGS: ProductVisualSettings = {
  visualId: null,
  position: { x: 50, y: 50 },
  size: { width: 200, height: 200 },
  opacity: 0.8
};

export const useVisualSelector = (
  initialVisualId?: number | null, 
  initialSettings?: Partial<ProductVisualSettings>,
  printAreas?: PrintArea[]
) => {
  const { getVisualById, visuals } = useVisuals();
  const [selectedVisual, setSelectedVisual] = useState<Visual | null>(null);
  const [visualSettings, setVisualSettings] = useState<ProductVisualSettings>({
    ...DEFAULT_VISUAL_SETTINGS,
    ...(initialSettings || {})
  });

  // Déterminer la zone d'impression active
  const getActivePrintArea = () => {
    if (!printAreas || printAreas.length === 0) return null;
    return printAreas[0]; // Prendre la première zone par défaut (recto)
  };
  
  const activePrintArea = getActivePrintArea();

  // Charger le visuel initial s'il existe
  useEffect(() => {
    if (initialVisualId) {
      const visual = getVisualById(initialVisualId);
      if (visual) {
        setSelectedVisual(visual);
        
        // Initialiser les paramètres de position en fonction de la zone d'impression si disponible
        if (activePrintArea && !initialSettings?.position) {
          const { bounds } = activePrintArea;
          
          // Centrer le visuel dans la zone d'impression
          const centerX = bounds.x + (bounds.width - (initialSettings?.size?.width || DEFAULT_VISUAL_SETTINGS.size.width)) / 2;
          const centerY = bounds.y + (bounds.height - (initialSettings?.size?.height || DEFAULT_VISUAL_SETTINGS.size.height)) / 2;
          
          setVisualSettings(prevSettings => ({
            ...prevSettings,
            visualId: visual.id,
            position: { 
              x: Math.max(bounds.x, centerX),
              y: Math.max(bounds.y, centerY)
            }
          }));
        } else {
          // Utiliser les paramètres initiaux ou par défaut
          setVisualSettings(prevSettings => ({
            ...prevSettings,
            visualId: visual.id
          }));
        }
      }
    }
  }, [initialVisualId, getVisualById, activePrintArea, initialSettings]);

  // Sélectionner un nouveau visuel
  const handleSelectVisual = (visual: Visual | null) => {
    setSelectedVisual(visual);
    
    if (visual) {
      // Ajuster la position en fonction de la zone d'impression si disponible
      if (activePrintArea) {
        const { bounds } = activePrintArea;
        
        // Centrer le visuel dans la zone d'impression
        const centerX = bounds.x + (bounds.width - visualSettings.size.width) / 2;
        const centerY = bounds.y + (bounds.height - visualSettings.size.height) / 2;
        
        setVisualSettings(prevSettings => ({
          ...prevSettings,
          visualId: visual.id,
          position: { 
            x: Math.max(bounds.x, centerX),
            y: Math.max(bounds.y, centerY)
          }
        }));
      } else {
        // Utiliser une position par défaut
        setVisualSettings(prevSettings => ({
          ...prevSettings,
          visualId: visual.id
        }));
      }
    } else {
      setVisualSettings(prevSettings => ({
        ...prevSettings,
        visualId: null
      }));
    }
  };

  // Mettre à jour les paramètres du visuel (position, taille, opacité)
  const handleUpdateSettings = (newSettings: Partial<ProductVisualSettings>) => {
    setVisualSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  return {
    selectedVisual,
    visualSettings,
    handleSelectVisual,
    handleUpdateSettings
  };
};
