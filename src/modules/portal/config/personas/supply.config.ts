import type { PersonaPortalConfig } from '../../types/portal-home.types';
import { PERSONA_PORTAL_ROUTES } from '../capability-map';

const P = '/projects/ABC';

export const supplierPortalConfig: PersonaPortalConfig = {
  persona: 'SUPPLIER',
  route: PERSONA_PORTAL_ROUTES.SUPPLIER,
  template: 'supply',
  titleKey: 'portalHomeTitleSupplier',
  welcomeKey: 'portalWelcomeSupplier',
  defaultCapabilities: ['MARKETPLACE', 'PROCUREMENT', 'COMPLIANCE'],
  activationDimensions: [
    { id: 'profile', weight: 20, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 20, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'readiness', weight: 20, source: 'survey', labelKey: 'portalActReadiness' },
    { id: 'catalog', weight: 40, source: 'catalog', labelKey: 'portalActCatalog' },
  ],
  kpiSlots: [
    { id: 'incoming_rfqs', labelKey: 'portalKpiIncomingRfqs', capability: 'PROCUREMENT', resolver: 'procurement.rfqs.incomingCount' },
    { id: 'open_quotes', labelKey: 'portalKpiOpenQuotes', capability: 'PROCUREMENT', resolver: 'procurement.quotations.openCount' },
    { id: 'conversion_rate', labelKey: 'portalKpiConversionRate', capability: 'PROCUREMENT', resolver: null },
    { id: 'catalog_items', labelKey: 'portalKpiCatalogItems', capability: 'MARKETPLACE', resolver: 'catalog.itemCount' },
  ],
  nbaRules: [
    {
      id: 'catalog_incomplete',
      priority: 1,
      titleKey: 'portalNbaCatalogIncomplete',
      ctaKey: 'portalNbaCompleteCatalog',
      href: `${P}/supplier/catalog`,
      when: { signal: 'catalogComplete', op: 'lt', value: 80 },
      capability: 'MARKETPLACE',
    },
    {
      id: 'pending_rfqs_in',
      priority: 1,
      titleKey: 'portalNbaIncomingRfqs',
      ctaKey: 'portalNbaRespondNow',
      href: `${P}/procurement/rfqs`,
      when: { signal: 'rfqIncomingPending', op: 'gt', value: 0 },
      capability: 'PROCUREMENT',
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
    { id: 'catalog', labelKey: 'portalCtaCompleteCatalog', href: `${P}/supplier/catalog`, capability: 'MARKETPLACE', comingSoon: true, primary: true },
    { id: 'rfq', labelKey: 'portalCtaRespondRfq', href: `${P}/procurement/rfqs`, capability: 'PROCUREMENT' },
    { id: 'inventory', labelKey: 'portalCtaUpdateInventory', href: `${P}/supplier/inventory`, capability: 'MARKETPLACE', comingSoon: true },
    { id: 'certs', labelKey: 'portalCtaUploadCert', href: `${P}/verification`, capability: 'COMPLIANCE' },
  ],
  emptyStates: [
    {
      id: 'empty_catalog',
      when: { signal: 'catalogItemCount', op: 'eq', value: 0 },
      messageKey: 'portalEmptySupplierNoCatalog',
      action: { id: 'add_catalog', labelKey: 'portalCtaCompleteCatalog', href: `${P}/supplier/catalog`, comingSoon: true },
    },
    { id: 'no_incoming_rfqs', when: { signal: 'rfqIncomingPending', op: 'eq', value: 0 }, messageKey: 'portalEmptySupplierNoRfqs' },
    { id: 'no_certs', when: { signal: 'hasCertifications', op: 'falsy' }, messageKey: 'portalEmptySupplierNoCerts' },
  ],
  navLinks: [
    { id: 'rfqs', labelKey: 'portalNavRfqInbox', href: `${P}/procurement/rfqs`, capability: 'PROCUREMENT' },
    { id: 'catalog', labelKey: 'portalCatalog', href: `${P}/supplier/catalog`, capability: 'MARKETPLACE', comingSoon: true },
    { id: 'inventory', labelKey: 'portalNavInventory', href: `${P}/supplier/inventory`, comingSoon: true },
    { id: 'certs', labelKey: 'portalNavCertifications', href: `${P}/verification`, capability: 'COMPLIANCE' },
  ],
};

export const traderPortalConfig: PersonaPortalConfig = {
  persona: 'TRADER',
  route: PERSONA_PORTAL_ROUTES.TRADER,
  template: 'supply',
  titleKey: 'portalHomeTitleTrader',
  welcomeKey: 'portalWelcomeTrader',
  distinctionBannerKey: 'portalTraderBanner',
  defaultCapabilities: ['MARKETPLACE', 'PROCUREMENT'],
  activationDimensions: [
    { id: 'profile', weight: 25, source: 'entity-registry', labelKey: 'portalActProfile' },
    { id: 'verification', weight: 25, source: 'verification', labelKey: 'portalActVerification' },
    { id: 'products', weight: 25, source: 'catalog', labelKey: 'portalActProducts' },
    { id: 'pricing', weight: 25, source: 'pricing', labelKey: 'portalActPricing' },
  ],
  kpiSlots: [
    { id: 'inquiries_month', labelKey: 'portalKpiInquiriesMonth', capability: 'PROCUREMENT', resolver: null },
    { id: 'credit_sales_pct', labelKey: 'portalKpiCreditSalesPct', capability: 'PROCUREMENT', resolver: null },
    { id: 'listed_stock', labelKey: 'portalKpiListedStock', capability: 'MARKETPLACE', resolver: 'catalog.itemCount' },
    { id: 'new_customers', labelKey: 'portalKpiNewCustomers', capability: 'MARKETPLACE', resolver: null },
  ],
  nbaRules: [
    {
      id: 'no_listed_stock',
      priority: 1,
      titleKey: 'portalNbaNoListedStock',
      ctaKey: 'portalCtaListOnMarketplace',
      href: `${P}/marketplace`,
      when: { signal: 'catalogItemCount', op: 'eq', value: 0 },
      capability: 'MARKETPLACE',
    },
    {
      id: 'pricing_stale',
      priority: 2,
      titleKey: 'portalNbaPricingStale',
      ctaKey: 'portalCtaUpdatePricing',
      href: `${P}/trader/pricing`,
      when: { signal: 'pricingStaleDays', op: 'gt', value: 30 },
      capability: 'MARKETPLACE',
    },
    {
      id: 'pending_inquiries',
      priority: 1,
      titleKey: 'portalNbaPendingInquiries',
      ctaKey: 'portalNbaRespondNow',
      href: `${P}/trader/inquiries`,
      when: { signal: 'inquiryPending', op: 'gt', value: 0 },
      capability: 'PROCUREMENT',
    },
  ],
  quickActions: [
    { id: 'list', labelKey: 'portalCtaListOnMarketplace', href: `${P}/marketplace`, capability: 'MARKETPLACE', primary: true },
    { id: 'pricing', labelKey: 'portalCtaUpdatePricing', href: `${P}/trader/pricing`, comingSoon: true },
    { id: 'inquiries', labelKey: 'portalCtaRespondInquiries', href: `${P}/trader/inquiries`, comingSoon: true },
    { id: 'whatsapp', labelKey: 'portalCtaWhatsappIntegration', href: `${P}/integrations/whatsapp`, comingSoon: true },
  ],
  emptyStates: [
    { id: 'no_stock', when: { signal: 'catalogItemCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyTraderNoStock' },
    { id: 'no_inquiries', when: { signal: 'inquiryMonthCount', op: 'eq', value: 0 }, messageKey: 'portalEmptyTraderNoInquiries' },
    { id: 'stale_prices', when: { signal: 'pricingStaleDays', op: 'gt', value: 30 }, messageKey: 'portalEmptyTraderStalePrices' },
  ],
  navLinks: [
    { id: 'stock', labelKey: 'portalNavStock', href: `${P}/marketplace`, capability: 'MARKETPLACE' },
    { id: 'pricing', labelKey: 'portalNavPricing', href: `${P}/trader/pricing`, comingSoon: true },
    { id: 'inquiries', labelKey: 'portalNavInquiries', href: `${P}/trader/inquiries`, comingSoon: true },
    { id: 'customers', labelKey: 'portalCustomers', href: `${P}/trader/customers`, comingSoon: true },
  ],
};
