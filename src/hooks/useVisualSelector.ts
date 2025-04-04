
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
  
  // Séparer les visuels et réglages pour recto/verso
  const [selectedVisuals, setSelectedVisuals] = useState<{
    front: Visual | null;
    back: Visual | null;
  }>({
    front: null,
    back: null
  });
  
  const [visualSettings, setVisualSettings] = useState<{
    front: ProductVisualSettings;
    back: ProductVisualSettings;
  }>({
    front: {
      ...DEFAULT_VISUAL_SETTINGS,
      ...(initialSettings || {})
    },
    back: {
      ...DEFAULT_VISUAL_SETTINGS,
      ...(initialSettings || {})
    }
  });
  
  const [activePosition, setActivePosition] = useState<'front' | 'back'>('front');

  // Déterminer la zone d'impression active en fonction de la position
  const getActivePrintArea = () => {
    if (!printAreas || printAreas.length === 0) return null;
    
    // Trouver la zone qui correspond à la position active (recto/verso)
    const positionAreas = printAreas.filter(area => area.position === activePosition);
    if (positionAreas.length > 0) return positionAreas[0];
    
    // Fallback: première zone disponible
    return printAreas[0];
  };
  
  const activePrintArea = getActivePrintArea();

  // Charger le visuel initial s'il existe
  useEffect(() => {
    if (initialVisualId) {
      console.log(`Loading initial visual ${initialVisualId}`);
      const visual = getVisualById(initialVisualId);
      if (visual) {
        console.log(`Found visual: ${visual.name}`);
        
        // Initialiser pour la face active uniquement
        setSelectedVisuals(prev => ({
          ...prev,
          [activePosition]: visual
        }));
        
        // Initialiser les paramètres de position en fonction de la zone d'impression si disponible
        if (activePrintArea && !initialSettings?.position) {
          const { bounds } = activePrintArea;
          
          // Centrer le visuel dans la zone d'impression
          const centerX = bounds.x + (bounds.width - (initialSettings?.size?.width || DEFAULT_VISUAL_SETTINGS.size.width)) / 2;
          const centerY = bounds.y + (bounds.height - (initialSettings?.size?.height || DEFAULT_VISUAL_SETTINGS.size.height)) / 2;
          
          setVisualSettings(prev => ({
            ...prev,
            [activePosition]: {
              ...prev[activePosition],
              visualId: visual.id,
              position: { 
                x: Math.max(bounds.x, centerX),
                y: Math.max(bounds.y, centerY)
              }
            }
          }));
        } else {
          // Utiliser les paramètres initiaux ou par défaut
          setVisualSettings(prev => ({
            ...prev,
            [activePosition]: {
              ...prev[activePosition],
              visualId: visual.id
            }
          }));
        }
      } else {
        console.log(`Visual id ${initialVisualId} not found`);
      }
    }
  }, [initialVisualId, getVisualById, activePrintArea, initialSettings, activePosition]);

  // Sélectionner un nouveau visuel
  const handleSelectVisual = (visual: Visual | null) => {
    console.log(`Selected new visual for ${activePosition}: ${visual?.id || 'none'}`);
    
    // Mettre à jour uniquement le visuel de la face active
    setSelectedVisuals(prev => ({
      ...prev,
      [activePosition]: visual
    }));
    
    if (visual) {
      // Ajuster la position en fonction de la zone d'impression si disponible
      if (activePrintArea) {
        const { bounds } = activePrintArea;
        
        // Centrer le visuel dans la zone d'impression
        const centerX = bounds.x + (bounds.width - visualSettings[activePosition].size.width) / 2;
        const centerY = bounds.y + (bounds.height - visualSettings[activePosition].size.height) / 2;
        
        setVisualSettings(prev => ({
          ...prev,
          [activePosition]: {
            ...prev[activePosition],
            visualId: visual.id,
            position: { 
              x: Math.max(bounds.x, centerX),
              y: Math.max(bounds.y, centerY)
            }
          }
        }));
      } else {
        // Utiliser une position par défaut
        setVisualSettings(prev => ({
          ...prev,
          [activePosition]: {
            ...prev[activePosition],
            visualId: visual.id
          }
        }));
      }
    } else {
      setVisualSettings(prev => ({
        ...prev,
        [activePosition]: {
          ...prev[activePosition],
          visualId: null
        }
      }));
    }
  };

  // Mettre à jour les paramètres du visuel (position, taille, opacité)
  const handleUpdateSettings = (newSettings: Partial<ProductVisualSettings>) => {
    setVisualSettings(prev => ({
      ...prev,
      [activePosition]: {
        ...prev[activePosition],
        ...newSettings
      }
    }));
  };
  
  // Mettre à jour la position active (recto/verso)
  const setPosition = (position: 'front' | 'back') => {
    setActivePosition(position);
  };

  return {
    // Exposer les données pour la face active et toutes les faces
    selectedVisual: selectedVisuals[activePosition],
    visualSettings: visualSettings[activePosition],
    activePosition,
    setPosition,
    handleSelectVisual,
    handleUpdateSettings,
    // Exposer aussi les données pour toutes les faces
    allVisuals: selectedVisuals,
    allSettings: visualSettings
  };
};
