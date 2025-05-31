// __tests__/database-real.test.ts
// 真实数据库连接测试 - 需要Docker PostgreSQL运行在端口15432
import {
  initializePool,
  initializePrisma,
  query,
  testConnection,
  testPrismaConnection,
  closeConnections,
  healthCheck,
} from '../src/lib/database';

// 设置测试环境变量
const TEST_DATABASE_URL = 'postgresql://user:password@localhost:15432/inventory_db';

describe('Real Database Connection Tests', () => {
  beforeAll(() => {
    // 设置测试数据库连接
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    // 不直接修改NODE_ENV，而是在需要时检查
  });

  afterAll(async () => {
    // 清理连接
    await closeConnections();
  });

  describe('PostgreSQL Connection Pool', () => {
    test('should initialize pool with test database URL', () => {
      const pool = initializePool();
      expect(pool).toBeDefined();
      expect(typeof pool.connect).toBe('function');
    });

    test('should execute basic query successfully', async () => {
      const result = await query('SELECT NOW() as current_time, 1 as test_number');
      
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
      expect(result.rows[0]).toHaveProperty('current_time');
      expect(result.rows[0]).toHaveProperty('test_number');
      expect(result.rows[0].test_number).toBe(1);
    }, 10000);

    test('should handle query with parameters', async () => {
      const testValue = 'test_string';
      const result = await query('SELECT $1 as test_param', [testValue]);
      
      expect(result.rows[0].test_param).toBe(testValue);
    }, 10000);

    test('should test PostgreSQL connection', async () => {
      const isConnected = await testConnection();
      expect(isConnected).toBe(true);
    }, 10000);
  });

  describe('Prisma Connection', () => {
    test('should initialize Prisma client', () => {
      const prisma = initializePrisma();
      expect(prisma).toBeDefined();
      expect(typeof prisma.$connect).toBe('function');
      expect(typeof prisma.$queryRaw).toBe('function');
    });

    test('should test Prisma connection', async () => {
      const isConnected = await testPrismaConnection();
      expect(isConnected).toBe(true);
    }, 10000);

    test('should execute raw query with Prisma', async () => {
      const prisma = initializePrisma();
      const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'prisma_test' as source`;
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('current_time');
      expect(result[0]).toHaveProperty('source');
      expect(result[0].source).toBe('prisma_test');
    }, 10000);
  });

  describe('Database Schema Tests', () => {
    test('should verify categories table exists', async () => {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      `);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].table_name).toBe('categories');
    }, 10000);

    test('should verify products table exists', async () => {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      `);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].table_name).toBe('products');
    }, 10000);

    test('should verify initial data exists in categories', async () => {
      const result = await query('SELECT COUNT(*) as count FROM categories');
      
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    }, 10000);

    test('should verify initial data exists in products', async () => {
      const result = await query('SELECT COUNT(*) as count FROM products');
      
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    }, 10000);
  });

  describe('CRUD Operations Tests', () => {
    let testCategoryId: number;

    test('should insert a test category', async () => {
      const result = await query(`
        INSERT INTO categories (name, description) 
        VALUES ($1, $2) 
        RETURNING id, name, description
      `, ['Test Category', 'A test category for testing']);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Test Category');
      expect(result.rows[0].description).toBe('A test category for testing');
      
      testCategoryId = result.rows[0].id;
    }, 10000);

    test('should read the test category', async () => {
      const result = await query('SELECT * FROM categories WHERE id = $1', [testCategoryId]);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Test Category');
    }, 10000);

    test('should update the test category', async () => {
      const result = await query(`
        UPDATE categories 
        SET description = $1 
        WHERE id = $2 
        RETURNING id, name, description
      `, ['Updated test category description', testCategoryId]);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].description).toBe('Updated test category description');
    }, 10000);

    test('should delete the test category', async () => {
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [testCategoryId]);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(testCategoryId);
    }, 10000);

    test('should verify category was deleted', async () => {
      const result = await query('SELECT * FROM categories WHERE id = $1', [testCategoryId]);
      
      expect(result.rows.length).toBe(0);
    }, 10000);
  });

  describe('Health Check', () => {
    test('should return healthy status for both connections', async () => {
      const health = await healthCheck();
      
      expect(health.postgresql).toBe(true);
      expect(health.prisma).toBe(true);
      expect(health.timestamp).toBeDefined();
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    }, 15000);
  });

  describe('Error Handling', () => {
    test('should handle invalid SQL gracefully', async () => {
      await expect(query('INVALID SQL STATEMENT')).rejects.toThrow();
    }, 10000);

    test('should handle connection errors gracefully', async () => {
      // 临时修改DATABASE_URL为无效连接
      const originalUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://invalid:invalid@localhost:9999/invalid';
      
      // 关闭现有连接
      await closeConnections();
      
      // 尝试连接应该失败
      const isConnected = await testConnection();
      expect(isConnected).toBe(false);
      
      // 恢复原始连接
      process.env.DATABASE_URL = originalUrl;
      await closeConnections();
    }, 15000);
  });
}); 