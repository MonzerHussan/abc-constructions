import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import {
  fetchUserOnboardedStatus,
  isAbcPlatformPath,
  isPreOnboardingPageAllowed,
  ONBOARDING_PATH,
} from '@/lib/onboarding-gate';
import { isPlatformAdminRole } from '@/lib/auth/platform-admin';

const { auth } = NextAuth(authConfig);

const publicPaths = [
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
  '/api/v1/account-types/subcategories/public',
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

  // Legacy standalone auth pages → inline panels on homepage
  if (pathname === "/projects/ABC/auth/login") {
    const url = new URL("/projects/ABC", request.url);
    url.searchParams.set("login", "1");
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }
  if (pathname === "/projects/ABC/auth/register") {
    const url = new URL("/projects/ABC", request.url);
    url.searchParams.set("register", "1");
    const category = request.nextUrl.searchParams.get("category");
    if (category) url.searchParams.set("category", category);
    return NextResponse.redirect(url);
  }

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

  const session = await auth();

  // Page-level route protection (D6)
  if (isProtectedPage(pathname)) {
    if (!session?.user) {
      const loginUrl = new URL('/projects/ABC', request.url);
      loginUrl.searchParams.set('login', '1');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Non-admins still render the page; the admin layout shows an access-denied
    // message instead of silently redirecting to the homepage.
  }

  // Authenticated users who have not completed onboarding may only reach onboarding
  // (and password-recovery pages). Guests may still browse the homepage.
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  if (
    session?.user &&
    !isPlatformAdminRole(sessionRole) &&
    isAbcPlatformPath(pathname) &&
    !isPreOnboardingPageAllowed(pathname)
  ) {
    const onboarded = await fetchUserOnboardedStatus(request);
    if (!onboarded) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
