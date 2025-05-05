
// Define and export the Visual interface
export interface Visual {
  id: number;
  name: string;
  description?: string;
  image: string;
  imageUrl?: string; // For compatibility
  categoryId?: number | null;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// Define and export the VisualCategory interface
export interface VisualCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

// If this file doesn't exist yet, we'll create it
export interface ProductVisualSettings {
  scale?: number;
  position?: {
    x: number;
    y: number;
  };
  rotation?: number;
  color?: string;
  [key: string]: any; // Add index signature for flexibility with JSON data
}

// Add JSON type to handle Supabase JSON data
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
