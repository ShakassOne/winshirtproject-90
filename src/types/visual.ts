
export interface Visual {
  id: number;
  name: string;
  description?: string;
  image: string; // Used in the application (maps to image_url in Supabase)
  categoryId?: number;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface VisualCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  createdAt?: string; // Now standardized as timestamp with time zone in DB
  updatedAt?: string; // Now standardized as timestamp with time zone in DB
}

export interface ProductVisualSettings {
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  scale?: number;
  rotation?: number;
  printAreaId?: number;
  visualId?: number;
  colorMode?: 'original' | 'monochrome' | 'custom';
  customColor?: string;
  opacity?: number;
  effects?: string[];
}
