
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

