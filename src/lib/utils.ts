
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
