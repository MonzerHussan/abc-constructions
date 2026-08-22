import { prisma } from "@/lib/prisma";
import { PlatformAccountType, userRoleToPlatformAccountType } from "@/lib/account-types";
import type {
  PortalHomeResult,
  PortalKpi,
  PortalQuickAction,
} from "@/modules/portal/types/portal-home.types";
import { getPortalConfig } from "@/modules/portal/config/personas";
import { getDefaultCapabilitiesForPersona } from "@/modules/portal/config/capability-map";
import { activationScoreService } from "@/modules/portal/services/ActivationScoreService";
import { nextBestActionService } from "@/modules/portal/services/NextBestActionService";
import { PERSONA_DEFAULT_SOURCE } from "@/modules/portal/types/portal-home.types";

async function resolveOrganizationId(
  userId: string,
  explicitOrgId?: string
): Promise<string | null> {
  if (explicitOrgId) return explicitOrgId;
  const membership = await prisma.userOrganization.findFirst({
    where: { userId, isActive: true },
    orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
    select: { organizationId: true },
  });
  return membership?.organizationId ?? null;
}

async function fetchKpis(
  userId: string,
  organizationId: string | null,
  orgName: string | null
): Promise<PortalKpi[]> {
  if (!organizationId) {
    // No organization yet → real "no data" KPIs (never fake numbers).
    return [
      { id: "projects", value: null, status: "no_data", labelKey: "portalKpiProjects", href: "/projects/ABC/projects" },
      { id: "open_rfqs", value: null, status: "no_data", labelKey: "portalKpiOpenRfqs", href: "/projects/ABC/procurement/rfqs" },
      { id: "pending_awards", value: null, status: "no_data", labelKey: "portalKpiPendingAwards", href: "/projects/ABC/procurement/quotations" },
      { id: "active_pos", value: null, status: "no_data", labelKey: "portalKpiActivePos", href: "/projects/ABC/procurement/purchase-orders" },
    ];
  }

  const [projects, openRfqs, pendingAwards, activePos] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.rFQ.count({ where: { organizationId, status: { in: ["OPEN", "SENT"] } } }),
    prisma.quotation.count({
      where: { status: "SUBMITTED", rfq: { organizationId } },
    }),
    prisma.purchaseOrder.count({
      where: {
        organizationId,
        status: { in: ["ISSUED", "ACKNOWLEDGED", "PARTIALLY_RECEIVED"] },
      },
    }),
  ]);

  return [
    { id: "projects", value: projects, status: "real", labelKey: "portalKpiProjects", href: "/projects/ABC/projects" },
    { id: "open_rfqs", value: openRfqs, status: "real", labelKey: "portalKpiOpenRfqs", href: "/projects/ABC/procurement/rfqs" },
    { id: "pending_awards", value: pendingAwards, status: "real", labelKey: "portalKpiPendingAwards", href: "/projects/ABC/procurement/quotations" },
    { id: "active_pos", value: activePos, status: "real", labelKey: "portalKpiActivePos", href: "/projects/ABC/procurement/purchase-orders" },
  ];
}

export interface PortalHomeInput {
  persona: string;
  userId: string;
  orgId?: string;
}

export class PortalHomeService {
  async getHome(input: PortalHomeInput): Promise<PortalHomeResult> {
    const config = getPortalConfig(input.persona);
    if (!config) throw new Error(`Unsupported persona: ${input.persona}`);

    const organizationId = await resolveOrganizationId(input.userId, input.orgId);
    const org = organizationId
      ? await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { name: true, verificationLevel: true },
        })
      : null;

    // Personas & capabilities: prefer DB state, fall back to persona defaults.
    let activePersonas = config.persona ? [config.persona] : [];
    if (organizationId) {
      const rows = await prisma.organizationPersona.findMany({
        where: { organizationId, isActive: true },
        select: { persona: true },
      });
      const mapped = rows.map((r) => r.persona as PlatformAccountType);
      if (mapped.length > 0) activePersonas = mapped;
    }

    let capabilities = [...config.defaultCapabilities];
    if (organizationId) {
      const rows = await prisma.organizationCapability.findMany({
        where: { organizationId, enabled: true },
        select: { capability: true },
      });
      const mapped = rows.map((r) => r.capability);
      if (mapped.length > 0) capabilities = mapped;
    }

    const { activation, data } = await activationScoreService.compute(
      input.userId,
      organizationId,
      config.activationDimensions
    );

    const kpis = await fetchKpis(input.userId, organizationId, org?.name ?? null);

    const nextBestActions = await nextBestActionService.evaluate(
      input.userId,
      organizationId,
      config.nbaRules,
      data,
      0
    );

    const quickActions: PortalQuickAction[] = config.quickActions.map((qa) => ({
      id: qa.id,
      labelKey: qa.labelKey,
      href: qa.href,
      comingSoon: !!qa.comingSoon,
    }));

    return {
      persona: config.persona,
      organization: org ? { name: org.name, verificationLevel: org.verificationLevel ? String(org.verificationLevel) : null } : null,
      activePersonas,
      capabilities,
      activation,
      kpis,
      nextBestActions,
      quickActions,
      navLinks: config.navLinks,
      recentActivity: [],
      recommendations: [],
    };
  }

  /** Resolve org membership and bootstrap persona from the user's platform role. */
  async ensurePersonaBootstrap(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const persona = user ? userRoleToPlatformAccountType(user.role) : null;
    if (!persona) return;

    const membership = await prisma.userOrganization.findFirst({
      where: { userId, isActive: true },
      orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
      select: { organizationId: true },
    });
    if (!membership) return;
    await this.bootstrapPersona(membership.organizationId, persona);
  }

  /** Ensure org persona + default capabilities exist for the given platform account type. */
  async bootstrapPersona(
    organizationId: string,
    persona: PlatformAccountType
  ): Promise<void> {
    await prisma.organizationPersona.upsert({
      where: { organizationId_persona: { organizationId, persona } },
      create: { organizationId, persona, isPrimary: true },
      update: { isActive: true },
    });

    const defaults = getDefaultCapabilitiesForPersona(persona);
    for (const capability of defaults) {
      await prisma.organizationCapability.upsert({
        where: { organizationId_capability: { organizationId, capability } },
        create: { organizationId, capability, enabled: true, source: PERSONA_DEFAULT_SOURCE },
        update: { /* keep existing */ },
      });
    }
  }
}

export const portalHomeService = new PortalHomeService();