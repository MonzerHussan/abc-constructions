import { describe, expect, it } from "vitest";
import {
  isRoleSelectionApiAllowed,
  isRoleSelectionPageAllowed,
} from "@/lib/auth/role-gate";

describe("role-gate", () => {
  it("allows onboarding pages before role confirmation", () => {
    expect(isRoleSelectionPageAllowed("/projects/ABC/onboarding")).toBe(true);
    expect(isRoleSelectionPageAllowed("/projects/ABC")).toBe(true);
    expect(isRoleSelectionPageAllowed("/projects/ABC/marketplace")).toBe(false);
  });

  it("allows onboarding APIs before role confirmation", () => {
    expect(isRoleSelectionApiAllowed("/api/auth/set-role")).toBe(true);
    expect(isRoleSelectionApiAllowed("/api/v1/entity-registry/me")).toBe(true);
    expect(isRoleSelectionApiAllowed("/api/v1/entity-registry/sync-entity-profile")).toBe(true);
    expect(isRoleSelectionApiAllowed("/api/upload")).toBe(true);
    expect(isRoleSelectionApiAllowed("/api/v1/marketplace/products")).toBe(false);
  });
});
