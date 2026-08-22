import type { PortalCapability } from "@/generated/prisma/client";
import type { PlatformAccountType } from "@/lib/account-types";
import type {
  PersonaPortalConfig,
  PortalTemplate,
} from "@/modules/portal/types/portal-home.types";
import { contractorPortalConfig } from "@/modules/portal/config/personas/contractor.config";
import {
  supplierPortalConfig,
  traderPortalConfig,
} from "@/modules/portal/config/personas/supply.config";
import { PERSONA_PORTAL_ROUTES } from "@/modules/portal/config/capability-map";
import type { TranslationKey } from "@/lib/translations";

/**
 * Phase 2 scaffolding: fork the CONTRACTOR master template for the remaining
 * personas. Content blocks (dimensions/KPIs/quick actions) are inherited;
 * Phase 2 will replace them from the portal-config table.
 */
function makePlaceholder(
  persona: PlatformAccountType,
  template: PortalTemplate,
  titleKey: TranslationKey,
  welcomeKey: TranslationKey,
  defaultCapabilities: PortalCapability[]
): PersonaPortalConfig {
  return {
    ...contractorPortalConfig,
    persona,
    route: PERSONA_PORTAL_ROUTES[persona],
    template,
    titleKey,
    welcomeKey,
    defaultCapabilities,
  };
}

export const PORTAL_PERSONA_CONFIGS: PersonaPortalConfig[] = [
  contractorPortalConfig,
  supplierPortalConfig,
  traderPortalConfig,
  makePlaceholder("OWNER", "demand", "portalContractorTitle", "portalContractorWelcome", ["TENDERING", "PROJECTS", "SERVICES"]),
  makePlaceholder("CONSULTANT", "demand", "portalContractorTitle", "portalContractorWelcome", ["TENDERING", "SERVICES", "PROJECTS"]),
  makePlaceholder("SUBCONTRACTOR", "demand", "portalContractorTitle", "portalContractorWelcome", ["TENDERING", "PROJECTS", "WORKFORCE"]),
  makePlaceholder("INDIVIDUAL", "workforce", "portalContractorTitle", "portalContractorWelcome", ["WORKFORCE", "TRAINING"]),
  makePlaceholder("COMPANY", "supply", "portalContractorTitle", "portalContractorWelcome", ["SERVICES"]),
  makePlaceholder("ENTITY", "demand", "portalContractorTitle", "portalContractorWelcome", ["COMPLIANCE", "SERVICES"]),
];

export function getPortalConfig(
  persona: string | null | undefined
): PersonaPortalConfig | null {
  if (!persona) return null;
  return PORTAL_PERSONA_CONFIGS.find((c) => c.persona === persona) ?? null;
}