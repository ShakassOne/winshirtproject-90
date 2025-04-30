
// Define delivery status types
export type DeliveryStatus = 
  | 'preparing'
  | 'ready_to_ship'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

// Define delivery history entry
export interface DeliveryHistoryEntry {
  timestamp: string;
  type: string;
  description: string;
  location?: string;
}

// Define order item interface
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  customization?: any;
  visualDesign?: any;
  lotteriesEntries?: number[];
  created_at?: string;
}

// Define shipping information interface
export interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  method?: string;
  cost?: number;
}

// Define payment information interface
export interface PaymentInfo {
  method: string;
  status: string;
  transactionId?: string;
  date?: string;
  amount?: number;
}

// Define delivery information interface
export interface DeliveryInfo {
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
}

// Define order interface
export interface Order {
  id: number;
  userId?: number;
  clientName: string;
  clientEmail: string;
  status: string;
  total: number;
  subtotal?: number;
  shipping?: ShippingInfo;
  payment?: PaymentInfo;
  delivery?: DeliveryInfo;
  items: OrderItem[];
  orderDate: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  tracking_number?: string;
  invoice_url?: string;
}
