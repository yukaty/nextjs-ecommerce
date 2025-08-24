import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, TABLES } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import { type ProductData } from '@/types/product';

// Product data type definition
type Product = Pick<ProductData, 'id' | 'name' | 'price' | 'image_url'>;

// Get favorites list
export async function GET() {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get user's favorite data joined with products table
    const favorites = await executeQuery<Product[]>(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.image_url
      FROM
        ${TABLES.favorites} AS f
      INNER JOIN
        ${TABLES.products} AS p ON f.product_id = p.id
      WHERE
        f.user_id = $1
      ORDER BY
        f.created_at DESC
      ;`, [user.userId]
    );

    return NextResponse.json(favorites);
  } catch (err) {
    console.error('Favorites list fetch error:', err);
    return NextResponse.json({ message: 'Failed to retrieve favorites list.' }, { status: 500 });
  }
}

// Register favorite
export async function POST(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get product ID included in request
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is not specified.' }, { status: 400 });
    }

    // Add favorite information to favorites table (skip if already registered)
    await executeQuery(
      `INSERT INTO ${TABLES.favorites} (product_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (product_id, user_id) DO NOTHING`,
      [productId, user.userId]
    );

    return NextResponse.json({ message: 'Product has been added to favorites.' });
  } catch (err) {
    console.error('Favorite registration error:', err);
    return NextResponse.json({ message: 'Failed to register favorite.' }, { status: 500 });
  }
}

