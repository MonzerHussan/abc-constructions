import type { PersonaPortalConfig } from '../../types/portal-home.types';
import { PERSONA_PORTAL_ROUTES } from '../capability-map';

const P = '/projects/ABC';

export const ownerPortalConfig: PersonaPortalConfig = {
  persona: 'OWNER',
  route: PERSONA_PORTAL_ROUTES.OWNER,
  template: 'demand',
  titleKey: 'portalHomeTitleOwner',
  welcomeKey: 'portalWelcomeOwner',
  defaultCapabilities: ['PROJECTS', 'PROCUREMENT', 'TENDERING'],
  activationDimensions: [
    { id: 'profile', weight: 30, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 30, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 20, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'operational', weight: 20, source: 'projects', labelKey: 'portalActFirstProject' },
  ],
  kpiSlots: [
    { id: 'active_projects', labelKey: 'portalKpiActiveProjects', capability: 'PROJECTS', resolver: 'projects.activeCount' },
    { id: 'incoming_offers', labelKey: 'portalKpiIncomingOffers', capability: 'TENDERING', resolver: null },
    { id: 'pending_payments', labelKey: 'portalKpiPendingPayments', capability: 'PROCUREMENT', resolver: null },
    { id: 'profile_complete', labelKey: 'portalKpiProfileComplete', capability: 'PROJECTS', resolver: 'activation.profilePercent' },
  ],
  nbaRules: [
    {
      id: 'no_project',
      priority: 1,
      titleKey: 'portalNbaNoProject',
      ctaKey: 'portalCtaPublishProject',
      href: `${P}/projects`,
      when: { signal: 'projectCount', op: 'eq', value: 0 },
      capability: 'PROJECTS',
    },
    {
      id: 'pending_offers',
      priority: 1,
      titleKey: 'portalNbaPendingOffers',
      ctaKey: 'portalCtaReviewOffers',
      href: `${P}/offers`,
      when: { signal: 'pendingOfferCount', op: 'gt', value: 0 },
      capability: 'TENDERING',
    },
    {
      id: 'verification_pending',
      priority: 2,
      titleKey: 'portalNbaVerificationPending',
      ctaKey: 'portalNbaCompleteVerification',
      href: `${P}/verification`,
      when: { signal: 'isVerified', op: 'falsy' },
    },
  ],
  quickActions: [
    { id: 'publish', labelKey: 'portalCtaPublishProject', href: `${P}/projects`, capability: 'PROJECTS', primary: true },
    { id: 'offers', labelKey: 'portalCtaReviewOffers', href: `${P}/offers`, capability: 'TENDERING', comingSoon: true },
    { id: 'verify', labelKey: 'portalNbaCompleteVerification', href: `${P}/verification`, primary: true },
    { id: 'procurement', labelKey: 'portalCtaGoProcurement', href: `${P}/procurement`, capability: 'PROCUREMENT' },
  ],
  emptyStates: [
    {
      id: 'no_projects',
      when: { signal: 'projectCount', op: 'eq', value: 0 },
      messageKey: 'portalEmptyOwnerNoProjects',
      action: { id: 'publish', labelKey: 'portalCtaPublishProject', href: `${P}/projects` },
    },
    { id: 'no_offers', when: { signal: 'pendingOfferCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyOwnerNoOffers' },
    { id: 'verify', when: { signal: 'isVerified', op: 'falsy' }, messageKey: 'portalEmptyOwnerNotVerified' },
  ],
  navLinks: [
    { id: 'projects', labelKey: 'portalProjects', href: `${P}/projects`, capability: 'PROJECTS' },
    { id: 'offers', labelKey: 'portalNavOffers', href: `${P}/offers`, comingSoon: true },
    { id: 'payments', labelKey: 'portalNavPayments', href: `${P}/procurement/invoices`, capability: 'PROCUREMENT' },
    { id: 'settings', labelKey: 'settings', href: `${P}/organization` },
  ],
};

export const individualPortalConfig: PersonaPortalConfig = {
  persona: 'INDIVIDUAL',
  route: PERSONA_PORTAL_ROUTES.INDIVIDUAL,
  template: 'people',
  titleKey: 'portalHomeTitleIndividual',
  welcomeKey: 'portalWelcomeIndividual',
  defaultCapabilities: ['WORKFORCE', 'TRAINING'],
  activationDimensions: [
    { id: 'profile', weight: 40, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 20, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'skills', weight: 20, source: 'survey', labelKey: 'portalActSkills' },
    { id: 'applications', weight: 20, source: 'projects', labelKey: 'portalActApplications' },
  ],
  kpiSlots: [
    { id: 'job_apps', labelKey: 'portalKpiJobApplications', capability: 'WORKFORCE', resolver: 'workforce.applicationCount' },
    { id: 'courses', labelKey: 'portalKpiEnrolledCourses', capability: 'TRAINING', resolver: 'training.enrolledCount' },
    { id: 'profile_pct', labelKey: 'portalKpiProfileComplete', capability: 'WORKFORCE', resolver: 'activation.profilePercent' },
    { id: 'certs', labelKey: 'portalKpiCertifications', capability: 'WORKFORCE', resolver: null },
  ],
  nbaRules: [
    {
      id: 'profile_low',
      priority: 1,
      titleKey: 'portalNbaProfileIncomplete',
      ctaKey: 'portalCtaCompleteProfile',
      href: `${P}/onboarding`,
      when: { signal: 'activationProfile', op: 'lt', value: 70 },
    },
    {
      id: 'no_applications',
      priority: 2,
      titleKey: 'portalNbaNoJobApplications',
      ctaKey: 'portalCtaSearchJobs',
      href: `${P}/jobs`,
      when: { signal: 'jobApplicationCount', op: 'eq', value: 0 },
      capability: 'WORKFORCE',
    },
    {
      id: 'no_training',
      priority: 3,
      titleKey: 'portalNbaNoTraining',
      ctaKey: 'portalCtaBrowseTraining',
      href: `${P}/training`,
      when: { signal: 'enrolledCourseCount', op: 'eq', value: 0 },
      capability: 'TRAINING',
    },
  ],
  quickActions: [
    { id: 'profile', labelKey: 'portalCtaCompleteProfile', href: `${P}/onboarding`, primary: true },
    { id: 'jobs', labelKey: 'portalCtaSearchJobs', href: `${P}/jobs`, capability: 'WORKFORCE', primary: true },
    { id: 'training', labelKey: 'portalCtaBrowseTraining', href: `${P}/training`, capability: 'TRAINING' },
    { id: 'certs', labelKey: 'portalCtaUploadCerts', href: `${P}/verification` },
  ],
  emptyStates: [
    { id: 'profile_low', when: { signal: 'activationProfile', op: 'lt', value: 70 }, messageKey: 'portalEmptyIndividualProfileLow' },
    { id: 'no_jobs', when: { signal: 'jobApplicationCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyIndividualNoApplications' },
    { id: 'no_courses', when: { signal: 'enrolledCourseCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyIndividualNoCourses' },
  ],
  navLinks: [
    { id: 'profile', labelKey: 'profile', href: `${P}/onboarding` },
    { id: 'jobs', labelKey: 'portalNavJobs', href: `${P}/jobs`, capability: 'WORKFORCE' },
    { id: 'training', labelKey: 'portalNavTraining', href: `${P}/training`, capability: 'TRAINING' },
    { id: 'certs', labelKey: 'portalNavCertifications', href: `${P}/verification` },
  ],
};
