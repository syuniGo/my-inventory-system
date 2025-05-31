import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { withRole } from '../../../src/lib/middleware';
import { hashPassword } from '../../../src/lib/auth';

const prisma = new PrismaClient();

// GET /api/users - 获取用户列表（需要管理员权限）
export const GET = withRole('MANAGER', async (request: NextRequest, currentUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // 获取用户列表
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            stockMovements: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: limit,
    });

    // 获取总数量（用于分页）
    const totalCount = await prisma.user.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      users,
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
        role,
        isActive: isActive !== null ? isActive === 'true' : null,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: errorMessage },
      { status: 500 }
    );
  }
});

// POST /api/users - 创建新用户（需要管理员权限）
export const POST = withRole('ADMIN', async (request: NextRequest, currentUser: any) => {
  try {
    const body = await request.json();
    const { username, email, password, role, firstName, lastName } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (String(password).length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 验证角色
    const validRoles = ['USER', 'MANAGER', 'ADMIN'];
    const userRole = role || 'USER';
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // 哈希密码
    const passwordHash = hashPassword(String(password));

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role: userRole,
        firstName: firstName ? String(firstName).trim() : null,
        lastName: lastName ? String(lastName).trim() : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反
        const field = error.meta?.target as string[];
        if (field?.includes('username')) {
          return NextResponse.json(
            { message: 'Username already exists' },
            { status: 409 }
          );
        }
        if (field?.includes('email')) {
          return NextResponse.json(
            { message: 'Email already exists' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 409 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to create user', error: errorMessage },
      { status: 500 }
    );
  }
}); 