'use client'; // Runs on client (browser) side

import Link from 'next/link';
import { useCart, CartItem } from '@/hooks/useCart';
import CartItemCard from '@/components/CartItemCard';

// Cart page
export default function CartPage() {
  // Get cart information and control functions
  const { cartItems, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-center mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/products" className="text-brand-600 hover:underline">← Back to Products</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-6">
            {cartItems.map((item: CartItem) => (
              <CartItemCard
                key={item.id}
                item={item}
                isEditable
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center border-t border-gray-300 pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-bold">Total: ${totalPrice.toLocaleString()}</p>
              <p className="text-gray-500">*All prices include tax.</p>
            </div>
            <Link
              href="/order-confirm"
              className="bg-brand-500 hover:bg-brand-600 text-white py-2 px-6 rounded"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

