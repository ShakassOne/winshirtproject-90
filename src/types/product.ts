
export interface ExtendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  type?: string;
  linkedLotteries?: number[];
  lotteryName?: string;
  lotteryImage?: string;
  popularity?: number;
}
