import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hashPassword, generateToken } from '../../../../src/lib/auth';

const prisma = new PrismaClient();

// POST /api/auth/register - 用户注册
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName } = body;

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

    // 哈希密码
    const passwordHash = hashPassword(String(password));

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role: 'USER', // 默认角色为 USER
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

    // 生成 token
    const token = generateToken(user.id, user.username, user.role);

    return NextResponse.json({
      message: 'Registration successful',
      user,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
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
      { message: 'Registration failed', error: errorMessage },
      { status: 500 }
    );
  }
} 