export { eventBus } from '@/modules/shared/events/event-bus';
export type { IEventBus, IEvent, EventHandler } from '@/modules/shared/events/types';
export { buildEventName } from '@/modules/shared/events/types';

export { success, successPaginated, error, createRequestId } from '@/modules/shared/utils/response-envelope';
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/modules/shared/types';

export { ErrorCodes } from '@/modules/shared/utils/error-codes';
export type { ErrorCode } from '@/modules/shared/utils/error-codes';

export { logger } from '@/modules/shared/utils/logger';
export { featureFlags, isFeatureEnabled } from '@/modules/shared/utils/feature-flags';
export { validate, validateOrThrow, ValidationError, createPaginationSchema, createIdParamSchema } from '@/modules/shared/utils/validation';
export type { ValidationResult } from '@/modules/shared/utils/validation';

export { Currency, Money, Tax, Discount } from '@/modules/shared/money';
export type { CurrencyCode, TaxType, DiscountType } from '@/modules/shared/money';
