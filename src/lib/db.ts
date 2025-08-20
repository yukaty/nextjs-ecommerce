import mysql from 'mysql2/promise'

// Get DB connection settings from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

// Create DB connection pool
const pool = mysql.createPool(dbConfig);

// Execute SQL statement
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (err) {
    console.error('SQL execution error:', err);
    throw err; // Throw error to caller
  }
}

