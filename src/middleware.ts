import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const publicPaths = [
  '/projects/ABC/auth/login',
  '/projects/ABC/auth/register',
  '/projects/ABC/auth/forgot-password',
  '/projects/ABC/auth/reset-password',
  '/api/v1/health',
  '/api/auth',
  '/api/v1/auth',
  // Public-read (browsing) endpoints — no auth required (mobile + web)
  '/api/homepage',
  '/api/v1/marketplace/products',
  '/api/v1/marketplace/categories',
  '/api/v1/marketplace/suppliers',
  '/api/v1/marketplace/compare',
  // Public homepage content (admin writes via /api/admin/homepage/*)
  '/api/homepage',
];

// Pages requiring an authenticated session (portal pages)
const protectedPages = [
  '/projects/ABC/organization',
  '/projects/ABC/verification',
  '/projects/ABC/procurement',
  '/projects/ABC/admin',
  '/projects/ABC/settings',
  '/projects/ABC/delivery/driver',
];

function isPublicPath(pathname: string): boolean {
  const normalized = pathname.startsWith('/projects/ABC/api/')
    ? pathname.slice('/projects/ABC'.length)
    : pathname;
  return publicPaths.some((p) => normalized.startsWith(p));
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

function isApiPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') || pathname.startsWith('/projects/ABC/api/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipAuth(pathname)) return NextResponse.next();
  if (isPublicPath(pathname)) return NextResponse.next();

  if (isApiPath(pathname)) {
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
      const loginUrl = new URL('/projects/ABC/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Non-admins still render the page; the admin layout shows an access-denied
    // message instead of silently redirecting to the homepage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
