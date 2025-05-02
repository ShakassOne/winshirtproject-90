
import { OrderItem } from './order';

export interface CheckoutFormData {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    createAccount: boolean;
    password?: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: {
    cardHolder: string;
    savePaymentInfo: boolean;
  };
  shippingMethod: string;
  orderNotes?: string;
}

export interface StripeCheckoutSuccess {
  success: true;
  url?: string;
  orderId?: number;
}

export interface StripeCheckoutError {
  success: false;
  error: string;
}

export type StripeCheckoutResult = StripeCheckoutSuccess | StripeCheckoutError;

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  totalItems: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  default?: boolean;
}
