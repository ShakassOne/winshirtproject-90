
/**
 * Utility functions for data validation and type checking
 */
import { ExtendedProduct } from '@/types/product';
import { Visual, VisualCategory } from '@/types/visual';
import { toast } from '@/lib/toast';

/**
 * Validates a product to ensure it has all required fields with proper types
 */
export const validateProduct = (product: Partial<ExtendedProduct>): string | null => {
  if (!product) return "Le produit est manquant";
  if (!product.name || product.name.trim() === '') return "Le nom du produit est requis";
  if (product.price === undefined || isNaN(Number(product.price))) return "Le prix du produit est invalide";
  return null;
};

/**
 * Validates a visual to ensure it has all required fields with proper types
 */
export const validateVisual = (visual: Partial<Visual>): string | null => {
  if (!visual) return "Le visuel est manquant";
  if (!visual.name || visual.name.trim() === '') return "Le nom du visuel est requis";
  if (!visual.image || visual.image.trim() === '') return "L'image du visuel est requise";
  return null;
};

/**
 * Validates a visual category to ensure it has all required fields
 */
export const validateVisualCategory = (category: Partial<VisualCategory>): string | null => {
  if (!category) return "La catégorie est manquante";
  if (!category.name || category.name.trim() === '') return "Le nom de la catégorie est requis";
  return null;
};

/**
 * Type check function to ensure all required fields are present and have correct types
 * This can be used during development to catch issues early
 */
export const typeCheckEntity = <T>(
  entity: any, 
  requiredFields: {[key: string]: string}, 
  entityName: string
): T | null => {
  const missingFields: string[] = [];
  const invalidTypes: {field: string, expectedType: string, actualType: string}[] = [];
  
  Object.entries(requiredFields).forEach(([field, type]) => {
    // Check if field exists
    if (entity[field] === undefined) {
      missingFields.push(field);
    } 
    // Check if field has correct type
    else if (typeof entity[field] !== type) {
      invalidTypes.push({
        field,
        expectedType: type,
        actualType: typeof entity[field]
      });
    }
  });
  
  if (missingFields.length > 0 || invalidTypes.length > 0) {
    console.error(`Type checking failed for ${entityName}:`, {
      missingFields,
      invalidTypes,
      entity
    });
    
    // In development environment, show toasts for type errors
    if (import.meta.env.DEV) {
      if (missingFields.length > 0) {
        toast.error(`Champs manquants: ${missingFields.join(', ')}`, { position: "bottom-right" });
      }
      if (invalidTypes.length > 0) {
        toast.error(`Types incorrects: ${invalidTypes.map(i => `${i.field} (attendu: ${i.expectedType})`).join(', ')}`, { position: "bottom-right" });
      }
    }
    
    return null;
  }
  
  return entity as T;
};
