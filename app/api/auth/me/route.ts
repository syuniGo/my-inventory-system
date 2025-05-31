import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../src/lib/middleware';

// GET /api/auth/me - 获取当前用户信息
export const GET = withAuth(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: 'User information retrieved successfully',
    user,
  });
}); 