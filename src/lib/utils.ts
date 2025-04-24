
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a localized date string
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Determines if a color is light or dark
 * @param color - CSS color string (hex, rgb, etc.)
 * @returns boolean - true if the color is light, false if dark
 */
export function isLightColor(color: string): boolean {
  // For hex colors
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    
    // Calculate perceived brightness
    // Using relative luminance formula: 0.299*R + 0.587*G + 0.114*B
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if color is light (brightness > 128)
    return brightness > 128;
  }
  
  // For named colors like 'white', 'black', etc.
  // Simple check based on common light colors
  const lightColors = ['white', 'ivory', 'snow', 'azure', 'beige', 'bisque', 'blanchedalmond', 
                      'cornsilk', 'floralwhite', 'ghostwhite', 'honeydew', 'lavenderblush', 
                      'lemonchiffon', 'lightcyan', 'lightgoldenrodyellow', 'lightgrey', 
                      'lightpink', 'lightyellow', 'linen', 'mintcream', 'mistyrose', 'seashell', 'yellow'];
                      
  return lightColors.includes(color.toLowerCase());
}
