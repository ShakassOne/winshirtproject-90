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
}

// Export the VisualCategory type
export interface VisualCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
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
