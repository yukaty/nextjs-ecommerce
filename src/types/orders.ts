// Order status types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'payment_processing' | 'payment_success' | 'payment_failed' | 'refund_processing' | 'refunded';

// Order item interface
export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Order data interface
export interface OrderData {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderItem[];
}

// Database join record interface (for internal queries)
export interface OrderJoinRecord {
  id: number;
  totalamount: number;
  status: OrderStatus;
  paymentstatus: PaymentStatus;
  createdat: string;
  productname: string;
  quantity: number;
  unitprice: number;
}