import type { PersonaPortalConfig } from '../../types/portal-home.types';
import { PERSONA_PORTAL_ROUTES } from '../capability-map';

const P = '/projects/ABC';

export const companyPortalConfig: PersonaPortalConfig = {
  persona: 'COMPANY',
  route: PERSONA_PORTAL_ROUTES.COMPANY,
  template: 'institutional',
  titleKey: 'portalHomeTitleCompany',
  welcomeKey: 'portalWelcomeCompany',
  defaultCapabilities: ['SERVICES', 'PROJECTS', 'PROCUREMENT', 'COMPLIANCE'],
  activationDimensions: [
    { id: 'profile', weight: 25, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 25, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 25, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'operational', weight: 25, source: 'projects', labelKey: 'portalActActiveContracts' },
  ],
  kpiSlots: [
    { id: 'contracts', labelKey: 'portalKpiActiveContracts', capability: 'SERVICES', resolver: null },
    { id: 'renewal', labelKey: 'portalKpiRenewalRate', capability: 'SERVICES', resolver: null },
    { id: 'sla', labelKey: 'portalKpiSlaCompliance', capability: 'COMPLIANCE', resolver: null },
    { id: 'collections', labelKey: 'portalKpiCollectionDelay', capability: 'PROCUREMENT', resolver: null },
  ],
  nbaRules: [
    {
      id: 'contracts_renewing',
      priority: 2,
      titleKey: 'portalNbaContractsRenewing',
      ctaKey: 'portalCtaReviewContracts',
      href: `${P}/contracts`,
      when: { signal: 'contractsRenewingSoon', op: 'gt', value: 0 },
      capability: 'SERVICES',
    },
    {
      id: 'collection_delay',
      priority: 1,
      titleKey: 'portalNbaCollectionDelay',
      ctaKey: 'portalCtaTrackCollections',
      href: `${P}/collections`,
      when: { signal: 'hasCollectionDelay', op: 'truthy' },
      capability: 'PROCUREMENT',
    },
  ],
  quickActions: [
    { id: 'new_contract', labelKey: 'portalCtaNewContract', href: `${P}/contracts/create`, comingSoon: true, primary: true },
    { id: 'spare_parts', labelKey: 'portalCtaSpareParts', href: `${P}/spare-parts`, comingSoon: true },
    { id: 'sla', labelKey: 'portalCtaSlaReport', href: `${P}/sla/report`, comingSoon: true },
    { id: 'collections', labelKey: 'portalCtaTrackCollections', href: `${P}/collections`, comingSoon: true },
  ],
  emptyStates: [
    { id: 'no_contracts', when: { signal: 'activeContractCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyCompanyNoContracts' },
    { id: 'no_spare', when: { signal: 'openSparePartRequests', op: 'eq', value: 0 }, messageKey: 'portalEmptyCompanyNoSpareParts' },
    { id: 'renew', when: { signal: 'contractsRenewingSoon', op: 'gt', value: 0 }, messageKey: 'portalEmptyCompanyRenewSoon' },
  ],
  navLinks: [
    { id: 'contracts', labelKey: 'portalNavContracts', href: `${P}/contracts`, comingSoon: true },
    { id: 'spare', labelKey: 'portalNavSpareParts', href: `${P}/spare-parts`, comingSoon: true },
    { id: 'sla', labelKey: 'portalNavSla', href: `${P}/sla/report`, comingSoon: true },
    { id: 'collections', labelKey: 'portalNavCollections', href: `${P}/collections`, comingSoon: true },
  ],
};

export const entityPortalConfig: PersonaPortalConfig = {
  persona: 'ENTITY',
  route: PERSONA_PORTAL_ROUTES.ENTITY,
  template: 'institutional',
  titleKey: 'portalHomeTitleEntity',
  welcomeKey: 'portalWelcomeEntity',
  defaultCapabilities: ['COMPLIANCE', 'SERVICES'],
  activationDimensions: [
    { id: 'profile', weight: 30, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 30, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 20, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'integration', weight: 20, source: 'projects', labelKey: 'portalActIntegration' },
  ],
  kpiSlots: [
    { id: 'collab', labelKey: 'portalKpiOpenCollaborations', capability: 'SERVICES', resolver: null },
    { id: 'accreditation', labelKey: 'portalKpiPendingAccreditation', capability: 'COMPLIANCE', resolver: null },
    { id: 'pilots', labelKey: 'portalKpiPilotProjects', capability: 'SERVICES', resolver: null },
    { id: 'api', labelKey: 'portalKpiApiStatus', capability: 'COMPLIANCE', resolver: null },
  ],
  nbaRules: [
    {
      id: 'pending_accreditation',
      priority: 1,
      titleKey: 'portalNbaPendingAccreditation',
      ctaKey: 'portalCtaAccreditationStatus',
      href: `${P}/accreditation`,
      when: { signal: 'pendingAccreditationCount', op: 'gt', value: 0 },
      capability: 'COMPLIANCE',
    },
    {
      id: 'no_integration',
      priority: 2,
      titleKey: 'portalNbaNoIntegration',
      ctaKey: 'portalCtaApiIntegration',
      href: `${P}/integrations`,
      when: { signal: 'hasActiveIntegration', op: 'falsy' },
    },
  ],
  quickActions: [
    { id: 'collab', labelKey: 'portalCtaCollaborationRequest', href: `${P}/collaboration/request`, comingSoon: true, primary: true },
    { id: 'accreditation', labelKey: 'portalCtaAccreditationStatus', href: `${P}/accreditation`, comingSoon: true },
    { id: 'api', labelKey: 'portalCtaApiIntegration', href: `${P}/integrations`, comingSoon: true },
    { id: 'pilots', labelKey: 'portalCtaPilotProjects', href: `${P}/pilots`, comingSoon: true },
  ],
  emptyStates: [
    { id: 'no_collab', when: { signal: 'openCollaborationCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyEntityNoCollab' },
    { id: 'no_accreditation', when: { signal: 'pendingAccreditationCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyEntityNoAccreditation' },
    { id: 'no_integration', when: { signal: 'hasActiveIntegration', op: 'falsy' }, messageKey: 'portalEmptyEntityNoIntegration' },
  ],
  navLinks: [
    { id: 'collab', labelKey: 'portalNavCollaboration', href: `${P}/collaboration/request`, comingSoon: true },
    { id: 'accreditation', labelKey: 'portalNavAccreditation', href: `${P}/accreditation`, comingSoon: true },
    { id: 'integrations', labelKey: 'portalNavIntegrations', href: `${P}/integrations`, comingSoon: true },
    { id: 'pilots', labelKey: 'portalNavPilots', href: `${P}/pilots`, comingSoon: true },
  ],
};
