import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// Type definition for final response (order data with product details in array)
export interface OrderData {
  id: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'payment_processing' | 'payment_success' | 'payment_failed' | 'refund_processing' | 'refunded';
  createdAt: string;
  items: OrderItem[]; // Array of product details
}

// Type definition for product data per order
interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Type definition for result records from table join of orders and order_items
interface OrderJoinRecord {
  id: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'payment_processing' | 'payment_success' | 'payment_failed' | 'refund_processing' | 'refunded';
  createdAt: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Get order data
export async function GET(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get orders and order details associated with user ID
    const ordersData = await executeQuery<OrderJoinRecord>(`
      SELECT
        o.id AS id,
        o.total_price AS totalPrice,
        o.status AS status,
        o.payment_status AS paymentStatus,
        o.created_at AS createdAt,
        oi.product_name AS productName,
        oi.quantity AS quantity,
        oi.unit_price AS unitPrice
      FROM orders AS o
      JOIN order_items AS oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, oi.id ASC;`,
      [user.userId]
    );

    // Use Map object (key & value pairs) to group product data by order
    const ordersMap = new Map<number, OrderData>();
    ordersData.forEach((row: OrderJoinRecord) => {
      if (!ordersMap.has(row.id)) { // If not registered in ordersMap
        // Register new ID in ordersMap
        ordersMap.set(row.id, {
          id: row.id,
          totalPrice: row.totalPrice,
          status: row.status,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          items: [] // Initialize items array as empty
        });
      }

      // Add current record's product details to items array
      ordersMap.get(row.id)!.items.push({
        productName: row.productName,
        quantity: row.quantity,
        unitPrice: row.unitPrice
      });
    });

    // Create array with only values from ordersMap and return as final order list
    const orders = Array.from(ordersMap.values());
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Order retrieval error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}

