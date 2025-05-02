
// Import from product.d.ts instead of product.ts
import { ExtendedProduct } from './product';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  productId?: number;
  lotteryId?: number;
  lotteryName?: string;
  linkedLotteries?: number[];
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  calculateTotal: () => number;
}
