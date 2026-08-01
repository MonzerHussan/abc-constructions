import type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiMeta,
  PaginationMeta,
  PaginationParams,
} from '@/modules/shared/types';

export function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createMeta(requestId?: string): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId: requestId || createRequestId(),
  };
}

export function success<T>(
  data: T,
  requestId?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: createMeta(requestId),
  };
}

export function successPaginated<T>(
  data: T,
  pagination: PaginationParams & { total: number },
  requestId?: string
): ApiSuccessResponse<T> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  return {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
    meta: createMeta(requestId),
  };
}

export function error(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: createMeta(requestId),
  };
}

export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
