import { Pool, PoolClient, QueryResult } from 'pg';
import { PrismaClient } from '@prisma/client';

// PostgreSQL connection pool
let pool: Pool | null = null;

// Prisma client instance
let prisma: PrismaClient | null = null;

// Database configuration interface
interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  max?: number; // Maximum number of clients in the pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Initialize PostgreSQL connection pool
export const initializePool = (config?: DatabaseConfig): Pool => {
  if (pool) {
    return pool;
  }

  const databaseUrl = config?.connectionString || process.env.DATABASE_URL;
  
  if (!databaseUrl && !config?.host) {
    throw new Error('Please define DATABASE_URL environment variable or provide database configuration');
  }

  const poolConfig = databaseUrl 
    ? { connectionString: databaseUrl }
    : {
        host: config?.host || 'localhost',
        port: config?.port || 5432,
        database: config?.database || 'inventory_db',
        user: config?.user || 'user',
        password: config?.password || 'password',
        ssl: config?.ssl || false,
      };

  pool = new Pool({
    ...poolConfig,
    max: config?.max || 20, // Maximum number of clients in the pool
    idleTimeoutMillis: config?.idleTimeoutMillis || 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: config?.connectionTimeoutMillis || 2000, // Return an error after 2 seconds if connection could not be established
  });

  // Event listeners
  pool.on('connect', (client: PoolClient) => {
    console.log('🐘 PostgreSQL client connected');
  });

  pool.on('error', (err: Error) => {
    console.error('PostgreSQL pool error:', err);
  });

  pool.on('remove', () => {
    console.log('🐘 PostgreSQL client removed');
  });

  return pool;
};

// Get the pool instance
export const getPool = (): Pool => {
  if (!pool) {
    return initializePool();
  }
  return pool;
};

// Initialize Prisma client
export const initializePrisma = (): PrismaClient => {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

  return prisma;
};

// Get Prisma client instance
export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    return initializePrisma();
  }
  return prisma;
};

// Execute a query using the pool
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const client = await getPool().connect();
  const start = Date.now();
  
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Executed query', {
      text: text.substring(0, 100),
      duration,
      rows: result.rowCount,
    });
    
    return result;
  } catch (error) {
    console.error('Error executing query', {
      text: text.substring(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Test Prisma connection
export const testPrismaConnection = async (): Promise<boolean> => {
  try {
    const prismaClient = getPrisma();
    await prismaClient.$queryRaw`SELECT NOW() as current_time`;
    console.log('Prisma connection test successful');
    return true;
  } catch (error) {
    console.error('Prisma connection test failed:', error);
    return false;
  }
};

// Close all connections
export const closeConnections = async (): Promise<void> => {
  const promises: Promise<void>[] = [];

  if (pool) {
    promises.push(pool.end());
    pool = null;
  }

  if (prisma) {
    promises.push(prisma.$disconnect());
    prisma = null;
  }

  await Promise.all(promises);
  console.log('All database connections closed');
};

// Health check function
export const healthCheck = async (): Promise<{
  postgresql: boolean;
  prisma: boolean;
  timestamp: string;
}> => {
  const [postgresqlHealth, prismaHealth] = await Promise.all([
    testConnection().catch(() => false),
    testPrismaConnection().catch(() => false),
  ]);

  return {
    postgresql: postgresqlHealth,
    prisma: prismaHealth,
    timestamp: new Date().toISOString(),
  };
};

// Export default instances
export default {
  getPool,
  getPrisma,
  query,
  testConnection,
  testPrismaConnection,
  closeConnections,
  healthCheck,
}; 