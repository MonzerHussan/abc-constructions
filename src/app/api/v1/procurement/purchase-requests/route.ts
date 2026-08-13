import { NextRequest, NextResponse } from 'next/server';
import { purchaseRequestService, prListQuerySchema, createPRSchema } from '@/modules/procurement';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { logger } from '@/modules/shared/utils/logger';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = prListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(error(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters'), { status: 400 });
    }
    const result = await purchaseRequestService.list(parsed.data);
    return NextResponse.json(successPaginated(result.items, { page: parsed.data.page, limit: parsed.data.limit, total: result.total }));
  } catch (err) {
    logger.error('Failed to list purchase requests', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch purchase requests'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = validate(createPRSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });
    const pr = await purchaseRequestService.create(parsed.data, sessionUserId);
    return NextResponse.json(success(pr), { status: 201 });
  } catch (err) {
    logger.error('Failed to create purchase request', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to create purchase request'), { status: 500 });
  }
});