
// Fonction utilitaire pour convertir les clés snake_case en camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Récursivement convertir les valeurs qui sont des objets
    const newValue = value !== null && typeof value === 'object' 
      ? snakeToCamel(value) 
      : value;
    
    return { ...acc, [camelKey]: newValue };
  }, {});
};

// Fonction utilitaire pour convertir les clés camelCase en snake_case
export const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
    
    // Récursivement convertir les valeurs qui sont des objets
    const newValue = value !== null && typeof value === 'object' 
      ? camelToSnake(value) 
      : value;
    
    return { ...acc, [snakeKey]: newValue };
  }, {});
};
