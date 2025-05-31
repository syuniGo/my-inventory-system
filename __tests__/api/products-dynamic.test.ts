// __tests__/api/products-dynamic.test.ts
// 商品动态路由API测试

import { createMocks } from 'node-mocks-http';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('@prisma/client/runtime/library', () => ({
  PrismaClientKnownRequestError: class extends Error {
    code: string;
    meta?: any;
    constructor(message: string, code: string, meta?: any) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  },
}));

// 导入被测试的函数
import { GET, PUT, DELETE } from '../../app/api/products/[id]/route';

// 获取mock实例
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

describe('/api/products/[id] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products/[id]', () => {
    it('should return product details successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test description',
        sellingPrice: 99.99,
        purchasePrice: 50.00,
        categoryId: 1,
        category: {
          id: 1,
          name: 'Test Category',
          description: 'Test category description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    });

    it('should return 400 for invalid product ID', async () => {
      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invalid product ID');
    });

    it('should return 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Product not found');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch product');
    });
  });

  describe('PUT /api/products/[id]', () => {
    it('should update product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Old Product',
        sku: 'OLD-001',
        sellingPrice: 50.00,
        lowStockThreshold: 10,
      };

      const updatedProduct = {
        id: 1,
        name: 'Updated Product',
        sku: 'UPD-001',
        description: 'Updated description',
        sellingPrice: 99.99,
        purchasePrice: 60.00,
        categoryId: 2,
        category: {
          id: 2,
          name: 'Updated Category',
          description: 'Updated category description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const { req } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated Product',
          sku: 'UPD-001',
          description: 'Updated description',
          sellingPrice: 99.99,
          purchasePrice: 60.00,
          categoryId: 2,
        },
      });

      const response = await PUT(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Product',
          sku: 'UPD-001',
          sellingPrice: 99.99,
          description: 'Updated description',
          purchasePrice: 60.00,
          categoryId: 2,
          supplierId: null,
          imageUrl: null,
          lowStockThreshold: 10,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    });

    it('should return 400 for invalid product ID', async () => {
      const { req } = createMocks({
        method: 'PUT',
        body: { name: 'Test', sku: 'TEST', sellingPrice: 99.99 },
      });

      const response = await PUT(req, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invalid product ID');
    });

    it('should return 400 for missing required fields', async () => {
      const { req } = createMocks({
        method: 'PUT',
        body: { description: 'Missing required fields' },
      });

      const response = await PUT(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Missing required fields: name, sku, sellingPrice');
    });

    it('should return 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'PUT',
        body: { name: 'Test', sku: 'TEST', sellingPrice: 99.99 },
      });

      const response = await PUT(req, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Product not found');
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('should delete product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        sellingPrice: 99.99,
      };

      const deletedProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
      };

      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.delete.mockResolvedValue(deletedProduct);

      const { req } = createMocks({ method: 'DELETE' });
      const response = await DELETE(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Product deleted successfully');
      expect(data.deletedProduct).toEqual({
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
      });
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return 400 for invalid product ID', async () => {
      const { req } = createMocks({ method: 'DELETE' });
      const response = await DELETE(req, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invalid product ID');
    });

    it('should return 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const { req } = createMocks({ method: 'DELETE' });
      const response = await DELETE(req, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Product not found');
    });

    it('should handle foreign key constraint errors', async () => {
      const existingProduct = { id: 1, name: 'Test Product', sku: 'TEST-001' };
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);

      const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
      const constraintError = new PrismaClientKnownRequestError('Foreign key constraint', 'P2003');
      mockPrisma.product.delete.mockRejectedValue(constraintError);

      const { req } = createMocks({ method: 'DELETE' });
      const response = await DELETE(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('Cannot delete product: it has related records (inventory, orders, etc.)');
    });
  });
}); 