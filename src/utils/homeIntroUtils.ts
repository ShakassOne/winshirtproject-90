
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
  return slides.find(slide => slide.id === stringId);
};

// Get the highest order value from slides
export const getMaxOrder = (slides: SlideType[]): number => {
  if (!slides.length) return 0;
  
  const maxOrder = Math.max(...slides
    .filter(slide => slide.order !== undefined)
    .map(slide => slide.order as number));
  
  return isNaN(maxOrder) ? 0 : maxOrder;
};
