import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const health = await healthCheck();
    
    const status = health.postgresql && health.prisma ? 200 : 503;
    
    return NextResponse.json({
      status: status === 200 ? 'healthy' : 'unhealthy',
      database: health,
      timestamp: health.timestamp,
    }, { status });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 