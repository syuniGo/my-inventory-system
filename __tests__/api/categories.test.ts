// __tests__/api/categories.test.ts
// 分类API测试

import { createMocks } from 'node-mocks-http';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    category: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
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
import { GET, POST } from '../../app/api/categories/route';

// 获取mock实例
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

describe('/api/categories API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return categories list with pagination', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices',
          _count: { products: 5 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Clothing',
          description: 'Apparel and accessories',
          _count: { products: 3 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(2);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/categories?page=1&limit=20&includeProductCount=true',
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.categories).toEqual(mockCategories);
      expect(data.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 2,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(data.filters).toEqual({
        search: '',
        includeProductCount: true,
      });
    });

    it('should handle search functionality', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(1);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/categories?search=electronics',
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'electronics', mode: 'insensitive' } },
            { description: { contains: 'electronics', mode: 'insensitive' } },
          ],
        },
        include: {
          _count: false,
        },
        orderBy: {
          name: 'asc',
        },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(25);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/categories?page=2&limit=10',
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalCount: 25,
        limit: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.category.findMany.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch categories');
    });
  });

  describe('POST /api/categories', () => {
    it('should create category successfully', async () => {
      const newCategory = {
        id: 1,
        name: 'New Category',
        description: 'A new category',
        _count: { products: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(newCategory);

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New Category',
          description: 'A new category',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'New Category',
          description: 'A new category',
        },
        include: {
          _count: {
            select: { products: true }
          },
        },
      });
    });

    it('should create category with only name (description optional)', async () => {
      const newCategory = {
        id: 1,
        name: 'Simple Category',
        description: null,
        _count: { products: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(newCategory);

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Simple Category',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Simple Category',
          description: null,
        },
        include: {
          _count: {
            select: { products: true }
          },
        },
      });
    });

    it('should return 400 for missing name', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          description: 'Category without name',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Missing required field: name');
    });

    it('should handle duplicate category name', async () => {
      const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
      const duplicateError = new PrismaClientKnownRequestError('Unique constraint', 'P2002');
      mockPrisma.category.create.mockRejectedValue(duplicateError);

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Duplicate Category',
          description: 'This name already exists',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('Category name already exists');
    });

    it('should trim whitespace from name and description', async () => {
      const newCategory = {
        id: 1,
        name: 'Trimmed Category',
        description: 'Trimmed description',
        _count: { products: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(newCategory);

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '  Trimmed Category  ',
          description: '  Trimmed description  ',
        },
      });

      const response = await POST(req);

      expect(response.status).toBe(201);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Trimmed Category',
          description: 'Trimmed description',
        },
        include: {
          _count: {
            select: { products: true }
          },
        },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.category.create.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Category',
          description: 'Test description',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create category');
    });
  });
}); 