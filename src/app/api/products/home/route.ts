import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { type ProductData } from '@/types/product';

// Product data type definition
type Product = Pick<ProductData, 'id' | 'name' | 'price' | 'image_url' | 'review_avg' | 'review_count'>;

// Retrieve product data specifically for the homepage
export async function GET() {
  try {
    // Execute SELECT statements for each section in parallel
    const [pickUp, newArrival, hotItems] = await Promise.all([
      executeQuery<Product[]>(`
        SELECT id, name, price, image_url
        FROM products
        ORDER BY sales_count DESC
        LIMIT 3;
      `),
      executeQuery<Product[]>(`
        SELECT
          p.id,
          p.name,
          p.price,
          p.image_url,
          COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
          COALESCE(COUNT(r.id), 0) AS review_count
        FROM products AS p
        LEFT JOIN reviews AS r ON r.product_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 4;
      `),
      executeQuery<Product[]>(`
        SELECT
          p.id,
          p.name,
          p.price,
          p.image_url,
          COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
          COALESCE(COUNT(r.id), 0) AS review_count
        FROM products AS p
        LEFT JOIN reviews AS r ON r.product_id = p.id
        WHERE p.is_featured = true
        GROUP BY p.id
        ORDER BY RAND()
        LIMIT 4;
      `)
    ]);

    // Return the retrieved data
    return NextResponse.json({ pickUp, newArrival, hotItems });
  } catch (err) {
    console.error('Homepage product fetch error:', err);
    return NextResponse.json({ message: 'A server error occurred.' }, { status: 500 });
  }
}

