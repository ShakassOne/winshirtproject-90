
import { CartItem } from './cart';

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  paymentMethod: 'card' | 'paypal';
  deliveryMethod: 'standard' | 'express';
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
}

export interface StripeCheckoutSuccess {
  success: true;
  orderId?: number;
  url?: string;
}

export interface StripeCheckoutError {
  success: false;
  error: string;
}

export type StripeCheckoutResult = StripeCheckoutSuccess | StripeCheckoutError;
