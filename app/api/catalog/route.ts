import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      quantity: {
        gt: 0, // 只显示有库存的商品
      },
    };

    // 搜索条件
    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          product: {
            sku: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          product: {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // 分类过滤
    if (categoryId) {
      where.product = {
        ...where.product,
        categoryId: parseInt(categoryId),
      };
    }

    // 获取库存项目
    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    // 获取总数
    const totalCount = await prisma.inventoryItem.count({ where });

    // 获取所有分类
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // 转换数据格式
    const products = inventoryItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      sku: item.product.sku,
      categoryId: item.product.categoryId,
      sellingPrice: item.product.sellingPrice,
      imageUrl: item.product.imageUrl,
      category: item.product.category,
      quantity: item.quantity - item.reservedQuantity, // 可用库存
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
      categories,
    });
  } catch (error) {
    console.error('获取商品目录失败:', error);
    return NextResponse.json(
      { message: '获取商品目录失败' },
      { status: 500 }
    );
  }
} 