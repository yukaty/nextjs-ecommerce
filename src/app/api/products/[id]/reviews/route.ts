import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { type ReviewData } from '@/types/review';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// Review type definition
type Review = ReviewData; // No changes from basic type

// Get review list for specified product ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Get ID from URL parameters
  const { id } = await context.params;
  const productId = parseInt(id, 10); // Convert to number

  try {
    const { searchParams } = new URL(request.url);

    // Get information needed for pagination
    let page = Number(searchParams.get('page')) || 1;
    const perPage = 10; // Display count is fixed
    page = Math.max(1, Math.min(page, 1000));

    // Calculate offset (number of items to skip)
    const offset = (page - 1) * perPage;

    // Execute two database operations in parallel
    const [reviews, totalItemsResult] = await Promise.all([
      // Get review list (also get username via table join)
      executeQuery<Review[]>(`
        SELECT
          r.id,
          r.product_id,
          r.user_id,
          r.score,
          r.content,
          r.created_at,
          u.name AS user_name
        FROM reviews AS r
        JOIN users AS u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
        LIMIT ?
        OFFSET ?
        ;`, [productId, perPage, offset]
      ),
      // Get total review count and average review rating for the product
      executeQuery<{ count: number, review_avg: number }>(`
        SELECT
          COUNT(*) AS count,
          COALESCE(ROUND(AVG(score), 1), 0) AS review_avg
        FROM reviews
        WHERE product_id = ?
        ;`, [productId]
      )
    ]);

    const review_avg = Number(totalItemsResult[0].review_avg) || 0;
    const totalItems = Number(totalItemsResult[0].count) || 0;

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Return retrieved review data and pagination information
    return NextResponse.json({
      reviews,
      review_avg,
      pagination: { currentPage: page, perPage, totalItems, totalPages }
    });
  } catch (err) {
    console.error('Review retrieval error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}

// Register new review
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Get ID from URL parameters
  const { id } = await context.params;
  const productId = parseInt(id, 10); // Convert to number

  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get review information included in request
    const body = await request.json();
    const score = Number(body.rating); // Number of stars (1-5)
    const content = body.content?.toString().trim() || ''; // Review content

    // Input value validation
    if (isNaN(score) || !content) {
      return NextResponse.json({ message: 'Required fields are missing.' }, { status: 400 });
    }

    // Add review information to reviews table
    await executeQuery(`
      INSERT INTO reviews (product_id, user_id, score, content)
      VALUES (?, ?, ?, ?);
    `, [productId, user.userId, score, content]);

    return NextResponse.json({ message: 'Review registered successfully.' }, { status: 201 });
  } catch (err) {
    console.error('Review registration error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}

