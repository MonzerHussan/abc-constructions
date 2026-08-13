/**
 * Route-level authorization guard.
 *
 * Wraps a Next.js Route Handler so that:
 * 1. The caller is authenticated (session.user.id present).
 * 2. (Optional) The caller has a specific permission key via RBAC.
 *
 * Usage:
 *   export const POST = withPermission('procurement:rfq:create', async (req, ctx) => { ... });
 *   export const DELETE = withPermission('procurement:rfq:delete', async (req, ctx) => { ... });
 *
 * ctx.sessionUserId is the authenticated user's id — pass it to service
 * methods so they can enforce ownership (IDOR protection).
 *
 * P5 Gatekeeper — VULN-01 fix: centralize requirePermission enforcement.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export interface AuthedContext {
  sessionUserId: string;
  sessionRole?: string;
  params: Record<string, string>;
}

type Handler = (
  req: NextRequest,
  ctx: AuthedContext,
) => Promise<NextResponse> | NextResponse;

export function withPermission(permissionKey: string | null, handler: Handler) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> } = { params: Promise.resolve({}) },
  ): Promise<NextResponse> => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'),
          { status: 401 },
        );
      }

      if (permissionKey) {
        const guard = await requirePermission(permissionKey);
        if (!guard.allowed) {
          return NextResponse.json(
            error(ErrorCodes.CORE_USER_FORBIDDEN, guard.error ?? 'Forbidden'),
            { status: guard.status ?? 403 },
          );
        }
      }

      const resolvedParams = await params;
      return handler(req, {
        sessionUserId: session.user.id,
        sessionRole: (session.user as { role?: string }).role,
        params: resolvedParams,
      });
    } catch {
      return NextResponse.json(
        error(ErrorCodes.INTERNAL_ERROR, 'Authorization check failed'),
        { status: 500 },
      );
    }
  };
}

/**
 * Authentication-only guard (no permission check).
 * Use for endpoints where ownership is verified in the service layer
 * via sessionUserId, but no specific permission key applies.
 */
export function withAuth(handler: Handler) {
  return withPermission(null, handler);
}