export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  filter?: Record<string, string>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthenticatedRequest {
  userId: string;
  orgId: string;
  sessionId: string;
}

export type DomainName =
  | 'core'
  | 'procurement'
  | 'tenders'
  | 'marketplace'
  | 'projects'
  | 'jobs'
  | 'delivery'
  | 'training'
  | 'research'
  | 'crm'
  | 'social'
  | 'notification'
  | 'workflow'
  | 'rules'
  | 'analytics'
  | 'search'
  | 'storage'
  | 'ai';

export type ActionName =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'received'
  | 'paid'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'sent'
  | 'closed'
  | 'awarded'
  | 'SupplierInvited';
