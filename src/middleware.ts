import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import {
  isAbcPlatformPath,
  isRoleSelectionApiAllowed,
  isRoleSelectionPageAllowed,
  ROLE_NOT_CONFIRMED_CODE,
} from '@/lib/auth/role-gate';

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
  '/projects/ABC/onboarding',
];

function isPublicPath(pathname: string): boolean {
  const normalized = pathname.startsWith('/projects/ABC/api/')
    ? pathname.slice('/projects/ABC'.length)
    : pathname;
  if (publicPaths.some((p) => normalized.startsWith(p))) return true;

  // Company-wide public pages (e.g. /projects listing of company products).
  // Anything under /projects/ABC stays protected by the checks below.
  if (
    pathname === '/projects' ||
    (pathname.startsWith('/projects/') && !pathname.startsWith('/projects/ABC') && !pathname.startsWith('/projects/ABC/'))
  ) {
    return true;
  }

  // Public company landing pages (services overview + service details).
  if (pathname === '/services' || pathname.startsWith('/services/')) {
    return true;
  }

  return false;
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

    const roleConfirmed = (session.user as { roleConfirmed?: boolean }).roleConfirmed;
    if (roleConfirmed === false && !isRoleSelectionApiAllowed(pathname)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ROLE_NOT_CONFIRMED_CODE,
            message: 'Account type must be confirmed before accessing this resource',
          },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Page-level route protection (D6)
  if (isProtectedPage(pathname) || isAbcPlatformPath(pathname)) {
    const session = await auth();
    if (!session?.user) {
      if (isProtectedPage(pathname)) {
        const loginUrl = new URL('/projects/ABC/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    const roleConfirmed = (session.user as { roleConfirmed?: boolean }).roleConfirmed;
    if (roleConfirmed === false && !isRoleSelectionPageAllowed(pathname)) {
      const onboardingUrl = new URL('/projects/ABC/onboarding', request.url);
      onboardingUrl.searchParams.set('source', 'role-required');
      return NextResponse.redirect(onboardingUrl);
    }
    // Non-admins still render the page; the admin layout shows an access-denied
    // message instead of silently redirecting to the homepage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
