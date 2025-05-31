import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken } from '../../../../src/lib/auth';

const prisma = new PrismaClient();

// POST /api/auth/login - 用户登录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim() },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // 验证密码
    if (!verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // 生成 token
    const token = generateToken(user.id, user.username, user.role);

    // 返回用户信息和 token（不包含密码）
    const { passwordHash, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Login failed', error: errorMessage },
      { status: 500 }
    );
  }
} 