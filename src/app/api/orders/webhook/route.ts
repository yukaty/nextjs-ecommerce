import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrder } from '@/app/api/orders/orderService';

// Get Stripe secret key and webhook secret from environment variables
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!SECRET_KEY) throw new Error('Environment variable STRIPE_SECRET_KEY is not set.');
if (!STRIPE_WEBHOOK_SECRET) throw new Error('Environment variable STRIPE_WEBHOOK_SECRET is not set.');

// Initialize Stripe
const stripe = new Stripe(SECRET_KEY, {
  apiVersion: '2025-07-30.basil', // Specify latest API version
});

// Process webhook events
export async function POST(request: NextRequest) {
  const requestBody = await request.text();
  // Signature data from Stripe
  const signature = request.headers.get('stripe-signature') as string;
  // Stripe event object
  let event: Stripe.Event;

  try { // Wait for payment completion event from webhook
    event = stripe.webhooks.constructEvent(
      requestBody,
      signature ?? '',
      STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return NextResponse.json({ message: 'Webhook signature verification failed.' }, { status: 400 });
  }

  // If checkout session completion event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Checkout session completed:', session);

    // Assumes order ID and user ID are included in metadata
    const sessionId = session.id;
    const orderId = session.metadata?.orderId;
    const userId: string = session.metadata?.userId ?? '';
    if (!sessionId || !orderId || !userId) {
      console.error('Webhook does not contain necessary metadata.');
      return NextResponse.json({ message: 'Order information is missing.' }, { status: 400 });
    }

    try {
      // Register order data
      await updateOrder(Number(userId), Number(orderId), 'completed', 'payment_success');
    } catch (err) {
      console.error('Order status update error:', err);
      return NextResponse.json({ message: 'Failed to update order status.' }, { status: 500 });
    }
  }

  // Notify webhook reception (send regardless of processing success/failure)
  return NextResponse.json({ received: true }, { status: 200 });
}

