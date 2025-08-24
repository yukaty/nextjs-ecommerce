'use client'; // Runs on the client (browser) side

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/hooks/useCart';
import { type ProductData } from '@/types/product';

// Product data type definition
type Product = Pick<ProductData, 'id' | 'name' | 'price' | 'image_url'>;

// Favorites list page
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { addItem, isInCart } = useCart();

  // Get favorites list
  useEffect(() => {
    const getFavorites = async () => {
      try {
        const res = await fetch('/api/favorites', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch favorites list.');
        const data: Product[] = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error(err);
      }
    };
    // Fetch favorites list data
    getFavorites();
  }, []);

  // Event handler for cart button click
  const handleCart = (item: Product) => {
    const cartItem: CartItem = {
      id: item.id.toString(),
      title: item.name,
      price: item.price,
      imageUrl: item.image_url ?? '',
      quantity: 1
    };
    addItem(cartItem);
  };

  // Event handler for remove favorite button click
  const handleRemoveFavorite = async (productId: number) => {
    if (!confirm('Are you sure you want to remove this item from favorites?')) return;

    try { // Send DELETE request to favorites removal API
      const res = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        // Remove the corresponding product from state on success
        setFavorites((prev) => prev.filter((item) => item.id !== productId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to remove from favorites.');
      }
    } catch (err) {
      console.error('Favorite removal error:', err);
      alert('Communication error occurred.');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="my-4">
        <Link href="/account" className="text-brand-600 hover:underline">
          ← Back to My Page
        </Link>
      </div>
      <h1 className="text-center mb-6">Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No favorite products found.</p>
          <Link href="/products" className="text-brand-600 hover:underline">← Browse products to find favorites</Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {favorites.map((item) => (
            <div key={item.id} className="flex items-center gap-6 border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
              <Link href={`/products/${item.id}`} className="flex-shrink-0">
                <Image
                  src={item.image_url ? `/uploads/${item.image_url}` : '/images/no-image.jpg'}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-contain mb-4"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between gap-4">
                <h2 className="text-xl">{item.name}</h2>
                <p className="text-brand-600 font-bold text-lg">
                  ${item.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-500"> (tax included)</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-8">
                <button
                    onClick={!isInCart(item.id.toString()) ? () => handleCart(item) : undefined}
                    disabled={isInCart(item.id.toString())}
                    className={`py-2 px-4 rounded-sm min-w-[150px] ${
                    isInCart(item.id.toString())
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-brand-500 hover:bg-brand-600 text-white'
                    }`}
                >
                    {isInCart(item.id.toString()) ? 'Added' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => handleRemoveFavorite(item.id)}
                  className="py-2 px-4 rounded-sm min-w-[150px] bg-brand-500 hover:bg-rose-600 text-white"
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

