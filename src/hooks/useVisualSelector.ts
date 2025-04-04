
import { useState, useEffect } from 'react';
import { Visual, ProductVisualSettings } from '@/types/visual';
import { useVisuals } from '@/data/mockVisuals';

const DEFAULT_VISUAL_SETTINGS: ProductVisualSettings = {
  visualId: null,
  position: { x: 50, y: 50 },
  size: { width: 200, height: 200 },
  opacity: 0.8
};

export const useVisualSelector = (initialVisualId?: number | null, initialSettings?: Partial<ProductVisualSettings>) => {
  const { getVisualById, visuals } = useVisuals();
  const [selectedVisual, setSelectedVisual] = useState<Visual | null>(null);
  const [visualSettings, setVisualSettings] = useState<ProductVisualSettings>({
    ...DEFAULT_VISUAL_SETTINGS,
    ...(initialSettings || {})
  });

  // Charger le visuel initial s'il existe
  useEffect(() => {
    if (initialVisualId) {
      const visual = getVisualById(initialVisualId);
      if (visual) {
        setSelectedVisual(visual);
        setVisualSettings(prevSettings => ({
          ...prevSettings,
          visualId: visual.id
        }));
      }
    }
  }, [initialVisualId, getVisualById]);

  const handleSelectVisual = (visual: Visual | null) => {
    setSelectedVisual(visual);
    
    if (visual) {
      setVisualSettings(prevSettings => ({
        ...prevSettings,
        visualId: visual.id
      }));
    } else {
      setVisualSettings(prevSettings => ({
        ...prevSettings,
        visualId: null
      }));
    }
  };

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
