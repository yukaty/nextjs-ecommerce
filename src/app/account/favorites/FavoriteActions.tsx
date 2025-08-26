'use client';

import { useCart, CartItem } from '@/hooks/useCart';
import { type ProductData } from '@/types/product';

type Product = Pick<ProductData, 'id' | 'name' | 'price' | 'image_url'>;

interface FavoriteActionsProps {
  product: Product;
  onRemove: () => void;
}

export default function FavoriteActions({ product, onRemove }: FavoriteActionsProps) {
  const { addItem } = useCart();

  // Event handler for cart button click
  const handleCart = () => {
    const cartItem: CartItem = {
      id: product.id.toString(),
      title: product.name,
      price: product.price,
      imageUrl: product.image_url ?? '',
      quantity: 1
    };
    addItem(cartItem);
  };

  // Event handler for remove favorite button click
  const handleRemoveFavorite = async () => {
    if (!confirm('Are you sure you want to remove this item from favorites?')) return;

    try {
      const response = await fetch(`/api/favorites/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to remove from favorites.');
        return;
      }

      onRemove(); // Call parent callback to refresh the list
    } catch (error) {
      console.error('Remove from favorites error:', error);
      alert('Failed to remove from favorites.');
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleCart}
        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-sm font-semibold"
      >
        Add to Cart
      </button>
      <button
        onClick={handleRemoveFavorite}
        className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-sm"
      >
        Remove
      </button>
    </div>
  );
}