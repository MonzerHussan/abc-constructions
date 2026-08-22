# Portal Routes Matrix — موجود / قريباً / غير موجود

**2026-08-22** — Prefix: `/projects/ABC`

## Contractor

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| مناقصة جديدة | `/tenders/projects` | ✅ exists |
| طلب شراء | `/procurement/purchase-requests/new` | ✅ |
| قارن العروض | `/procurement/quotations` | ✅ |
| تتبع التوريد | `/procurement/purchase-orders` | ✅ |
| مشاريعي | `/projects` | ✅ |
| المشتريات | `/procurement` | ✅ |
| الموردين | `/marketplace` | ✅ (browse) |
| Portal home | `/contractor` | 🔜 OpenCode |

## Supplier

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| أكمل الكتalog | `/supplier/catalog` | 🔜 comingSoon |
| RFQ واردة | `/procurement/rfqs` | ✅ (buyer-side; supplier inbox 🔜) |
| المخزون | `/supplier/inventory` | 🔜 |
| الشهادات | `/organization/[id]/verifications` | ✅ |
| Portal home | `/supplier` | 🔜 Phase 2 |

## Trader

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| عرض مخزون | `/marketplace` | ✅ |
| حدّث الأسعار | `/trader/pricing` | 🔜 |
| الطلبات | `/trader/inquiries` | 🔜 |
| واتساب | `/integrations/whatsapp` | 🔜 |
| Portal home | `/trader` | 🔜 Phase 2 |

## Individual / Workforce

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| أكمل ملفك | `/onboarding` | ✅ |
| وظائف | `/jobs` | ✅ |
| تدريب | `/training` | ✅ |
| شهادات | `/verification` | ✅ |
| Portal home | `/workforce` | 🔜 Phase 2 |

## Owner

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| انشر مشروع | `/projects` | ✅ (partial) |
| العروض | `/offers` | 🔜 |
| التحقق | `/verification` | ✅ |
| مشتريات | `/procurement` | ✅ |
| Portal home | `/owner` | 🔜 Phase 2 |

## Consultant

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| مشاريع الإشراف | `/consultant/projects` | 🔜 |
| موافقات | `/consultant/approvals` | 🔜 |
| تقرير فحص | `/consultant/inspections/create` | 🔜 |
| NCR | `/consultant/ncr` | 🔜 |

## Subcontractor

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| مناقصات باطن | `/tenders/projects` | ✅ (shared) |
| تقديم عرض | `/tenders/projects` | ✅ |
| التخصصات | `/profile/specialties` | 🔜 |
| العقود | `/contracts` | 🔜 |

## Company

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| عقد جديد | `/contracts/create` | 🔜 |
| قطع غيار | `/spare-parts` | 🔜 |
| SLA | `/sla/report` | 🔜 |
| التحصيل | `/collections` | 🔜 |

## Entity

| CTA / Nav | Route | Status |
|-----------|-------|--------|
| تعاون | `/collaboration/request` | 🔜 |
| اعتماد | `/accreditation` | 🔜 |
| API | `/integrations` | 🔜 |
| pilots | `/pilots` | 🔜 |

## Config rule

في `PersonaPortalConfig`:

```ts
{ href: "...", comingSoon: true }  // → badge + disabled or tooltip
```

Never link to non-existent routes without `comingSoon: true`.
