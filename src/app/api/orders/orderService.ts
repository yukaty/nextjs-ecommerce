import { executeQuery } from '@/lib/db';
import { CartItem } from '@/hooks/useCart';
import { type ResultSetHeader } from 'mysql2/promise';

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
      `SELECT name, stock FROM products WHERE id = ? LIMIT 1;`,
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
export async function createOrder(userId: number, cartItems: CartItem[], address: string, totalPrice: number): Promise<number> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) throw new Error('Cart is empty.');
  if (!address?.trim()) throw new Error('Shipping address is not entered.');
  if (isNaN(totalPrice) || totalPrice <= 0) throw new Error('Total amount is invalid.');

  // Add order information to orders table
  const result = await executeQuery<{ insertId: number }>(`
    INSERT INTO orders (user_id, total_price, status, payment_status, shipping_address)
    VALUES (?, ?, 'pending', 'unpaid', ?);`,
    [userId, totalPrice, address]
  ) as unknown as ResultSetHeader; // Type conversion to single object
  // Get the order ID of the added data
  const orderId = result.insertId;
  if (!orderId) throw new Error('Failed to register order.');

  // Add order details to order_items table
  for (const product of cartItems) {
    await executeQuery(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?);`,
      [orderId, product.id, product.title, product.quantity, product.price]);
  }

  // Return order ID
  return orderId;
}

// Update order data for specified ID
export async function updateOrder(userId: number, orderId: number, status?: OrderStatus, paymentStatus?: PaymentStatus) {
  if (!userId) throw new Error('Not authenticated.');
  if (!orderId) throw new Error('Order ID is required.');

  // Assemble columns and values to update
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (status) { // Update order status
    fields.push('status = ?');
    values.push(status);
  }
  if (paymentStatus) { // Update payment status
    fields.push('payment_status = ?');
    values.push(paymentStatus);
  }

  if (fields.length === 0) return; // No update target

  // Add order ID and user ID to specify in WHERE clause
  values.push(orderId, userId);

 // Update order information in orders table
  const result = await executeQuery(`
    UPDATE orders
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ? AND payment_status != 'payment_success';`,
    values
  ) as unknown as ResultSetHeader; // Type conversion to single object

  // Update product stock and sales count if payment successful and order data update successful
  if (paymentStatus === 'payment_success' && result.affectedRows > 0) {
    // Get product IDs and order quantities associated with order ID
    const orderItems = await executeQuery<{ product_id: number; quantity: number }>(
      `SELECT product_id, quantity FROM order_items WHERE order_id = ?;`,
      [orderId]
    );

    // Update stock and sales count of purchased products sequentially
    for (const item of orderItems) {
      await executeQuery(`
        UPDATE products
        SET stock = stock - ?, sales_count = sales_count + ?, updated_at = NOW()
        WHERE id = ?;`,
        [item.quantity, item.quantity, item.product_id]
      );
    }
  }
}