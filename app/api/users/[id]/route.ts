import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { withRole, requireAuth } from '../../../../src/lib/middleware';
import { hashPassword, hasPermission } from '../../../../src/lib/auth';

const prisma = new PrismaClient();

// GET /api/users/[id] - 获取单个用户信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用认证中间件
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // 检查权限：用户只能查看自己的信息，管理员可以查看所有用户
    if (currentUser.id !== id && !hasPermission(currentUser.role, 'MANAGER')) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
        stockMovements: {
          select: {
            id: true,
            type: true,
            quantity: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // 最近10条记录
        },
        _count: {
          select: {
            stockMovements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用认证中间件
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, role, firstName, lastName, isActive } = body;

    // 检查权限：用户只能更新自己的基本信息，管理员可以更新所有信息
    const isSelfUpdate = currentUser.id === id;
    const isManager = hasPermission(currentUser.role, 'MANAGER');
    const isAdmin = hasPermission(currentUser.role, 'ADMIN');

    if (!isSelfUpdate && !isManager) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = {};

    // 邮箱验证和更新
    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { message: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.email = String(email).trim().toLowerCase();
    }

    // 密码更新
    if (password !== undefined) {
      if (String(password).length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      updateData.passwordHash = hashPassword(String(password));
    }

    // 姓名更新
    if (firstName !== undefined) {
      updateData.firstName = firstName ? String(firstName).trim() : null;
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName ? String(lastName).trim() : null;
    }

    // 角色更新（只有管理员可以修改）
    if (role !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: 'Only administrators can change user roles' },
          { status: 403 }
        );
      }
      const validRoles = ['USER', 'MANAGER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { message: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    // 激活状态更新（只有管理员可以修改）
    if (isActive !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: 'Only administrators can change user status' },
          { status: 403 }
        );
      }
      updateData.isActive = Boolean(isActive);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      },
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反
        const field = error.meta?.target as string[];
        if (field?.includes('email')) {
          return NextResponse.json(
            { message: 'Email already exists' },
            { status: 409 }
          );
        }
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to update user', error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - 删除用户（只有管理员可以）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用权限检查中间件
    const result = await withRole('ADMIN', async (req, user) => {
      const id = parseInt(params.id, 10);

      if (isNaN(id)) {
        return NextResponse.json(
          { message: 'Invalid user ID' },
          { status: 400 }
        );
      }

      // 不能删除自己
      if (user.id === id) {
        return NextResponse.json(
          { message: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      // 验证用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          stockMovements: true,
        },
      });

      if (!existingUser) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // 检查是否有关联的库存移动记录
      if (existingUser.stockMovements.length > 0) {
        return NextResponse.json(
          { 
            message: 'Cannot delete user with existing stock movement records',
            details: `This user has ${existingUser.stockMovements.length} stock movement records`
          },
          { status: 409 }
        );
      }

      await prisma.user.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );
    })(request);

    return result;
  } catch (error) {
    console.error('Failed to delete user:', error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // 外键约束违反
        return NextResponse.json(
          { message: 'Cannot delete user due to existing references' },
          { status: 409 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: errorMessage },
      { status: 500 }
    );
  }
} 