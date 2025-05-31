import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { withAuth, withRole } from '../../../src/lib/middleware';
import { verifyToken } from '../../../src/lib/auth';

const prisma = new PrismaClient();

// 定义库存项目类型
type InventoryItemWithProduct = {
  id: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
  location: string | null;
  batchNumber: string | null;
  expiryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    name: string;
    description: string | null;
    sku: string;
    categoryId: number | null;
    supplierId: number | null;
    purchasePrice: any;
    sellingPrice: any;
    imageUrl: string | null;
    lowStockThreshold: number | null;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: number;
      name: string;
    } | null;
  };
};

// GET /api/inventory - 获取库存列表（需要认证）
export const GET = withAuth(async (request: NextRequest, currentUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const lowStock = searchParams.get('lowStock') === 'true';
    const location = searchParams.get('location');
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const where: any = {};
    
    // 商品搜索条件
    if (search || categoryId) {
      where.product = {};
      if (search) {
        where.product.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (categoryId) {
        where.product.categoryId = parseInt(categoryId, 10);
      }
    }
    
    // 存储位置过滤
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // 获取库存列表
    let inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: sortBy === 'productName' 
        ? { product: { name: sortOrder === 'asc' ? 'asc' : 'desc' } }
        : { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: limit,
    }) as InventoryItemWithProduct[];

    // 低库存过滤（需要在获取数据后进行，因为涉及到商品的lowStockThreshold）
    if (lowStock) {
      inventoryItems = inventoryItems.filter((item: InventoryItemWithProduct) => 
        item.quantity <= (item.product.lowStockThreshold || 0)
      );
    }

    // 获取总数量（用于分页）
    const totalCount = await prisma.inventoryItem.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 计算库存统计
    const stats = {
      totalItems: totalCount,
      lowStockItems: inventoryItems.filter((item: InventoryItemWithProduct) => 
        item.quantity <= (item.product.lowStockThreshold || 0)
      ).length,
      totalValue: inventoryItems.reduce((sum: number, item: InventoryItemWithProduct) => 
        sum + (item.quantity * parseFloat(item.product.sellingPrice.toString())), 0
      ),
    };

    return NextResponse.json({
      inventoryItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        lowStock,
        location,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch inventory', error: errorMessage },
      { status: 500 }
    );
  }
});

// POST /api/inventory - 创建新商品和库存项目（需要MANAGER权限）
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: '未提供认证信息' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ message: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const {
      productName,
      description,
      sku,
      quantity,
      reservedQuantity,
      location,
      batchNumber,
      sellingPrice,
      lowStockThreshold,
      // 兼容旧的API格式
      productId,
      expiryDate,
    } = body;

    // 如果提供了productId，说明是为现有产品创建库存项目
    if (productId) {
      // 验证必填字段
      if (quantity === undefined || quantity === null) {
        return NextResponse.json(
          { message: 'Missing required fields: quantity' },
          { status: 400 }
        );
      }

      // 验证商品是否存在
      const product = await prisma.product.findUnique({
        where: { id: parseInt(String(productId), 10) },
      });

      if (!product) {
        return NextResponse.json(
          { message: 'Product not found' },
          { status: 404 }
        );
      }

      // 创建库存项目
      const inventoryItem = await prisma.inventoryItem.create({
        data: {
          productId: parseInt(String(productId), 10),
          quantity: parseInt(String(quantity), 10),
          reservedQuantity: parseInt(String(reservedQuantity || 0), 10),
          location: location ? String(location).trim() : null,
          batchNumber: batchNumber ? String(batchNumber).trim() : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(inventoryItem, { status: 201 });
    }

    // 否则创建新商品和库存项目
    // 验证必填字段
    if (!productName || !sku || sellingPrice === undefined) {
      return NextResponse.json(
        { message: '商品名称、SKU和价格为必填项' },
        { status: 400 }
      );
    }

    // 检查SKU是否已存在
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: 'SKU已存在，请使用不同的SKU' },
        { status: 409 }
      );
    }

    // 创建新商品和库存项目
    const newItem = await prisma.$transaction(async (tx: any) => {
      // 创建产品
      const product = await tx.product.create({
        data: {
          name: productName,
          description: description || null,
          sku,
          sellingPrice: parseFloat(sellingPrice),
          purchasePrice: 0, // 默认值
          lowStockThreshold: parseInt(lowStockThreshold) || 10,
          categoryId: null, // 可以后续添加分类选择
          supplierId: null, // 可以后续添加供应商选择
        },
      });

      // 创建库存项目
      const inventoryItem = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          quantity: parseInt(quantity) || 0,
          reservedQuantity: parseInt(reservedQuantity) || 0,
          location: location || null,
          batchNumber: batchNumber || null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      return inventoryItem;
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('创建库存项目失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反
        return NextResponse.json(
          { message: 'SKU已存在或库存项目重复' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: '创建失败', error: errorMessage },
      { status: 500 }
    );
  }
} 