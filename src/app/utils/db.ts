// src/lib/db.ts
import { Pool } from 'pg';

let pool: Pool;

// Ensure the DATABASE_URL is set in your environment variables
// (e.g., in docker-compose.yml for the next-app service)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

// Initialize the connection pool
// The DATABASE_URL format is: postgresql://user:password@host:port/database
pool = new Pool({
  connectionString: databaseUrl,
  // You can add other pool options here if needed, e.g., SSL for production
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('🐘 PostgreSQL connected successfully!');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
  // You might want to exit the process or implement a reconnect strategy here
  // For now, we'll just log it.
});

// Export a query function to use the pool
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text: text.substring(0, 100), error });
    throw error;
  }
};

// Optional: A function to test the connection
export const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection test successful.');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export default pool; // You can also export the pool directly if needed