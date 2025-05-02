
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StarBackground from '../StarBackground';
import { getBackgroundSetting } from '@/services/backgroundService';
import { BackgroundSetting } from '@/types/background';

const DynamicBackground: React.FC = () => {
  const location = useLocation();
  const [background, setBackground] = useState<BackgroundSetting | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extraire l'identifiant de page du chemin
  // Déterminer le pageId en fonction de l'URL actuelle
  const getPageIdFromPath = (path: string): string => {
    if (path === '/') return 'home';
    
    // Remove any trailing slash and get the first segment
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    const firstSegment = normalizedPath.split('/')[1];
    
    // Map some specific paths to their respective page IDs
    if (firstSegment === 'admin') {
      const secondSegment = normalizedPath.split('/')[2];
      return secondSegment ? `admin-${secondSegment}` : 'admin';
    }
    
    // Map 'shop' to 'products' for background settings compatibility
    if (firstSegment === 'shop') return 'products';
    
    return firstSegment || 'home';
  };
  
  const pageId = getPageIdFromPath(location.pathname);
  
  useEffect(() => {
    // Charger le paramètre de fond pour cette page
    setIsLoading(true);
    try {
      // Vérifier d'abord s'il existe un réglage pour "all" (toutes les pages)
      const globalSetting = getBackgroundSetting('all');
      
      if (globalSetting) {
        // Si un réglage global existe, l'utiliser
        setBackground(globalSetting);
      } else {
        // Sinon, chercher un réglage spécifique à cette page
        const pageSetting = getBackgroundSetting(pageId);
        setBackground(pageSetting);
        
        // Si aucun paramètre n'est défini pour cette page spécifique,
        // essayer de charger un paramètre général pour le type de page
        if (!pageSetting) {
          const generalPageType = pageId.includes('admin-') ? 'admin' : pageId.split('-')[0];
          const generalSetting = getBackgroundSetting(generalPageType);
          setBackground(generalSetting);
        }
      }
    } catch (error) {
      console.error("Error loading background setting:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pageId, location.pathname]);
  
  // Pendant le chargement, montrer un fond noir
  if (isLoading) {
    return <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />;
  }
  
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
