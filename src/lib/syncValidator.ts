
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';

/**
 * Validates product data before syncing with Supabase
 * @param products Array of products to validate
 * @returns Object containing validation status and any invalid items
 */
export const validateProducts = (products: ExtendedProduct[]) => {
  const invalidProducts: {id: number, reason: string}[] = [];
  
  products.forEach(product => {
    // Check required fields
    if (!product.name) {
      invalidProducts.push({id: product.id, reason: 'Missing name'});
    }
    if (product.price === undefined || product.price === null) {
      invalidProducts.push({id: product.id, reason: 'Missing price'});
    }
    if (!product.image) {
      invalidProducts.push({id: product.id, reason: 'Missing image URL'});
    }
  });
  
  return {
    isValid: invalidProducts.length === 0,
    invalidItems: invalidProducts
  };
};

/**
 * Validates lottery data before syncing with Supabase
 * @param lotteries Array of lotteries to validate
 * @returns Object containing validation status and any invalid items
 */
export const validateLotteries = (lotteries: ExtendedLottery[]) => {
  const invalidLotteries: {id: number, reason: string}[] = [];
  
  lotteries.forEach(lottery => {
    // Check required fields
    if (!lottery.title) {
      invalidLotteries.push({id: lottery.id, reason: 'Missing title'});
    }
    if (lottery.value === undefined || lottery.value === null) {
      invalidLotteries.push({id: lottery.id, reason: 'Missing value'});
    }
    if (!lottery.image) {
      invalidLotteries.push({id: lottery.id, reason: 'Missing image URL'});
    }
  });
  
  return {
    isValid: invalidLotteries.length === 0,
    invalidItems: invalidLotteries
  };
};

/**
 * Validates visuals data before syncing with Supabase
 * @param visuals Array of visuals to validate
 * @returns Object containing validation status and any invalid items
 */
export const validateVisuals = (visuals: any[]) => {
  const invalidVisuals: {id: number, reason: string}[] = [];
  
  visuals.forEach(visual => {
    // Check required fields
    if (!visual.name) {
      invalidVisuals.push({id: visual.id, reason: 'Missing name'});
    }
    // Image validation - Critical because of not-null constraint
    if (!visual.image && !visual.image_url) {
      invalidVisuals.push({id: visual.id, reason: 'Missing image URL'});
    }
  });
  
  return {
    isValid: invalidVisuals.length === 0,
    invalidItems: invalidVisuals
  };
};

/**
 * Shows validation errors as toast notifications
 * @param validationResult Result of validation
 * @param entityType Type of entity being validated (product, lottery, etc.)
 */
export const showValidationErrors = (
  validationResult: { isValid: boolean, invalidItems: {id: number, reason: string}[] },
  entityType: string
) => {
  if (!validationResult.isValid) {
    validationResult.invalidItems.forEach(item => {
      toast.error(`${entityType} ID ${item.id}: ${item.reason}`, { 
        position: "bottom-right",
        duration: 5000
      });
    });
    
    return false;
  }
  
  return true;
};
