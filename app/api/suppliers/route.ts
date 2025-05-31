import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/suppliers - 获取供应商列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search') || '';
    const includeProductCount = searchParams.get('includeProductCount') === 'true';
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 获取供应商列表
    const suppliers = await prisma.supplier.findMany({
      where,
      include: includeProductCount ? {
        _count: {
          select: {
            products: true,
          },
        },
      } : undefined,
      orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: limit,
    });

    // 获取总数量（用于分页）
    const totalCount = await prisma.supplier.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      suppliers,
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
      sorting: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch suppliers', error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - 创建新供应商
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
    } = body;

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // 验证邮箱格式（如果提供）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: String(name).trim(),
        contactPerson: contactPerson ? String(contactPerson).trim() : null,
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
        address: address ? String(address).trim() : null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Failed to create supplier:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反
        return NextResponse.json(
          { message: 'Supplier with this name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to create supplier', error: errorMessage },
      { status: 500 }
    );
  }
} 