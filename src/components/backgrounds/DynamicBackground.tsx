
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StarBackground from '../StarBackground';
import { getBackgroundSetting } from '@/services/backgroundService';
import { BackgroundSetting } from '@/types/background';

const DynamicBackground: React.FC = () => {
  const location = useLocation();
  const [background, setBackground] = useState<BackgroundSetting | undefined>(undefined);
  
  // Extraire l'identifiant de page du chemin
  const pageId = location.pathname === '/' ? 'home' : location.pathname.substring(1).replace(/\/.*$/, '');
  
  useEffect(() => {
    // Charger le paramètre de fond pour cette page
    const pageSetting = getBackgroundSetting(pageId);
    setBackground(pageSetting);
  }, [pageId]);
  
  // Si aucun fond personnalisé n'est défini, montrer StarBackground par défaut
  if (!background) {
    return <StarBackground />;
  }
  
  // Rendu en fonction du type de fond
  switch (background.type) {
    case 'color':
      return (
        <div 
          className="fixed top-0 left-0 w-full h-full -z-10"
          style={{
            backgroundColor: background.value,
            opacity: background.opacity || 1
          }}
        />
      );
      
    case 'image':
      return (
        <div 
          className="fixed top-0 left-0 w-full h-full -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background.value})`,
            opacity: background.opacity || 1
          }}
        />
      );
      
    case 'stars':
      return <StarBackground />;
      
    default:
      return <StarBackground />;
  }
};

export default DynamicBackground;
