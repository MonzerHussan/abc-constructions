export { UserService } from '@/modules/core/services/UserService';
export { OrganizationService } from '@/modules/core/services/OrganizationService';
export { RBACService } from '@/modules/core/services/RBACService';
export { AuditService } from '@/modules/core/services/AuditService';
export type { AuditInput } from '@/modules/core/services/AuditService';

export type { CreateUserInput, UpdateUserInput, LoginInput, ChangePasswordInput } from '@/modules/core/validators/user-schemas';
export type { CreateOrgInput, UpdateOrgInput } from '@/modules/core/validators/org-schemas';

import { UserService } from '@/modules/core/services/UserService';
import { OrganizationService } from '@/modules/core/services/OrganizationService';
import { RBACService } from '@/modules/core/services/RBACService';
import { AuditService } from '@/modules/core/services/AuditService';

export const userService = new UserService();
export const orgService = new OrganizationService();
export const rbacService = new RBACService();
export const auditService = new AuditService();
