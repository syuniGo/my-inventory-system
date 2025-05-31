import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { withAuth, withRole } from '../../../src/lib/middleware';

const prisma = new PrismaClient();

// GET /api/stock-movements - 获取库存移动记录列表（需要认证）
export const GET = withAuth(async (request: NextRequest, currentUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // 过滤参数
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const where: any = {};
    
    if (productId) {
      where.productId = parseInt(productId, 10);
    }
    
    if (type) {
      where.type = type;
    }
    
    if (userId) {
      where.userId = parseInt(userId, 10);
    }
    
    // 日期范围过滤
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 普通用户只能查看自己的记录
    if (currentUser.role === 'USER') {
      where.userId = currentUser.id;
    }

    // 获取库存移动记录
    const stockMovements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            location: true,
            batchNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: limit,
    });

    // 获取总数量（用于分页）
    const totalCount = await prisma.stockMovement.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 计算统计信息
    const stats = {
      totalMovements: totalCount,
      inboundMovements: await prisma.stockMovement.count({
        where: { ...where, quantity: { gt: 0 } },
      }),
      outboundMovements: await prisma.stockMovement.count({
        where: { ...where, quantity: { lt: 0 } },
      }),
    };

    return NextResponse.json({
      stockMovements,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        productId: productId ? parseInt(productId, 10) : null,
        type,
        userId: userId ? parseInt(userId, 10) : null,
        startDate,
        endDate,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch stock movements:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch stock movements', error: errorMessage },
      { status: 500 }
    );
  }
});

// POST /api/stock-movements - 创建新的库存移动记录（需要USER权限）
export const POST = withAuth(async (request: NextRequest, currentUser: any) => {
  try {
    const body = await request.json();
    const {
      productId,
      inventoryItemId,
      userId,
      type,
      quantity,
      reason,
      reference,
      notes,
    } = body;

    // 验证必填字段
    if (!productId || !type || quantity === undefined || quantity === null) {
      return NextResponse.json(
        { message: 'Missing required fields: productId, type, quantity' },
        { status: 400 }
      );
    }

    // 使用当前用户ID，除非是管理员指定其他用户
    let actualUserId = currentUser.id;
    if (userId && userId !== currentUser.id) {
      // 只有管理员可以为其他用户创建记录
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        return NextResponse.json(
          { message: 'Only managers and administrators can create records for other users' },
          { status: 403 }
        );
      }
      actualUserId = parseInt(String(userId), 10);
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

    // 如果指定了库存项目，验证是否存在
    if (inventoryItemId) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: parseInt(String(inventoryItemId), 10) },
      });

      if (!inventoryItem) {
        return NextResponse.json(
          { message: 'Inventory item not found' },
          { status: 404 }
        );
      }

      // 验证库存项目是否属于指定商品
      if (inventoryItem.productId !== parseInt(String(productId), 10)) {
        return NextResponse.json(
          { message: 'Inventory item does not belong to the specified product' },
          { status: 400 }
        );
      }
    }

    // 使用事务创建库存移动记录并更新库存
    const result = await prisma.$transaction(async (tx: any) => {
      // 创建库存移动记录
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: parseInt(String(productId), 10),
          inventoryItemId: inventoryItemId ? parseInt(String(inventoryItemId), 10) : null,
          userId: actualUserId,
          type,
          quantity: parseInt(String(quantity), 10),
          reason: reason ? String(reason).trim() : null,
          reference: reference ? String(reference).trim() : null,
          notes: notes ? String(notes).trim() : null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          inventoryItem: {
            select: {
              id: true,
              location: true,
              batchNumber: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // 如果指定了库存项目，更新其数量
      if (inventoryItemId) {
        await tx.inventoryItem.update({
          where: { id: parseInt(String(inventoryItemId), 10) },
          data: {
            quantity: {
              increment: parseInt(String(quantity), 10),
            },
          },
        });
      }

      return stockMovement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create stock movement:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // 外键约束违反
        return NextResponse.json(
          { message: 'Invalid reference to product, inventory item, or user' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to create stock movement', error: errorMessage },
      { status: 500 }
    );
  }
}); 