
import { Visual, VisualCategory } from '@/types/visual';
import { toast } from '@/lib/toast';

/**
 * Validates that visual categories meet the required format
 */
export const validateVisualCategories = (categories: any[]): boolean => {
  if (!Array.isArray(categories)) return false;
  
  return categories.every(category => {
    return (
      typeof category === 'object' &&
      'id' in category &&
      'name' in category &&
      typeof category.name === 'string'
    );
  });
};

/**
 * Validates that visuals meet the required format
 */
export const validateVisuals = (visuals: any[]): boolean => {
  if (!Array.isArray(visuals)) return false;
  
  return visuals.every(visual => {
    return (
      typeof visual === 'object' &&
      'id' in visual &&
      'name' in visual &&
      'image' in visual &&
      typeof visual.name === 'string' &&
      typeof visual.image === 'string'
    );
  });
};

/**
 * Validates lotteries data format
 */
export const validateLotteries = (lotteries: any[]): boolean => {
  if (!Array.isArray(lotteries)) return false;
  
  return lotteries.every(lottery => {
    return (
      typeof lottery === 'object' &&
      'id' in lottery &&
      'title' in lottery &&
      'status' in lottery &&
      typeof lottery.title === 'string'
    );
  });
};

/**
 * Validates products data format
 */
export const validateProducts = (products: any[]): boolean => {
  if (!Array.isArray(products)) return false;
  
  return products.every(product => {
    return (
      typeof product === 'object' &&
      'id' in product &&
      'name' in product &&
      'price' in product &&
      typeof product.name === 'string' &&
      typeof product.price === 'number'
    );
  });
};

/**
 * Shows validation errors as toast messages and returns validation result
 */
export const showValidationErrors = (isValid: boolean, entityName: string): boolean => {
  if (!isValid) {
    console.error(`${entityName} validation failed`);
    toast.error(`Validation des ${entityName}s a échoué. Vérifiez le format de vos données.`);
    return false;
  }
  return true;
};
