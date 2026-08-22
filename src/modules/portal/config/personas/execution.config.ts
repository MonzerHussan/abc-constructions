import type { PersonaPortalConfig } from '../../types/portal-home.types';
import { PERSONA_PORTAL_ROUTES } from '../capability-map';

const P = '/projects/ABC';

export const consultantPortalConfig: PersonaPortalConfig = {
  persona: 'CONSULTANT',
  route: PERSONA_PORTAL_ROUTES.CONSULTANT,
  template: 'execution',
  titleKey: 'portalHomeTitleConsultant',
  welcomeKey: 'portalWelcomeConsultant',
  defaultCapabilities: ['PROJECTS', 'SERVICES', 'COMPLIANCE'],
  activationDimensions: [
    { id: 'profile', weight: 25, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 25, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 25, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'operational', weight: 25, source: 'projects', labelKey: 'portalActSupervisedProjects' },
  ],
  kpiSlots: [
    { id: 'supervised', labelKey: 'portalKpiSupervisedProjects', capability: 'PROJECTS', resolver: null },
    { id: 'approvals', labelKey: 'portalKpiPendingApprovals', capability: 'SERVICES', resolver: null },
    { id: 'quality_reports', labelKey: 'portalKpiQualityReportsMonth', capability: 'COMPLIANCE', resolver: null },
    { id: 'open_ncr', labelKey: 'portalKpiOpenNcr', capability: 'COMPLIANCE', resolver: null },
  ],
  nbaRules: [
    {
      id: 'pending_approvals',
      priority: 1,
      titleKey: 'portalNbaPendingApprovals',
      ctaKey: 'portalCtaReviewApprovals',
      href: `${P}/consultant/approvals`,
      when: { signal: 'pendingApprovalCount', op: 'gt', value: 0 },
      capability: 'SERVICES',
    },
    {
      id: 'open_ncr',
      priority: 2,
      titleKey: 'portalNbaOpenNcr',
      ctaKey: 'portalCtaViewNcr',
      href: `${P}/consultant/ncr`,
      when: { signal: 'openNcrCount', op: 'gt', value: 0 },
      capability: 'COMPLIANCE',
    },
  ],
  quickActions: [
    { id: 'projects', labelKey: 'portalCtaOpenSupervisedProject', href: `${P}/consultant/projects`, comingSoon: true, primary: true },
    { id: 'approvals', labelKey: 'portalCtaTodayApprovals', href: `${P}/consultant/approvals`, comingSoon: true },
    { id: 'inspection', labelKey: 'portalCtaUploadInspection', href: `${P}/consultant/inspections/create`, comingSoon: true },
    { id: 'ncr', labelKey: 'portalCtaViewNcr', href: `${P}/consultant/ncr`, comingSoon: true },
  ],
  emptyStates: [
    { id: 'no_supervised', when: { signal: 'supervisedProjectCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyConsultantNoProjects' },
    { id: 'no_approvals', when: { signal: 'pendingApprovalCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyConsultantNoApprovals' },
    { id: 'no_reports', when: { signal: 'qualityReportsMonth', op: 'eq', value: 0 }, messageKey: 'portalEmptyConsultantNoReports' },
  ],
  navLinks: [
    { id: 'projects', labelKey: 'portalProjects', href: `${P}/consultant/projects`, comingSoon: true },
    { id: 'approvals', labelKey: 'portalNavApprovals', href: `${P}/consultant/approvals`, comingSoon: true },
    { id: 'reports', labelKey: 'portalNavReports', href: `${P}/consultant/inspections`, comingSoon: true },
    { id: 'ncr', labelKey: 'portalNavNcr', href: `${P}/consultant/ncr`, comingSoon: true },
  ],
};

export const subcontractorPortalConfig: PersonaPortalConfig = {
  persona: 'SUBCONTRACTOR',
  route: PERSONA_PORTAL_ROUTES.SUBCONTRACTOR,
  template: 'execution',
  titleKey: 'portalHomeTitleSubcontractor',
  welcomeKey: 'portalWelcomeSubcontractor',
  defaultCapabilities: ['TENDERING', 'PROJECTS', 'WORKFORCE', 'SERVICES'],
  activationDimensions: [
    { id: 'profile', weight: 25, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 25, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 25, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'operational', weight: 25, source: 'projects', labelKey: 'portalActBidsSubmitted' },
  ],
  kpiSlots: [
    { id: 'bids', labelKey: 'portalKpiBidsSubmitted', capability: 'TENDERING', resolver: null },
    { id: 'contracts', labelKey: 'portalKpiActiveContracts', capability: 'PROJECTS', resolver: null },
    { id: 'receivables', labelKey: 'portalKpiPendingReceivables', capability: 'PROCUREMENT', resolver: null },
    { id: 'licenses', labelKey: 'portalKpiValidLicenses', capability: 'COMPLIANCE', resolver: null },
  ],
  nbaRules: [
    {
      id: 'no_bids',
      priority: 2,
      titleKey: 'portalNbaNoBidsYet',
      ctaKey: 'portalCtaBrowseSubTenders',
      href: `${P}/tenders/projects`,
      when: { signal: 'bidCount', op: 'eq', value: 0 },
      capability: 'TENDERING',
    },
    {
      id: 'expired_licenses',
      priority: 1,
      titleKey: 'portalNbaLicensesExpiring',
      ctaKey: 'portalCtaUpdateSpecialties',
      href: `${P}/profile/specialties`,
      when: { signal: 'hasExpiredLicenses', op: 'truthy' },
    },
  ],
  quickActions: [
    { id: 'browse', labelKey: 'portalCtaBrowseSubTenders', href: `${P}/tenders/projects`, capability: 'TENDERING', primary: true },
    { id: 'bid', labelKey: 'portalCtaSubmitBid', href: `${P}/tenders/projects`, capability: 'TENDERING' },
    { id: 'specialties', labelKey: 'portalCtaUpdateSpecialties', href: `${P}/profile/specialties`, comingSoon: true },
    { id: 'contracts', labelKey: 'portalCtaViewContracts', href: `${P}/contracts`, comingSoon: true },
  ],
  emptyStates: [
    { id: 'no_bids', when: { signal: 'bidCount', op: 'eq', value: 0 }, messageKey: 'portalEmptySubNoBids' },
    { id: 'no_contracts', when: { signal: 'activeContractCount', op: 'eq', value: 0 }, messageKey: 'portalEmptySubNoContracts' },
    { id: 'licenses', when: { signal: 'hasExpiredLicenses', op: 'truthy' }, messageKey: 'portalEmptySubLicenses' },
  ],
  navLinks: [
    { id: 'opportunities', labelKey: 'portalNavOpportunities', href: `${P}/tenders/projects`, capability: 'TENDERING' },
    { id: 'bids', labelKey: 'portalNavMyBids', href: `${P}/tenders/projects`, capability: 'TENDERING' },
    { id: 'contracts', labelKey: 'portalNavContracts', href: `${P}/contracts`, comingSoon: true },
    { id: 'receivables', labelKey: 'portalNavReceivables', href: `${P}/procurement/invoices`, comingSoon: true },
  ],
};
