// src/lib/middleware.ts
// 认证和权限检查中间件

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken, getCurrentUser, hasPermission, AuthError } from './auth';

// 认证中间件
export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    throw new AuthError('Missing authentication token', 401);
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    throw new AuthError('Invalid or expired token', 401);
  }
  
  const user = await getCurrentUser(token);
  if (!user || !user.isActive) {
    throw new AuthError('User not found or inactive', 401);
  }
  
  return user;
}

// 权限检查中间件
export async function requireRole(request: NextRequest, requiredRole: string) {
  const user = await requireAuth(request);
  
  if (!hasPermission(user.role, requiredRole)) {
    throw new AuthError(`Insufficient permissions. Required: ${requiredRole}`, 403);
  }
  
  return user;
}

// 包装 API 处理函数的高阶函数
export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const user = await requireAuth(request);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { message: error.message },
          { status: error.statusCode }
        );
      }
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// 包装需要特定角色的 API 处理函数
export function withRole(requiredRole: string, handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const user = await requireRole(request, requiredRole);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { message: error.message },
          { status: error.statusCode }
        );
      }
      console.error('Role middleware error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// 可选认证中间件（用户可以是匿名的，但如果提供了 token 则验证）
export async function optionalAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }
  
  try {
    const user = await getCurrentUser(token);
    return user && user.isActive ? user : null;
  } catch (error) {
    return null;
  }
} 