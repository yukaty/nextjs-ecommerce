import { NextRequest, NextResponse } from 'next/server'
import path from 'path';
import { writeFile, rm } from 'fs/promises';
import { executeQuery, TABLES } from '@/lib/db';
import type { ProductData } from '@/types/product';

type Product = ProductData; // No changes from base type

// Get product data for specified ID
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get ID from URL parameters
  const { id } = await context.params;

  // Convert ID to number
  const productId = parseInt(id, 10);

  try { // Get product data from database
    const result = await executeQuery<Product>(
      `SELECT * FROM ${TABLES.products} WHERE id = $1`,
      [productId]
    );

    // If product with specified ID is not found
    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    // Return retrieved product data
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error('Product fetch error:', err);
    return NextResponse.json(
      { message: 'Server error occurred.' },
      { status: 500 }
    );
  }
}

// Update product data for specified ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get ID from URL parameters
  const { id } = await context.params;

  // Convert ID to number
  const productId = parseInt(id, 10);

  try {
    // Get existing product data (existence check)
    const existing = await executeQuery<Product>(
      `SELECT * FROM ${TABLES.products} WHERE id = $1`,
      [productId]
    );
    if (existing.length === 0) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }
    const currentProduct = existing[0]; // Get current product data

    // Get form data including image file
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() || '';
    const file = formData.get('imageFile') as File | null;
    const description = formData.get('description')?.toString().trim() || 'No product description available.';
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));

    // Input value validation (allowing no image file)
    if (!name?.trim() || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ message: 'Required fields are missing.' }, { status: 400 });
    }

    // Old and new image file names
    const oldFileName = currentProduct.image_url;
    let newFileName: string | null = oldFileName || null; // Temporarily use existing filename

    // If a new image file has been uploaded
    if (file && file.size > 0) {
      // Safely get file extension
      const ext = file.name.split('.').pop();
      if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase())) {
        return NextResponse.json({ message: 'Unsupported file format.' }, { status: 400 });
      }

      // MIME Type check
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json({ message: 'Unsupported file format. Please select a JPEG, PNG, or WebP file.' }, { status: 400 });
      }

      // File size validation (limit to 2MB for product images)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        return NextResponse.json({ message: 'Image file size must be less than 2MB.' }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now(); // Current timestamp
      const random = Math.floor(Math.random() * 10000); // Random number 0-9999
      newFileName = `${timestamp}_${random}.${ext}`;

      // Build destination file path
      const newFilePath = path.join(process.cwd(), 'public/uploads', newFileName);

      // Save new file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(newFilePath, buffer);

      // Delete existing image file if it exists
      if (oldFileName) {
        const oldFilePath = path.join(process.cwd(), 'public/uploads', oldFileName);
        try { // Delete file
          await rm(oldFilePath);
        } catch (err) {
          console.error('Image file deletion error:', err);
        }
      }
    }

    // Update product information in products table
    await executeQuery(`
      UPDATE ${TABLES.products}
      SET name = $1, image_url = $2, description = $3, price = $4, stock = $5
      WHERE id = $6
    `, [name, newFileName, description, price, stock, productId]);

    return NextResponse.json({ message: 'Product has been updated.' }, { status: 200 });
  } catch (err) {
    console.error('Product update error:', err);
    return NextResponse.json({ message: 'A server error occurred.' }, { status: 500 });
  }
}
// Delete product data for specified ID
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get ID from URL parameters
  const { id } = await context.params;

  // Convert ID to number
  const productId = parseInt(id, 10);

  try {
    // Get existing product data (existence check)
    const existing = await executeQuery<Product>(
      `SELECT * FROM ${TABLES.products} WHERE id = $1`,
      [productId]
    );
    if (existing.length === 0) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }
    const currentProduct = existing[0]; // Get current product data

    // Delete image file if it exists
    if (currentProduct.image_url) {
      const filePath = path.join(process.cwd(), 'public/uploads', currentProduct.image_url);
      try { // Delete file
        await rm(filePath);
      } catch (err) {
        console.error('Image file deletion error:', err);
      }
    }

    // Delete product from database
    await executeQuery(
      `DELETE FROM ${TABLES.products} WHERE id = $1`,
      [productId]
    );

    return NextResponse.json({ message: 'Product has been deleted.' }, { status: 200 });
  } catch (err) {
    console.error('Product deletion error:', err);
    return NextResponse.json(
      { message: 'Server error occurred.' },
      { status: 500 }
    );
  }
}
