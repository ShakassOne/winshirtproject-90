
import { SlideType } from '@/lib/supabase';

// Helper function to ensure all numeric IDs are consistently handled
export const ensureNumberId = (id: string | number): number => {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
};

// Helper function to ensure all string IDs are consistently handled
export const ensureStringId = (id: string | number): string => {
  if (typeof id === 'number') {
    return id.toString();
  }
  return id;
};

// Find a slide by ID with proper type handling
export const findSlideById = (slides: SlideType[], id: string | number): SlideType | undefined => {
  const stringId = ensureStringId(id);
  return slides.find(slide => ensureStringId(slide.id) === stringId);
};

// Get the highest order value from slides with robust type handling
export const getMaxOrder = (slides: SlideType[]): number => {
  if (!slides.length) return 0;
  
  const maxOrder = Math.max(...slides
    .map(slide => {
      // Ensure order is converted to a number, defaulting to 0 if undefined
      const order = slide.order ?? 0;
      return typeof order === 'string' ? parseInt(order, 10) : order;
    })
    .filter(order => !isNaN(order)));
  
  return maxOrder > 0 ? maxOrder : 0;
};
