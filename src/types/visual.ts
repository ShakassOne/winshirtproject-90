
export interface Visual {
  id: number;
  name: string;
  image: string;
  categoryId?: number;
  categoryName?: string;
  tags?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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
  scale?: number;
  rotation?: number;
  positionX?: number;
  positionY?: number;
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  colorFilter?: string;
  // Add these properties to match how VisualPositioner is using them
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  visualId?: number;
}
