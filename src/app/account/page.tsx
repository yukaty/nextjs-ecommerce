'use client'; // Runs on client (browser) side

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

// My Page
export default function AccountPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  // Clear cart on successful payment
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  // Common menu item styles
  const menuItemStyle = "w-full flex items-center px-4 pt-4 border border-gray-300 rounded shadow-lg hover:ring-2 hover:ring-brand-200 hover:shadow-xl hover:bg-gray-100";

  // Set message based on query parameters
  const message =
    searchParams.get('edited') ? 'Member information has been updated.' :
    searchParams.get('password-changed') ? 'Password has been changed.' :
    null;

  return (
    <>
      {sessionId && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex flex-col items-center justify-center mb-6 rounded-md">
          <p className="text-xl font-bold mt-4">Thank you for your order!</p>
          <p>Please wait while your products are being delivered.</p>
        </div>
      )}
      {message && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex items-center justify-center">
          {message}
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-center mb-8">My Page</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link href="/account/edit" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Edit Member Information</h2>
              <p className="text-gray-600">You can edit your name and email address</p>
            </div>
          </Link>

          <Link href="/account/password" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Change Password</h2>
              <p className="text-gray-600">You can change your password</p>
            </div>
          </Link>

          <Link href="/account/orders" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Order History</h2>
              <p className="text-gray-600">You can check your order history</p>
            </div>
          </Link>

          <Link href="/account/favorites" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Check Favorite Products</h2>
              <p className="text-gray-600">You can check your favorite products</p>
            </div>
          </Link>

          <form method="POST" action="/api/auth/logout">
            <button type="submit" className={menuItemStyle}>
              <div className="flex flex-col text-left">
                <h2 className="mt-0 font-medium">Logout</h2>
                <p className="text-gray-600">Log out of your account</p>
              </div>
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

