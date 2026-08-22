import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface RequestContext {
  correlationId: string;
  tenantId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T
): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function requireRequestContext(): RequestContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error("RequestContext is not available");
  }
  return ctx;
}

export function getCorrelationId(): string {
  return getRequestContext()?.correlationId ?? randomUUID();
}

export function getActiveTenantId(): string | undefined {
  return getRequestContext()?.tenantId;
}

export function resolveCorrelationId(headerValue: string | null): string {
  const trimmed = headerValue?.trim();
  if (trimmed && trimmed.length <= 128) {
    return trimmed;
  }
  return randomUUID();
}
