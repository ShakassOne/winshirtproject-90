
import { Participant } from './lottery';

export interface PrintArea {
  id: number;
  position: "front" | "back";
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  format?: string;
  allowCustomPosition?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: string[];
  colors?: string[];
  type?: string;
  productType?: string;
}

export interface ProductFilters {
  categories: string[];
  price: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  // Additional properties needed for AdvancedFilters
  productTypes: string[];
  sleeveTypes: string[];
  genders: string[];
  materials: string[];
  fits: string[];
  brands: string[];
}

export interface ExtendedProduct extends Product {
  secondaryImage?: string;
  sleeveType?: string;
  linkedLotteries?: number[];
  popularity?: number;
  tickets?: number;
  weight?: number;
  deliveryPrice?: number;
  allowCustomization?: boolean;
  defaultVisualId?: number;
  defaultVisualSettings?: any;
  visualCategoryId?: number;
  printAreas?: PrintArea[];
  brand?: string;
  fit?: string;
  gender?: string;
  material?: string;
  participants: Participant[];
  lotteryName?: string;
  lotteryImage?: string;
  deliveryInfo?: any;
}
