
export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  secondaryImage?: string;
  price: number;
  productType: string;
  weight?: number;
  deliveryPrice?: number;
  sizes?: string[];
  colors?: string[];
  tickets?: number;
  allowCustomization?: boolean;
  visualCategoryId?: number | null;
  defaultVisualId?: number | null;
  defaultVisualSettings?: any;
  printAreas?: PrintArea[];
  attributes?: { [key: string]: any };
}

export interface PrintArea {
  id?: number;
  name: string;
  format: "custom";
  position: "front" | "back";
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  allowCustomPosition: boolean;
  [key: string]: any;
}

export interface ExtendedProduct extends Product {
  // Propriétés supplémentaires pour les produits étendus (ajoutées côté client)
  linkedLotteries?: string[];
}
