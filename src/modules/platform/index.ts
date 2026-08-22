export { TenantService, tenantService } from "@/modules/platform/services/TenantService";
export type {
  CreateTenantInput,
  AddMembershipInput,
} from "@/modules/platform/services/TenantService";

export { OutboxService, outboxService } from "@/modules/platform/services/OutboxService";
export type { OutboxEventInput } from "@/modules/platform/services/OutboxService";

export {
  PlatformAuditService,
  platformAuditService,
} from "@/modules/platform/services/PlatformAuditService";
export type { PlatformAuditInput } from "@/modules/platform/services/PlatformAuditService";

export {
  OutboxRelayService,
  outboxRelayService,
} from "@/modules/platform/services/OutboxRelayService";

export {
  IdempotencyService,
  idempotencyService,
} from "@/modules/platform/services/IdempotencyService";

export {
  PlatformPermissions,
  PlatformRoles,
  authorizePlatformPermission,
  resolvePlatformPermissions,
  assertTenantScope,
  tenantScopeFilter,
} from "@/modules/platform/security/platform-authorization";

export {
  checkSodForAction,
  assertSodAllowed,
  SodConflictPairs,
} from "@/modules/platform/security/sod-policy";

export { enforcePlatformAccess } from "@/modules/platform/security/access-pipeline";

export {
  getRequestContext,
  getCorrelationId,
  getActiveTenantId,
  requireRequestContext,
  resolveCorrelationId,
  runWithRequestContext,
} from "@/modules/platform/context/request-context";
export type { RequestContext } from "@/modules/platform/context/request-context";
