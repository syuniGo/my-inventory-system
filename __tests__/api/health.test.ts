import { createMocks } from 'node-mocks-http';
import { GET as healthHandler } from '../../app/api/health/route';
import { GET as dbHealthHandler } from '../../app/api/health/db/route';

// Mock the database module
jest.mock('../../src/lib/database', () => ({
  healthCheck: jest.fn(),
}));

describe('/api/health', () => {
  test('should return ok status', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await healthHandler(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });
});

describe('/api/health/db', () => {
  const { healthCheck } = require('../../src/lib/database');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return healthy status when databases are connected', async () => {
    healthCheck.mockResolvedValue({
      postgresql: true,
      prisma: true,
      timestamp: '2024-01-01T00:00:00.000Z',
    });

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await dbHealthHandler(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database.postgresql).toBe(true);
    expect(data.database.prisma).toBe(true);
  });

  test('should return unhealthy status when databases are not connected', async () => {
    healthCheck.mockResolvedValue({
      postgresql: false,
      prisma: false,
      timestamp: '2024-01-01T00:00:00.000Z',
    });

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await dbHealthHandler(req as any);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database.postgresql).toBe(false);
    expect(data.database.prisma).toBe(false);
  });

  test('should return error status when health check throws', async () => {
    healthCheck.mockRejectedValue(new Error('Database connection failed'));

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await dbHealthHandler(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.message).toBe('Health check failed');
    expect(data.error).toBe('Database connection failed');
  });

  test('should return partial health status', async () => {
    healthCheck.mockResolvedValue({
      postgresql: true,
      prisma: false,
      timestamp: '2024-01-01T00:00:00.000Z',
    });

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await dbHealthHandler(req as any);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database.postgresql).toBe(true);
    expect(data.database.prisma).toBe(false);
  });
}); 