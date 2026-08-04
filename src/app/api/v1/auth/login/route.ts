import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/modules/shared/utils/logger';

const LOGIN_LIMIT = 15;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days, matches NextAuth maxAge

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

/**
 * POST /api/v1/auth/login
 * Mobile-optimized auth endpoint. Validates credentials, returns a JWT
 * (compatible with the NextAuth AUTH_SECRET) plus the safe user object.
 *
 * Request:  { "email": string, "password": string }
 * Response: { "token": string, "user": { id, email, name, role, avatar } }
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rl = rateLimit({ key: `mobile-login:${ip}`, limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const rlByEmail = rateLimit({ key: `mobile-login:${email}`, limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS });
    if (!rlByEmail.ok) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rlByEmail.retryAfterMs / 1000)) } },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json({ error: 'MFA is required for this account' }, { status: 428 });
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
      .sign(getSecretKey());

    logger.info('Mobile login success', { userId: user.id, email: user.email });

    return NextResponse.json({
      token,
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
    logger.error('Mobile login failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
