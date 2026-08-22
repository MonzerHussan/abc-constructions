import { describe, expect, it } from 'vitest';
import {
  capabilitiesForPersona,
  mergeCapabilities,
  PERSONA_DEFAULT_CAPABILITIES,
} from '@/modules/portal/config/capability-map';
import { getPortalConfig, PORTAL_PERSONA_CONFIGS } from '@/modules/portal/config/personas';

describe('portal capability-map', () => {
  it('defines all 9 personas', () => {
    expect(Object.keys(PERSONA_DEFAULT_CAPABILITIES)).toHaveLength(9);
  });

  it('contractor has procurement and tendering', () => {
    const caps = capabilitiesForPersona('CONTRACTOR');
    expect(caps).toContain('PROCUREMENT');
    expect(caps).toContain('TENDERING');
  });

  it('entity has no marketplace by default', () => {
    const caps = capabilitiesForPersona('ENTITY');
    expect(caps).not.toContain('MARKETPLACE');
    expect(caps).toContain('COMPLIANCE');
  });

  it('merges capabilities for multi-persona org', () => {
    const merged = mergeCapabilities(['CONTRACTOR', 'SUPPLIER']);
    expect(merged).toContain('PROCUREMENT');
    expect(merged).toContain('MARKETPLACE');
  });
});

describe('portal persona configs', () => {
  it('has 9 configs', () => {
    expect(PORTAL_PERSONA_CONFIGS).toHaveLength(9);
  });

  it('contractor config has 4 KPI slots and NBA rules', () => {
    const c = getPortalConfig('CONTRACTOR');
    expect(c).toBeDefined();
    expect(c!.kpiSlots).toHaveLength(4);
    expect(c!.nbaRules.length).toBeGreaterThanOrEqual(3);
    expect(c!.route).toBe('/projects/ABC/contractor');
  });

  it('trader has distinction banner', () => {
    expect(getPortalConfig('TRADER')!.distinctionBannerKey).toBe('portalTraderBanner');
  });

  it('entity has no procurement KPIs in slots', () => {
    const slots = getPortalConfig('ENTITY')!.kpiSlots;
    expect(slots.every((s) => s.capability !== 'PROCUREMENT' || s.resolver === null)).toBe(true);
  });

  it('marks comingSoon routes where backend missing', () => {
    const supplierCatalog = getPortalConfig('SUPPLIER')!.quickActions.find((a) => a.id === 'catalog');
    expect(supplierCatalog?.comingSoon).toBe(true);
  });
});
