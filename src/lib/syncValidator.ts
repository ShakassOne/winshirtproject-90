
/**
 * Show validation errors as toast messages
 * @param validationResult The validation result object
 * @param entityName The name of the entity being validated (for display purposes)
 * @returns Boolean indicating if validation passed
 */
export const showValidationErrors = (validationResult: any, entityName: string = 'Item'): boolean => {
  // If no validation result or validation passed
  if (!validationResult || validationResult.valid) {
    return true;
  }
  
  // Show errors in toast messages
  if (validationResult.errors && validationResult.errors.length > 0) {
    // Display the first error message
    console.error(`Validation error for ${entityName}:`, validationResult.errors[0]);
    return false;
  }
  
  return true;
};

/**
 * Validate products before syncing to Supabase
 * @param products Array of products to validate
 * @returns Validation result object
 */
export const validateProducts = (products: any[]) => {
  const errors = [];
  
  // Validate each product
  for (const product of products) {
    // Required fields check
    if (!product.name) {
      errors.push(`Product ID ${product.id || 'unknown'} is missing a name`);
    }
    
    if (!product.price && product.price !== 0) {
      errors.push(`Product ${product.name || `ID ${product.id || 'unknown'}`} is missing a price`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate visuals before syncing to Supabase
 * @param visuals Array of visuals to validate
 * @returns Validation result object
 */
export const validateVisuals = (visuals: any[]) => {
  const errors = [];
  
  // Validate each visual
  for (const visual of visuals) {
    // Required fields check
    if (!visual.name) {
      errors.push(`Visual ID ${visual.id || 'unknown'} is missing a name`);
    }
    
    if (!visual.image && !visual.image_url) {
      errors.push(`Visual ${visual.name || `ID ${visual.id || 'unknown'}`} is missing an image`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
