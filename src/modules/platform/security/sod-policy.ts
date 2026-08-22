/**
 * VS-0 Separation of Duties (SoD) policy — foundation for G3-1.
 * Blocks conflicting capability pairs on the same actor within a tenant.
 */

export const SodConflictPairs: ReadonlyArray<readonly [string, string]> = [
  ["financial:initiate", "financial:approve"],
  ["financial:prepare", "financial:release"],
  ["compliance:verify", "compliance:waive"],
  ["sourcing:evaluate", "sourcing:award"],
  ["trust:submit-evidence", "trust:verify-evidence"],
  ["platform:outbox:relay", "platform:audit:write"],
];

export interface SodCheckResult {
  allowed: boolean;
  conflict?: { left: string; right: string };
}

/**
 * Returns false when roleKeys contain both sides of any SoD conflict pair
 * AND the requested action matches one side (dual-control violation).
 */
export function checkSodForAction(
  roleKeys: string[],
  actionPermission: string
): SodCheckResult {
  const roles = new Set(roleKeys);
  for (const [left, right] of SodConflictPairs) {
    if (!roles.has(left) || !roles.has(right)) continue;
    if (actionPermission === left || actionPermission === right) {
      return { allowed: false, conflict: { left, right } };
    }
  }
  return { allowed: true };
}

export class SodViolationError extends Error {
  constructor(
    public readonly conflict: { left: string; right: string },
    public readonly action: string
  ) {
    super(`SoD violation: cannot perform ${action} with roles ${conflict.left} + ${conflict.right}`);
    this.name = "SodViolationError";
  }
}

export function assertSodAllowed(
  roleKeys: string[],
  actionPermission: string
): void {
  const result = checkSodForAction(roleKeys, actionPermission);
  if (!result.allowed && result.conflict) {
    throw new SodViolationError(result.conflict, actionPermission);
  }
}
