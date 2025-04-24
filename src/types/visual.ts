
export interface Visual {
  id: number;
  name: string;
  description?: string;
  image: string;
  categoryId: number;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisualCategory {
  id: number;
  name: string;
  description?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVisualSettings {
  visualId: number | null;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  opacity: number;
  
  // Make it compatible with JSON by adding an index signature
  [key: string]: any;
}
