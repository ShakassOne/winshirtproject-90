
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type DeliveryStatus = 'preparing' | 'ready_to_ship' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';

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
  visualDesign?: {
    visualId: number;
    visualName: string;
    visualImage: string;
    settings?: {
      position?: {
        x: number;
        y: number;
      };
      size?: {
        width: number;
        height: number;
      };
      opacity?: number;
    };
    printAreaId?: number | null;
  } | null;
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
  delivery: {
    status: DeliveryStatus;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    deliveryInstructions?: string;
    signatureRequired?: boolean;
    lastUpdate?: string;
    history?: DeliveryHistoryEntry[];
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

export interface DeliveryHistoryEntry {
  date: string;
  status: DeliveryStatus;
  location?: string;
  description: string;
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
  deliverySettings: {
    defaultCarriers: string[];
    defaultHandlingTime: number;
    freeShippingThreshold: number;
    internationalShipping: boolean;
    defaultShippingRates: {
      national: {
        standard: number;
        express: number;
      };
      international: {
        standard: number;
        express: number;
      };
    };
  };
}
