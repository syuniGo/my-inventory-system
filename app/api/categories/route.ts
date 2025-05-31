import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/categories - 获取分类列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search') || '';
    
    // 是否包含商品数量
    const includeProductCount = searchParams.get('includeProductCount') === 'true';
    
    // 构建查询条件
    const where: any = {};
    
    // 搜索条件（分类名称、描述）
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 获取分类列表
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: includeProductCount ? {
          select: { products: true }
        } : false,
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    // 获取总数量（用于分页）
    const totalCount = await prisma.category.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      categories,
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
        includeProductCount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/categories - 创建新分类
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { message: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // 准备创建数据
    const createData = {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
    };

    const category = await prisma.category.create({
      data: createData,
      include: {
        _count: {
          select: { products: true }
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反（如分类名称重复）
        return NextResponse.json(
          { message: 'Category name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to create category', error: errorMessage },
      { status: 500 }
    );
  }
} 