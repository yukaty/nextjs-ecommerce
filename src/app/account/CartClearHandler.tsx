'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

interface CartClearHandlerProps {
  sessionId: string | null;
}

export default function CartClearHandler({ sessionId }: CartClearHandlerProps) {
  const { clearCart } = useCart();

  // Clear cart on successful payment
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return null; // This component doesn't render anything
}