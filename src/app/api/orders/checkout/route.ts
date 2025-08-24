import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkStock, createOrder } from '@/app/api/orders/orderService';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import { CartItem } from '@/hooks/useCart';
import { executeQuery, TABLES } from '@/lib/db';

// Shipping cost
const SHIPPING_COST = 15;  // Fixed shipping cost

// Get Stripe secret key from environment variables
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!SECRET_KEY) throw new Error('Environment variable STRIPE_SECRET_KEY is not set.');

// Initialize Stripe
const stripe = new Stripe(SECRET_KEY, {
  apiVersion: '2025-07-30.basil', // Specify latest API version
});

// Create checkout session
export async function POST(request: NextRequest) {
  try {
    // Get cart information and delivery address from request body
    const { items, address }: {
      items: CartItem[];
      address: string;
    } = await request.json();

    // Stock check
    const shortageItems = await checkStock(items);
    if (shortageItems.length > 0) {
      return NextResponse.json({ message: `Items out of stock: ${shortageItems.join(', ')}` }, { status: 400 });
    }


   // Get product data saved in database
    const productIds = items.map(item => item.id);
    if (productIds.length === 0) {
      return NextResponse.json({ message: 'No products selected.' }, { status: 400 });
    }
    const placeholders = productIds.map((_, index) => `$${index + 1}`).join(','); // $1,$2,$3...
    const products = await executeQuery<{ id: number; name: string; price: number }>(`
      SELECT id, name, price
      FROM ${TABLES.products}
      WHERE id IN (${placeholders})
    `, productIds); // Get product data included in list collectively

    if (products.length === 0) {
      return NextResponse.json({ message: 'Products not found.' }, { status: 404 });
    }

    // Create Stripe line_items
    let totalPrice = 0; // Total amount
    const line_items = items.map(item => {

      // Calculate total amount on server side based on database information (tampering prevention)

      const product = products.find(p => p.id === Number(item.id));
      if (!product) throw new Error(`Product ID ${item.id} not found.`);

      // Calculate subtotal for each product and add to total amount
      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;

      return {
        price_data: {
          currency: 'cad',
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100), // Convert CAD to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost
    totalPrice += SHIPPING_COST;
    line_items.push({
      price_data: {
        currency: 'cad',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(SHIPPING_COST * 100), // Convert CAD to cents
      },
      quantity: 1,
    });

    // Get authenticated user
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    }


    // Overwrite price information in cart with database registration content (tampering prevention)
    const correctPriceItems = items.map(item => {
      const product = products.find(p => p.id === Number(item.id));
      if (!product) throw new Error(`Product ID ${item.id} not found.`);
      return { ...item, price: product.price };
    });

    // Temporarily register order data in database
    const orderId = await createOrder(user.userId, correctPriceItems, address, totalPrice);

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      customer_email: user.email || undefined,
      // Redirect destination on payment success
      success_url: `${process.env.BASE_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      // Redirect destination on payment cancellation
      cancel_url: `${process.env.BASE_URL}/order-confirm`,
      // Metadata
      metadata: {
        // Include order ID so orders can be identified in webhook
        orderId: orderId.toString(),
        userId: user.userId.toString()
      }
    });

    // Update order with stripe session ID
    await executeQuery(`
      UPDATE ${TABLES.orders}
      SET stripe_session_id = $1
      WHERE id = $2 AND user_id = $3;`,
      [checkoutSession.id, orderId, user.userId]
    );

    // Return Stripe URL to frontend
    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (err) {
    console.error('Order/payment processing error:', err);
    return NextResponse.json({ message: 'Failed to register order or process payment.' }, { status: 500 });
  }
}
