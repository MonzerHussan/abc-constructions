import type { PortalCapability } from "@/generated/prisma/client";
import type { PlatformAccountType } from "@/lib/account-types";
import type { AnyTranslationKey } from "@/lib/translations";

export type PortalKey = AnyTranslationKey;

export type PortalKpiStatus = "real" | "no_data" | "demo";

export interface PortalOrganizationView {
  name: string;
  verificationLevel: string | null;
}

export interface PortalActivationDimension {
  id: string;
  percent: number;
  labelKey: PortalKey;
  nextStepKey: PortalKey;
}

export interface PortalActivation {
  overall: number;
  dimensions: PortalActivationDimension[];
}

export interface PortalKpi {
  id: string;
  value: number | null;
  status: PortalKpiStatus;
  labelKey: PortalKey;
  href?: string;
}

export interface NextBestAction {
  priority: number;
  titleKey: PortalKey;
  count: number;
  href: string;
  comingSoon?: boolean;
}

export interface PortalQuickAction {
  id: string;
  labelKey: PortalKey;
  href: string;
  comingSoon: boolean;
}

export interface PortalNavLink {
  id: string;
  labelKey: PortalKey;
  href: string;
  comingSoon?: boolean;
  /** Phase 2+ extension hook. */
  capability?: string;
}

export interface PortalRecentActivity {
  id: string;
  titleKey: PortalKey;
  at: string;
}

export interface PortalRecommendation {
  id: string;
  titleKey: PortalKey;
  href?: string;
}

export interface ActivationDimensionDef {
  id: string;
  labelKey: PortalKey;
  nextStepKey?: PortalKey;
  /** Phase 2+ extension hooks (weighted dimensions / source signals). */
  weight?: number;
  source?: string;
}

export interface KpiSlotDef {
  id: string;
  labelKey: PortalKey;
  href?: string;
  /** Phase 2+ extension hooks. */
  capability?: string;
  resolver?: string | null;
}

export interface QuickActionDef {
  id: string;
  labelKey: PortalKey;
  href: string;
  comingSoon?: boolean;
  /** Phase 2+ extension hooks. */
  capability?: string;
  primary?: boolean;
}

export interface NbaWhen {
  signal: string;
  op: "lt" | "gt" | "eq" | "falsy" | "truthy";
  value?: number;
}

export interface NbaRuleDef {
  id: string;
  titleKey: PortalKey;
  href: string;
  comingSoon?: boolean;
  /** Phase 2+ extension hooks. */
  priority?: number;
  ctaKey?: PortalKey;
  when?: NbaWhen;
  capability?: string;
}

export interface PortalEmptyStateDef {
  id: string;
  when?: NbaWhen;
  messageKey: PortalKey;
  action?: { id: string; labelKey: PortalKey; href: string; comingSoon?: boolean };
}

export type PortalTemplate =
  | "demand"
  | "supply"
  | "market"
  | "workforce"
  | "people"
  | "execution"
  | "institutional";

export interface PersonaPortalConfig {
  persona: PlatformAccountType;
  route: string;
  titleKey: PortalKey;
  welcomeKey: PortalKey;
  template: PortalTemplate;
  defaultCapabilities: PortalCapability[];
  activationDimensions: ActivationDimensionDef[];
  kpiSlots: KpiSlotDef[];
  quickActions: QuickActionDef[];
  nbaRules: NbaRuleDef[];
  navLinks: PortalNavLink[];
  /** Phase 2+ extension hooks. */
  distinctionBannerKey?: PortalKey;
  emptyStates?: PortalEmptyStateDef[];
}

export interface PortalHomeResult {
  persona: PlatformAccountType;
  organization: PortalOrganizationView | null;
  activePersonas: PlatformAccountType[];
  capabilities: PortalCapability[];
  activation: PortalActivation;
  kpis: PortalKpi[];
  nextBestActions: NextBestAction[];
  quickActions: PortalQuickAction[];
  navLinks: PortalNavLink[];
  recentActivity: PortalRecentActivity[];
  recommendations: PortalRecommendation[];
}

export interface DurationData {
  profile: boolean;
  profileScore: number;
  isVerified: boolean;
  verificationRank: "verified" | "submitted" | "none";
  surveyDone: boolean;
  hasOperational: boolean;
}

export const PERSONA_DEFAULT_SOURCE = "persona_default";
