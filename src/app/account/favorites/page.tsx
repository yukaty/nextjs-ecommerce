import Link from 'next/link';
import Image from 'next/image';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { executeQuery, TABLES } from '@/lib/db';
import { type ProductData } from '@/types/product';
import FavoriteActions from './FavoriteActions';

// Product data type definition
type Product = Pick<ProductData, 'id' | 'name' | 'price' | 'image_url'>;

// Favorites list page - Server Component
export default async function FavoritesPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login?redirect=/account/favorites');
  }

  // Fetch favorites directly from database
  const favorites = await executeQuery<Product>(`
    SELECT p.id, p.name, p.price, p.image_url
    FROM ${TABLES.favorites} f
    JOIN ${TABLES.products} p ON f.product_id = p.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
  `, [user.userId]);

  const refreshFavorites = async () => {
    'use server';
    redirect('/account/favorites');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="my-4">
        <Link href="/account" className="text-brand-800 hover:underline">
          ← Back to My Page
        </Link>
      </div>
      <h1 className="text-center mb-8">Favorite Products</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">No favorite products found.</p>
          <Link href="/products" className="text-brand-600 hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square relative">
                  <Image
                    src={`/uploads/${product.image_url}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-600 mb-2">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  ${Number(product.price).toFixed(2)}
                </p>
                <FavoriteActions product={product} onRemove={refreshFavorites} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}