# ADR-019: Portal Home Architecture (Persona × Capability)

## التاريخ
2026-08-22

## الحالة
معتمد — Phase 1: Contractor Master Template

## السياق

- المنصة تدعم **9 Platform Account Types** (Personas) للتسجيل والـ onboarding.
- المستخدم/المؤسسة قد يحمل **أكثر من Persona** (مثلاً Contractor + Supplier).
- `User.role` و `ROLE_DEFAULT_ROUTE` الحاليين يفترضان **دوراً واحداً** — غير كافٍ على المدى الطويل.
- `Profile.capabilities` في entity-registry **محجوز** لمواقع المشاريع من الاستبيان — لا يُستخدم لـ Portal Capabilities.

## القرار

### 1. Portal Home = Template واحد + Configuration

- مكوّن UI واحد: `PortalHomePage` + sections.
- اختلاف التجربة عبر `PersonaPortalConfig` (ملف لكل persona).
- **Phase 1:** تنفيذ كامل للمقاول (CONTRACTOR) فقط؛ بقية الـ configs جاهزة للنسخ.

### 2. ثلاث طبقات منفصلة

| الطبقة | السؤال | المصدر |
|--------|--------|--------|
| **Persona** | من أنت في السوق؟ | `PlatformAccountType` + `OrganizationPersona` |
| **Capability** | ماذا تستطيع المنظمة؟ | `OrganizationCapability` + `PortalCapability` enum |
| **Permission** | ماذا يسمح به هذا المستخدم؟ | RBAC (`Role` / permissions) |

**Route** (`/projects/ABC/contractor`) = **Persona context للعرض** — ليس مصدر الحقيقة الوحيد.

### 3. Portal Capabilities (MVP)

```
PROCUREMENT | TENDERING | MARKETPLACE | PROJECTS
WORKFORCE | TRAINING | SERVICES | COMPLIANCE
```

`FINANCING` و `ASSETS` — Phase 2.

### 4. Schema

```prisma
OrganizationPersona   — org + persona + isPrimary
OrganizationCapability — org + capability + enabled + source
```

Bootstrap عند onboarding: persona من `User.role` + capabilities من `PERSONA_DEFAULT_CAPABILITIES`.

### 5. API

```
GET /api/v1/portal/home?persona=CONTRACTOR&orgId=...
```

يجمع: activation, NBA, KPIs (real | no_data), quick actions, activity, recommendations.

**KPI rule:** `value: null` + `status: "no_data"` — UI يعرض `—` / «لا بيانات بعد». **ممنوع** mock كـ `"real"`.

### 6. Activation Score

محاور weighted per persona (مثلاً Contractor: profile, verification, readiness, operational).

`overall` + `nextStepKey` للشريط العلوي.

### 7. Next Best Action (NBA)

قواعد ordered by `priority` (1 = urgent). Config-driven — ليس hardcoded في UI.

### 8. Supplier vs Trader

| | Supplier | Trader |
|---|----------|--------|
| Persona | SUPPLIER | TRADER |
| Activation | catalog-heavy | products + pricing |
| NBA | incoming RFQ, catalog | pricing stale, inquiries |
| Banner | — | «تاجر = شراء وبيع بدون تصنيع» |

Entity persona: **لا** KPIs مبيعات/RFQ — `COMPLIANCE` + institutional CTAs فقط.

### 9. ترتيب التنفيذ

1. Contractor (Master) — OpenCode Phase 1
2. Supplier, Trader, Individual, Owner
3. Consultant, Subcontractor, Company, Entity
4. Persona switcher + multi-persona org

## البدائل المرفوضة

- **9 dashboards منفصلة** — تكرار كود وصيانة.
- **Route = Role only** — لا يدعم multi-persona.
- **Mock KPIs** — يفسد ثقة B2B.

## العواقب

- `ROLE_DEFAULT_ROUTE.CONTRACTOR` → `/projects/ABC/contractor` (Phase 1).
- module جديد: `src/modules/portal/` (services من OpenCode؛ config/types من Cursor prep).
- i18n: مفاتيح `portalHome*`, `portalNba*`, `portalAct*` في `translations.ts`.
- ADR-018 (Organizations multi-role) يُكمَّل بهذا ADR للـ UX layer.

## المراجع

- `docs/product-experience/01-ux-architecture.md`
- `docs/product-experience/02-screen-map.md`
- `docs/product-experience/portal-capabilities-matrix.md`
- `docs/product-experience/portal-routes-matrix.md`
- `src/modules/portal/config/`
