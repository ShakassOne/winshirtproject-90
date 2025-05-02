
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a snake_case string to camelCase
 * @param str The snake_case string to convert
 * @returns The camelCase string
 */
export const snakeToCamel = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Converts an object with snake_case keys to camelCase keys
 * @param obj The object with snake_case keys
 * @returns The object with camelCase keys
 */
export function snakeToCamelObject<T extends object>(obj: T): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamelObject(item));
  }
  
  return Object.keys(obj).reduce((result, key) => {
    const camelKey = snakeToCamel(key);
    const value = obj[key as keyof T];
    result[camelKey] = typeof value === 'object' ? snakeToCamelObject(value) : value;
    return result;
  }, {} as any);
}

/**
 * Converts a camelCase string to snake_case
 * @param str The camelCase string to convert
 * @returns The snake_case string
 */
export const camelToSnake = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Converts an object with camelCase keys to snake_case keys
 * @param obj The object with camelCase keys
 * @returns The object with snake_case keys
 */
export function camelToSnakeObject<T extends object>(obj: T): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnakeObject(item));
  }
  
  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = camelToSnake(key);
    const value = obj[key as keyof T];
    result[snakeKey] = typeof value === 'object' ? camelToSnakeObject(value) : value;
    return result;
  }, {} as any);
}

/**
 * Determine if a color is light
 * @param color The color in hex format
 * @returns Boolean indicating if the color is light
 */
export function isLightColor(color: string): boolean {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  
  // Calculate luminance - https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if color is light
  return luminance > 0.5;
}
