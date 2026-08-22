import type { PersonaPortalConfig } from "@/modules/portal/types/portal-home.types";
import { PlatformAccountType } from "@/lib/account-types";

/**
 * CONTRACTOR persona — the master template for Phase 1.
 * Other personas (Phase 2+) fork this file and adjust dimensions/NBA/CTAs.
 */
export const contractorPortalConfig: PersonaPortalConfig = {
  persona: PlatformAccountType.CONTRACTOR,
  route: "/projects/ABC/contractor",
  titleKey: "portalContractorTitle",
  welcomeKey: "portalContractorWelcome",
  template: "demand",
  defaultCapabilities: ["PROCUREMENT", "TENDERING", "PROJECTS", "MARKETPLACE"],
  activationDimensions: [
    { id: "profile", labelKey: "portalActivationProfile", nextStepKey: "portalActivationProfileNext" },
    { id: "verification", labelKey: "portalActivationVerification", nextStepKey: "portalActivationVerificationNext" },
    { id: "readiness", labelKey: "portalActivationReadiness", nextStepKey: "portalActivationReadinessNext" },
    { id: "operational", labelKey: "portalActivationOperational", nextStepKey: "portalActivationOperationalNext" },
  ],
  kpiSlots: [
    { id: "projects", labelKey: "portalKpiProjects", href: "/projects/ABC/projects" },
    { id: "open_rfqs", labelKey: "portalKpiOpenRfqs", href: "/projects/ABC/procurement/rfqs" },
    { id: "pending_awards", labelKey: "portalKpiPendingAwards", href: "/projects/ABC/procurement/quotations" },
    { id: "active_pos", labelKey: "portalKpiActivePos", href: "/projects/ABC/procurement/purchase-orders" },
  ],
  quickActions: [
    { id: "new_tender", labelKey: "portalQuickNewTender", href: "/projects/ABC/tenders/projects", comingSoon: false },
    { id: "new_pr", labelKey: "portalQuickPurchaseRequest", href: "/projects/ABC/procurement/purchase-requests/new", comingSoon: false },
    { id: "compare_quotations", labelKey: "portalQuickCompareQuotations", href: "/projects/ABC/procurement/quotations", comingSoon: false },
    { id: "track_supply", labelKey: "portalQuickTrackSupply", href: "/projects/ABC/procurement/purchase-orders", comingSoon: false },
  ],
  nbaRules: [
    { id: "pending_rfqs", titleKey: "portalNbaPendingRfqs", href: "/projects/ABC/procurement/rfqs" },
    { id: "profile_incomplete", titleKey: "portalNbaProfileIncomplete", href: "/projects/ABC/onboarding" },
    { id: "verification_pending", titleKey: "portalNbaVerificationPending", href: "/projects/ABC/verification" },
    { id: "no_first_rfq", titleKey: "portalNbaNoFirstRfq", href: "/projects/ABC/procurement/purchase-requests/new" },
    { id: "supplier_match", titleKey: "portalNbaSupplierMatch", href: "/projects/ABC/marketplace", comingSoon: true },
  ],
  navLinks: [
    { id: "projects", labelKey: "portalNavProjects", href: "/projects/ABC/projects" },
    { id: "procurement", labelKey: "portalNavProcurement", href: "/projects/ABC/procurement" },
    { id: "tenders", labelKey: "portalNavTenders", href: "/projects/ABC/tenders/projects" },
    { id: "suppliers", labelKey: "portalNavSuppliers", href: "/projects/ABC/marketplace" },
  ],
};