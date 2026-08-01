import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/v1/health',
  '/api/auth',
];

// Pages requiring an authenticated session (portal pages)
const protectedPages = [
  '/organization',
  '/verification',
  '/procurement',
  '/admin',
  '/settings',
  '/delivery/driver',
];

// Admin-only prefix
const adminOnly = ['/admin'];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p));
}

function shouldSkipAuth(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images')
  );
}

function isProtectedPage(pathname: string): boolean {
  return protectedPages.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipAuth(pathname)) return NextResponse.next();
  if (isPublicPath(pathname)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'CORE_USER_UNAUTHORIZED', message: 'Authentication required' },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Page-level route protection (D6)
  if (isProtectedPage(pathname)) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (adminOnly.some((p) => pathname.startsWith(p)) && (session.user as { role?: string }).role !== 'ADMIN' && (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
