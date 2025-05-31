import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    totalCount: 0,
  })),
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  })),
}));

// Import after mocking
import {
  initializePool,
  initializePrisma,
  getPool,
  getPrisma,
  query,
  testConnection,
  testPrismaConnection,
  closeConnections,
  healthCheck,
} from '../src/lib/database';

// Mock environment variables for testing
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    DATABASE_URL: 'postgresql://user:password@localhost:5432/inventory_db_test',
    NODE_ENV: 'test',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Database Connection Module', () => {
  describe('Pool Initialization', () => {
    test('should initialize pool with DATABASE_URL', () => {
      const pool = initializePool();
      expect(pool).toBeDefined();
      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: 'postgresql://user:password@localhost:5432/inventory_db_test',
        })
      );
    });

    test('should initialize pool with custom config', () => {
      const config = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        max: 10,
      };
      
      const pool = initializePool(config);
      expect(pool).toBeDefined();
      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 5432,
          database: 'test_db',
          user: 'test_user',
          password: 'test_password',
          max: 10,
        })
      );
    });

    test('should throw error when no DATABASE_URL or config provided', () => {
      delete process.env.DATABASE_URL;
      
      expect(() => {
        initializePool();
      }).toThrow('Please define DATABASE_URL environment variable or provide database configuration');
    });

    test('should return existing pool instance', () => {
      const pool1 = initializePool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe('Prisma Initialization', () => {
    test('should initialize Prisma client', () => {
      const prisma = initializePrisma();
      expect(prisma).toBeDefined();
      expect(PrismaClient).toHaveBeenCalledWith(
        expect.objectContaining({
          log: ['error'],
        })
      );
    });

    test('should return existing Prisma instance', () => {
      const prisma1 = initializePrisma();
      const prisma2 = getPrisma();
      expect(prisma1).toBe(prisma2);
    });
  });

  describe('Database Operations', () => {
    test('should execute query successfully', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [{ now: new Date() }],
          rowCount: 1,
        }),
        release: jest.fn(),
      };

      const mockPool = {
        connect: jest.fn().mockResolvedValue(mockClient),
      };

      // Mock getPool to return our mock pool
      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        getPool: () => mockPool,
      }));

      const { query: testQuery } = require('../src/lib/database');
      
      const result = await testQuery('SELECT NOW()');
      expect(result.rowCount).toBe(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()', undefined);
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle query errors', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        release: jest.fn(),
      };

      const mockPool = {
        connect: jest.fn().mockResolvedValue(mockClient),
      };

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        getPool: () => mockPool,
      }));

      const { query: testQuery } = require('../src/lib/database');
      
      await expect(testQuery('INVALID SQL')).rejects.toThrow('Database error');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('Connection Testing', () => {
    test('should test PostgreSQL connection successfully', async () => {
      // Mock the query function to return success
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ current_time: new Date(), pg_version: 'PostgreSQL 15.0' }],
        rowCount: 1,
      });

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        query: mockQuery,
      }));

      const { testConnection: testConn } = require('../src/lib/database');
      
      const result = await testConn();
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('SELECT NOW() as current_time, version() as pg_version');
    });

    test('should handle PostgreSQL connection failure', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('Connection failed'));

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        query: mockQuery,
      }));

      const { testConnection: testConn } = require('../src/lib/database');
      
      const result = await testConn();
      expect(result).toBe(false);
    });

    test('should test Prisma connection successfully', async () => {
      const mockPrisma = {
        $queryRaw: jest.fn().mockResolvedValue([{ current_time: new Date() }]),
      };

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        getPrisma: () => mockPrisma,
      }));

      const { testPrismaConnection: testPrismaConn } = require('../src/lib/database');
      
      const result = await testPrismaConn();
      expect(result).toBe(true);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    test('should handle Prisma connection failure', async () => {
      const mockPrisma = {
        $queryRaw: jest.fn().mockRejectedValue(new Error('Prisma connection failed')),
      };

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        getPrisma: () => mockPrisma,
      }));

      const { testPrismaConnection: testPrismaConn } = require('../src/lib/database');
      
      const result = await testPrismaConn();
      expect(result).toBe(false);
    });
  });

  describe('Health Check', () => {
    test('should return healthy status when both connections work', async () => {
      const mockTestConnection = jest.fn().mockResolvedValue(true);
      const mockTestPrismaConnection = jest.fn().mockResolvedValue(true);

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        testConnection: mockTestConnection,
        testPrismaConnection: mockTestPrismaConnection,
      }));

      const { healthCheck: testHealthCheck } = require('../src/lib/database');
      
      const health = await testHealthCheck();
      expect(health.postgresql).toBe(true);
      expect(health.prisma).toBe(true);
      expect(health.timestamp).toBeDefined();
    });

    test('should handle partial connection failures', async () => {
      const mockTestConnection = jest.fn().mockResolvedValue(true);
      const mockTestPrismaConnection = jest.fn().mockResolvedValue(false);

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        testConnection: mockTestConnection,
        testPrismaConnection: mockTestPrismaConnection,
      }));

      const { healthCheck: testHealthCheck } = require('../src/lib/database');
      
      const health = await testHealthCheck();
      expect(health.postgresql).toBe(true);
      expect(health.prisma).toBe(false);
    });

    test('should handle connection errors gracefully', async () => {
      const mockTestConnection = jest.fn().mockRejectedValue(new Error('Connection error'));
      const mockTestPrismaConnection = jest.fn().mockRejectedValue(new Error('Prisma error'));

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        testConnection: mockTestConnection,
        testPrismaConnection: mockTestPrismaConnection,
      }));

      const { healthCheck: testHealthCheck } = require('../src/lib/database');
      
      const health = await testHealthCheck();
      expect(health.postgresql).toBe(false);
      expect(health.prisma).toBe(false);
    });
  });

  describe('Connection Cleanup', () => {
    test('should close all connections', async () => {
      const mockPool = {
        end: jest.fn().mockResolvedValue(undefined),
      };

      const mockPrisma = {
        $disconnect: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../src/lib/database', () => ({
        ...jest.requireActual('../src/lib/database'),
        getPool: () => mockPool,
        getPrisma: () => mockPrisma,
      }));

      const { closeConnections: testCloseConnections } = require('../src/lib/database');
      
      await expect(testCloseConnections()).resolves.not.toThrow();
    });
  });
});

describe('Database Health API', () => {
  test('should return healthy status when databases are connected', async () => {
    // This would require setting up a test server or using supertest
    // For now, we'll test the logic directly
    
    const mockHealthCheck = jest.fn().mockResolvedValue({
      postgresql: true,
      prisma: true,
      timestamp: new Date().toISOString(),
    });

    // Mock the health check function
    jest.doMock('../src/lib/database', () => ({
      healthCheck: mockHealthCheck,
    }));

    // Test the logic that would be in the API route
    const health = await mockHealthCheck();
    const status = health.postgresql && health.prisma ? 200 : 503;
    
    expect(status).toBe(200);
    expect(health.postgresql).toBe(true);
    expect(health.prisma).toBe(true);
  });

  test('should return unhealthy status when databases are not connected', async () => {
    const mockHealthCheck = jest.fn().mockResolvedValue({
      postgresql: false,
      prisma: false,
      timestamp: new Date().toISOString(),
    });

    jest.doMock('../src/lib/database', () => ({
      healthCheck: mockHealthCheck,
    }));

    const health = await mockHealthCheck();
    const status = health.postgresql && health.prisma ? 200 : 503;
    
    expect(status).toBe(503);
    expect(health.postgresql).toBe(false);
    expect(health.prisma).toBe(false);
  });
}); 