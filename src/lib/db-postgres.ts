import { Pool } from 'pg';

// PostgreSQL connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Execute SQL statement with next_ec_ table prefixes
export async function executeQuery<T = unknown>(
  sql: string, 
  params: (string | number | null)[] = []
): Promise<T[]> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('SQL execution error:', err);
    throw err;
  }
}

// Table name constants for consistency
export const TABLES = {
  users: 'next_ec_users',
  products: 'next_ec_products',
  reviews: 'next_ec_reviews',
  favorites: 'next_ec_favorites',
  orders: 'next_ec_orders',
  order_items: 'next_ec_order_items',
  inquiries: 'next_ec_inquiries',
} as const;

export default pool;