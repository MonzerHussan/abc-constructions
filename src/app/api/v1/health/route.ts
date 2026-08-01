import { success, error } from '@/modules/shared/utils/response-envelope';
import { logger } from '@/modules/shared/utils/logger';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const start = Date.now();
  const checks: Record<string, { status: string; latency?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy', latency: `${Date.now() - start}ms` };
  } catch (err) {
    checks.database = { status: 'unhealthy' };
    logger.error('Health check: database unhealthy', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { status: 'unhealthy', checks, uptime: process.uptime(), version: process.env.APP_VERSION || '1.0.0' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: 'healthy',
    checks,
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
  });
}
