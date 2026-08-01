import { z } from 'zod';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { error } from '@/modules/shared/utils/response-envelope';
import type { ApiErrorResponse } from '@/modules/shared/types';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: ApiErrorResponse };

export function validate<T>(schema: z.ZodSchema<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const details: Record<string, unknown> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    details[path] = issue.message;
  }
  return {
    success: false,
    response: error(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      details
    ),
  };
}

export function validateOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = validate(schema, input);
  if (!result.success) {
    throw new ValidationError(result.response.error.message, result.response.error.details);
  }
  return result.data;
}

export class ValidationError extends Error {
  public details?: Record<string, unknown>;
  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export function createPaginationSchema(defaultLimit = 20, maxLimit = 100) {
  return z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(maxLimit).default(defaultLimit),
    sort: z.string().optional(),
  });
}

export function createIdParamSchema() {
  return z.object({
    id: z.string().min(1, 'ID is required'),
  });
}
