import { NextResponse } from 'next/server';
import { executeQuery, TABLES } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import { OrderData, OrderJoinRecord } from '@/types/orders';

// Get order data
export async function GET() {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get orders and order details associated with user ID
    const ordersData = await executeQuery<OrderJoinRecord>(`
      SELECT
        o.id AS id,
        o.total_amount AS totalAmount,
        o.status AS status,
        o.payment_status AS paymentStatus,
        o.created_at AS createdAt,
        oi.product_name AS productName,
        oi.quantity AS quantity,
        oi.unit_price AS unitPrice
      FROM ${TABLES.orders} AS o
      JOIN ${TABLES.order_items} AS oi ON o.id = oi.order_id
      WHERE o.user_id = $1
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
          totalAmount: Number(row.totalamount),
          status: row.status,
          paymentStatus: row.paymentstatus,
          createdAt: row.createdat,
          items: [] // Initialize items array as empty
        });
      }

      // Add current record's product details to items array
      ordersMap.get(row.id)!.items.push({
        productName: row.productname,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unitprice)
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

