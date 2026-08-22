import type { PortalCapability } from "@/generated/prisma/client";
import type { PlatformAccountType } from "@/lib/account-types";

/** Portal route per persona (Phase 2 routes are scaffolding only). */
export const PERSONA_PORTAL_ROUTES: Record<PlatformAccountType, string> = {
  OWNER: "/projects/ABC/owner",
  CONSULTANT: "/projects/ABC/consultant",
  CONTRACTOR: "/projects/ABC/contractor",
  SUBCONTRACTOR: "/projects/ABC/subcontractor",
  SUPPLIER: "/projects/ABC/supplier",
  TRADER: "/projects/ABC/trader",
  INDIVIDUAL: "/projects/ABC/individual",
  COMPANY: "/projects/ABC/company",
  ENTITY: "/projects/ABC/entity",
};

/** Default capabilities granted to each persona when it is bootstrapped. */
export const PERSONA_DEFAULT_CAPABILITIES: Record<
  PlatformAccountType,
  PortalCapability[]
> = {
  OWNER: ["TENDERING", "PROJECTS", "SERVICES"],
  CONSULTANT: ["TENDERING", "SERVICES", "PROJECTS"],
  CONTRACTOR: ["PROCUREMENT", "TENDERING", "PROJECTS", "MARKETPLACE"],
  SUBCONTRACTOR: ["TENDERING", "PROJECTS", "WORKFORCE"],
  SUPPLIER: ["MARKETPLACE", "PROCUREMENT", "COMPLIANCE"],
  TRADER: ["MARKETPLACE", "PROCUREMENT"],
  INDIVIDUAL: ["WORKFORCE", "TRAINING"],
  COMPANY: ["SERVICES"],
  ENTITY: ["COMPLIANCE", "SERVICES"],
};

export function getDefaultCapabilitiesForPersona(
  persona: PlatformAccountType
): PortalCapability[] {
  return PERSONA_DEFAULT_CAPABILITIES[persona] ?? [];
}

export function capabilitiesForPersona(persona: string): PortalCapability[] {
  return PERSONA_DEFAULT_CAPABILITIES[persona as PlatformAccountType] ?? [];
}

export function mergeCapabilities(personas: string[]): PortalCapability[] {
  const set = new Set<PortalCapability>();
  for (const persona of personas) {
    for (const capability of capabilitiesForPersona(persona)) set.add(capability);
  }
  return [...set];
}