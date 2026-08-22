# Portal Module — OpenCode Integration Notes

**Branch:** `feature/portal-contractor-home`  
**Prepared by:** Cursor (parallel prep — no conflict with OpenCode services/UI)

## Already done (use — do not rewrite)

| Path | Content |
|------|---------|
| `types/portal-home.types.ts` | DTOs + `PersonaPortalConfig` |
| `config/capability-map.ts` | `PERSONA_DEFAULT_CAPABILITIES`, routes |
| `config/personas/*.config.ts` | **All 9 personas** including `contractor.config.ts` |
| `config/personas/index.ts` | `getPortalConfig(persona)` |
| `index.ts` | Public exports (config/types only) |
| `docs/architecture/adr/ADR-019-portal-home-architecture.md` | Architecture |
| `docs/product-experience/portal-capabilities-matrix.md` | Matrix |
| `docs/product-experience/portal-routes-matrix.md` | Routes + comingSoon |
| `src/lib/translations.ts` | `portalHome*`, `portalNba*`, `portalCta*` keys (ar/en/ur) |
| `tests/portal/portal-config.test.ts` | Config tests |

## OpenCode builds (Phase 1)

- [ ] Prisma: `OrganizationPersona`, `OrganizationCapability`
- [ ] `services/PortalHomeService.ts` — import `getPortalConfig('CONTRACTOR')`
- [ ] `services/ActivationScoreService.ts`
- [ ] `services/NextBestActionService.ts` — evaluate `contractorNbaRules`
- [ ] `GET /api/v1/portal/home`
- [ ] `src/components/portal/*` + `/projects/ABC/contractor/page.tsx`
- [ ] `ROLE_DEFAULT_ROUTE.CONTRACTOR` → `/projects/ABC/contractor`

## Import example

```ts
import {
  getPortalConfig,
  contractorPortalConfig,
  contractorNbaRules,
  type PortalHomeDto,
} from '@/modules/portal';
```

## KPI resolvers (implement in PortalHomeService)

| resolver id | Source |
|-------------|--------|
| `projects.activeCount` | Project count or null |
| `procurement.rfqs.openCount` | `/api/rfqs` pagination |
| `procurement.quotations.pendingAwardCount` | quotations API |
| `procurement.purchaseOrders.activeCount` | PO API |

**Rule:** no resolver → `{ value: null, status: 'no_data' }`.

## Merge conflict tips

- If you also created `contractor.config.ts`, **prefer this repo version** (NBA + routes reviewed).
- Do not duplicate persona configs — extend `config/personas/` only.
- Add new translation keys to all 3 languages in `translations.ts`.
