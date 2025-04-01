
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  lotteriesEntries?: number[];
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    method: string;
    cost: number;
  };
  payment: {
    method: string;
    transactionId?: string;
    status: 'pending' | 'completed' | 'failed';
  };
  subtotal: number;
  total: number;
  trackingNumber?: string;
  notes?: string;
  invoiceUrl?: string;
}

export interface AdminSettings {
  notificationEmails: string[];
  autoDrawEnabled: boolean;
  securityOptions: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
  };
  stripeSettings: {
    liveMode: boolean;
    webhookEnabled: boolean;
  };
  generalSettings: {
    currency: string;
    language: string;
    orderPrefix: string;
  };
}
