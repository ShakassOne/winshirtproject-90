
export interface ExtendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  type?: string; // Quality type: entry level, standard, premium
  productType?: string; // T-shirts, sweatshirt, polo
  sleeveType?: string; // courtes ou longues
  linkedLotteries?: number[];
  lotteryName?: string;
  lotteryImage?: string;
  popularity?: number;
}
