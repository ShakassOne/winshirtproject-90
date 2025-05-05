
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
  participants: Participant[]; // Add participants array to match with ExtendedLottery type
}
