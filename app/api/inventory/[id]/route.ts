import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { verifyToken } from '../../../../src/lib/auth';

const prisma = new PrismaClient();

// GET /api/inventory/[id] - 获取单个库存项目
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid inventory item ID' },
        { status: 400 }
      );
    }

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stockMovements: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // 最近10条记录
        },
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error('Failed to fetch inventory item:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch inventory item', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] - 更新库存项目
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const inventoryId = parseInt(params.id);
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
    } = body;

    // 更新库存项目和相关产品信息
    const updatedItem = await prisma.$transaction(async (tx) => {
      // 先获取库存项目
      const inventoryItem = await tx.inventoryItem.findUnique({
        where: { id: inventoryId },
        include: { product: true },
      });

      if (!inventoryItem) {
        throw new Error('库存项目不存在');
      }

      // 更新产品信息
      await tx.product.update({
        where: { id: inventoryItem.productId },
        data: {
          name: productName,
          description: description || null,
          sku,
          sellingPrice: parseFloat(sellingPrice),
          lowStockThreshold: parseInt(lowStockThreshold) || null,
        },
      });

      // 更新库存项目
      const updated = await tx.inventoryItem.update({
        where: { id: inventoryId },
        data: {
          quantity: parseInt(quantity),
          reservedQuantity: parseInt(reservedQuantity) || 0,
          location: location || null,
          batchNumber: batchNumber || null,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('更新库存项目失败:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - 删除库存项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const inventoryId = parseInt(params.id);

    // 删除库存项目（产品保留，只删除库存记录）
    await prisma.inventoryItem.delete({
      where: { id: inventoryId },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除库存项目失败:', error);
    return NextResponse.json(
      { message: '删除失败' },
      { status: 500 }
    );
  }
} 