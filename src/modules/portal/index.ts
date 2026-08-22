export {
  PortalHomeService,
  portalHomeService,
} from "@/modules/portal/services/PortalHomeService";
export {
  ActivationScoreService,
  activationScoreService,
} from "@/modules/portal/services/ActivationScoreService";
export {
  NextBestActionService,
  nextBestActionService,
} from "@/modules/portal/services/NextBestActionService";
export { contractorPortalConfig } from "@/modules/portal/config/personas/contractor.config";
export {
  PORTAL_PERSONA_CONFIGS,
  getPortalConfig,
} from "@/modules/portal/config/personas";
export {
  PERSONA_DEFAULT_CAPABILITIES,
  getDefaultCapabilitiesForPersona,
} from "@/modules/portal/config/capability-map";
export type {
  PortalHomeResult,
  PortalKpi,
  NextBestAction,
  PortalQuickAction,
  PersonaPortalConfig,
  PortalOrganizationView,
  PortalActivation,
  PortalActivationDimension,
} from "@/modules/portal/types/portal-home.types";