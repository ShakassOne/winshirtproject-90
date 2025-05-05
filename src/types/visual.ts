
// Export the Visual type
export interface Visual {
  id: number;
  name: string;
  description?: string;
  image: string;
  category_id?: number;
  category_name?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  image_url?: string; // For compatibility with Supabase schema

  // Add camelCase aliases for frontend usage
  categoryId?: number;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

// Export the VisualCategory type
export interface VisualCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  
  // Add camelCase aliases for frontend usage
  createdAt?: string;
  updatedAt?: string;
}

// Add exportable type for VisualSelection
export interface VisualSelection {
  visualId: number;
  visualName: string;
  visualImage: string;
  position?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

// Add ProductVisualSettings type that was missing
export interface ProductVisualSettings {
  visualId?: number | null;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  opacity?: number;
  scale?: number;
  rotation?: number;
}
