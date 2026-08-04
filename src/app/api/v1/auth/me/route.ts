import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

/**
 * GET /api/v1/auth/me
 * Validates a mobile JWT (Bearer) and returns the current user.
 * Used by the iOS app to restore/validate sessions from Keychain.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
    }

    let payload: { id?: string };
    try {
      const { payload: verified } = await jwtVerify(token, getSecretKey());
      payload = verified as { id?: string };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (!payload.id) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? (err as { code?: string }).code
        : undefined;

    logger.error('Mobile me failed', {
      error: err instanceof Error ? err.message : String(err),
      code,
    });

    if (code === 'AUTH_SECRET_MISSING') {
      return NextResponse.json(
        { error: 'Server is not configured for authentication', code },
        { status: 503 },
      );
    }
    if (code === 'P2021' || code === 'P2022') {
      return NextResponse.json(
        { error: 'Database schema not migrated', code },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Failed to fetch user', code: code ?? 'UNKNOWN' }, { status: 500 });
  }
}
