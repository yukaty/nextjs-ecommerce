import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, TABLES } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// Get favorite status for specified product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get ID from URL parameters
  const { id } = await context.params;

  // Convert ID to number
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Product ID is invalid.' }, { status: 400 });
  }

  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Check if it exists in favorites table
    const existing = await executeQuery(
      `SELECT id FROM ${TABLES.favorites} WHERE product_id = $1 AND user_id = $2`,
      [productId, user.userId]
    );

    return NextResponse.json({ isFavorite: existing.length > 0 });
  } catch (err) {
    console.error('Favorite fetch error:', err);
    return NextResponse.json({ message: 'Failed to retrieve favorite information.' }, { status: 500 });
  }
}

// Delete favorite
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get ID from URL parameters
  const { id } = await context.params;

  // Convert ID to number
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Product ID is invalid.' }, { status: 400 });
  }

  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Check if the corresponding favorite exists
    const existing = await executeQuery(
      `SELECT id FROM ${TABLES.favorites} WHERE product_id = $1 AND user_id = $2`,
      [productId, user.userId]
    );
    if (existing.length === 0) {
      return NextResponse.json({ message: 'Favorite not found.' }, { status: 404 });
    }

    // Delete favorite data
    await executeQuery(
      `DELETE FROM ${TABLES.favorites} WHERE product_id = $1 AND user_id = $2`,
      [productId, user.userId]
    );

    return NextResponse.json({ message: 'Removed from favorites.' }, { status: 200 });
  } catch (err) {
    console.error('Favorite deletion error:', err);
    return NextResponse.json({ message: 'Failed to delete favorite.' }, { status: 500 });
  }
}

