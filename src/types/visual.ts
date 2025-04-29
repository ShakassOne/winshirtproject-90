
export interface Visual {
  id: number;
  name: string;
  description?: string;
  image: string; // Pour l'application
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVisualSettings {
  position?: {
    x: number;
    y: number;
  };
  scale?: number;
  rotation?: number;
  printAreaId?: number;
  colorMode?: 'original' | 'monochrome' | 'custom';
  customColor?: string;
  opacity?: number;
  effects?: string[];
}
