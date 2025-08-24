import { executeQuery, TABLES } from '@/lib/db';
import { CartItem } from '@/hooks/useCart';

// Order status
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
// Payment status
type PaymentStatus = 'unpaid' | 'payment_processing' | 'payment_success' | 'payment_failed' | 'refund_processing' | 'refunded';

// Stock check before order confirmation
export async function checkStock(cartItems: CartItem[]): Promise<string[]> {
  // List of shortage items
  const shortageItems: string[] = [];

  // Check all items sequentially
  for (const item of cartItems) {
    const result = await executeQuery<{ name: string, stock: number }>(
      `SELECT name, stock FROM ${TABLES.products} WHERE id = $1 LIMIT 1`,
      [item.id]
    );
    const product = result[0];
    // Add to shortage list if product doesn't exist or insufficient stock
    if (!product || (product.stock ?? 0) < item.quantity) {
      shortageItems.push(product?.name || `ID:${item.id}`);
    }
  }

  // Return shortage list (empty array if none)
  return shortageItems;
}

// Register new order data
export async function createOrder(userId: number, cartItems: CartItem[], address: string, totalAmount: number): Promise<number> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) throw new Error('Cart is empty.');
  if (!address?.trim()) throw new Error('Shipping address is not entered.');
  if (isNaN(totalAmount) || totalAmount <= 0) throw new Error('Total amount is invalid.');

  // Add order information to orders table
  const result = await executeQuery<{ id: number }>(`
    INSERT INTO ${TABLES.orders} (user_id, total_amount, status, payment_status, shipping_address)
    VALUES ($1, $2, 'pending', 'unpaid', $3) RETURNING id;`,
    [userId, totalAmount, address]
  );
  // Get the order ID of the added data
  const orderId = result[0]?.id;
  if (!orderId) throw new Error('Failed to register order.');

  // Add order details to order_items table
  for (const product of cartItems) {
    await executeQuery(`
      INSERT INTO ${TABLES.order_items} (order_id, product_id, product_name, quantity, unit_price)
      VALUES ($1, $2, $3, $4, $5);`,
      [orderId, product.id, product.title, product.quantity, product.price]);
  }

  // Return order ID
  return orderId;
}

// Update order data for specified ID
export async function updateOrder(userId: number, orderId: number, status?: OrderStatus, paymentStatus?: PaymentStatus) {
  if (!userId || isNaN(userId)) throw new Error('User ID is invalid.');
  if (!orderId || isNaN(orderId)) throw new Error('Order ID is invalid.');

  // Assemble columns and values to update
  const fields: string[] = [];
  const values: (string | number)[] = [];

  let paramIndex = 1;
  if (status) { // Update order status
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (paymentStatus) { // Update payment status
    fields.push(`payment_status = $${paramIndex++}`);
    values.push(paymentStatus);
  }

  if (fields.length === 0) return; // No update target

  // Add order ID and user ID to specify in WHERE clause
  values.push(orderId, userId);

 // Update order information in orders table
  const result = await executeQuery(`
    UPDATE ${TABLES.orders}
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex++} AND user_id = $${paramIndex} AND payment_status != 'payment_success';`,
    values
  );

  // Update product stock and sales count if payment successful and order data update successful
  if (paymentStatus === 'payment_success' && result.affectedRows! > 0) {
    // Get product IDs and order quantities associated with order ID
    const orderItems = await executeQuery<{ product_id: number; quantity: number }>(
      `SELECT product_id, quantity FROM ${TABLES.order_items} WHERE order_id = $1`,
      [orderId]
    );

    // Update stock and sales count of purchased products sequentially
    for (const item of orderItems) {
      await executeQuery(`
        UPDATE ${TABLES.products}
        SET stock = stock - $1, sales_count = sales_count + $2, updated_at = NOW()
        WHERE id = $3`,
        [item.quantity, item.quantity, item.product_id]
      );
    }
  }
}