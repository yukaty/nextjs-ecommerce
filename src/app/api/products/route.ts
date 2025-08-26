import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, TABLES } from '@/lib/db';
import path from 'path';
import { writeFile } from 'fs/promises';
import type { ProductData } from '@/types/product';
import { validateImageFile } from '@/lib/validation';

// Product data type definition
type Product = Omit<ProductData, 'description'>;

// Retrieve all product data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get page and perPage from query parameters
    let page = Number(searchParams.get('page')) || 1;
    let perPage = Number(searchParams.get('perPage')) || 16;

    // Correct if exceeding minimum or maximum values
    page = Math.max(1, Math.min(page, 1000)); // Page number is 1-1000
    perPage = Math.max(1, Math.min(perPage, 100)); // Items per page is 1-100

    // Calculate offset (number of items to skip)
    const offset = (page - 1) * perPage;

    // Get sort conditions from query parameters
    const sort = searchParams.get('sort') ?? 'new';

    // Build ORDER BY clause
    let order = '';
    switch (sort) {
      case 'priceAsc': // Sort by price (ascending)
        order = 'ORDER BY p.price ASC';
        break;
      case 'new': // Sort by newest first
      default:
        order = 'ORDER BY p.created_at DESC';
        break;
    }

    // Get search keyword from query parameters
    const keyword = searchParams.get('keyword')?.trim() || '';

    // Build base WHERE clause and parameters
    let whereClause = '';
    let productsParams: (string | number)[] = [];
    let countParams: (string | number)[] = [];
    
    if (keyword) {
      whereClause = 'WHERE (p.name LIKE $1 OR p.description LIKE $2)';
      const keywordParam = `%${keyword}%`;
      productsParams = [keywordParam, keywordParam, perPage, offset];
      countParams = [keywordParam, keywordParam];
    } else {
      whereClause = '';
      productsParams = [perPage, offset];
      countParams = [];
    }

    // Execute two database operations in parallel
    const [products, totalItemsResult] = await Promise.all([
      // Use LIMIT and OFFSET to retrieve only product data for current page
      executeQuery<Product[]>(
        `SELECT
          p.id,
          p.name,
          p.price,
          p.stock,
          p.image_url,
          p.updated_at,
          COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
          COALESCE(COUNT(r.id), 0) AS review_count
        FROM ${TABLES.products} AS p
        LEFT JOIN ${TABLES.reviews} AS r ON p.id = r.product_id
        ${whereClause}
        GROUP BY
          p.id, p.name, p.price, p.stock, p.image_url, p.updated_at
        ${order}
        LIMIT $${keyword ? '3' : '1'}
        OFFSET $${keyword ? '4' : '2'}`,
        productsParams
      ),
      // Get total count of product data matching filtering conditions
      executeQuery<{ count: number }>(
        `SELECT COUNT(*) AS count
        FROM ${TABLES.products} AS p
        ${whereClause}`,
        countParams
      )
    ]);


    // Get total count into an easy-to-handle variable
    const totalItems = totalItemsResult[0].count;

    // Calculate total number of pages
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Return retrieved product data and pagination information
    return NextResponse.json({
      products, // Product data for current page
      pagination: { currentPage: page, perPage, totalItems, totalPages },
    });
  } catch (err) {
    console.error('Product fetch error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}

// Register new product data
export async function POST(request: NextRequest) {
  try {
    // Get form data including image file
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() || '';
    const file = formData.get('imageFile') as File;
    const description = formData.get('description')?.toString().trim() || 'No product description available.';
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const isFeatured = formData.get('isFeatured') === 'on';

    // Input value validation
    if (!name?.trim() || !file || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ message: 'Required fields are missing.' }, { status: 400 });
    }

    // Validate image file
    const { isValid, error } = validateImageFile(file);
    if (!isValid) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now(); // Current timestamp
    const random = Math.floor(Math.random() * 10000); // Random number 0-9999
    const fileName = `${timestamp}_${random}.${ext}`; // Build filename

    // Build destination file path
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Add product information to products table
    await executeQuery(`
      INSERT INTO ${TABLES.products} (name, image_url, description, price, stock, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [name, fileName, description, price, stock, isFeatured ? 1 : 0]);

    return NextResponse.json({ message: 'Product registered successfully.' }, { status: 201 });
  } catch (err) {
    console.error('Product registration error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}