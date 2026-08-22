# Portal Capabilities Matrix — Personas × Capabilities × Permissions

**الإصدار:** 1.0 · **2026-08-22** · مرجع: ADR-019

## الرموز

| رمز | المعنى |
|-----|--------|
| ● | Capability افتراضية عند تفعيل Persona |
| ○ | اختيارية / تُفعَّل لاحقاً |
| — | غير مناسب لهذه Persona |

## Matrix

| Capability | Owner | Consultant | Contractor | Sub | Supplier | Trader | Individual | Company | Entity |
|------------|:-----:|:----------:|:------------:|:---:|:--------:|:------:|:----------:|:-------:|:------:|
| PROJECTS | ● | ● | ● | ● | ○ | ○ | — | ● | ○ |
| PROCUREMENT | ○ | ○ | ● | ○ | ● | ● | — | ● | — |
| TENDERING | ○ | — | ● | ● | ○ | ○ | — | ○ | — |
| MARKETPLACE | ○ | — | ● | — | ● | ● | — | ○ | — |
| WORKFORCE | — | ○ | ○ | ● | — | — | ● | ● | — |
| TRAINING | — | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ |
| SERVICES | — | ● | ○ | ● | ○ | ○ | ○ | ● | ● |
| COMPLIANCE | ○ | ● | ○ | ○ | ● | ○ | ○ | ● | ● |

## Persona templates (UI grouping)

| Template | Personas |
|----------|----------|
| `demand` | Owner, Contractor |
| `supply` | Supplier, Trader |
| `execution` | Consultant, Subcontractor |
| `people` | Individual |
| `institutional` | Company, Entity |

## Permissions (Phase 1 — coarse)

| Permission key | يتحكم في |
|----------------|----------|
| `procurement.read` | KPIs RFQ/PO + procurement nav |
| `procurement.create` | CTA «طلب شراء» / «RFQ» |
| `tendering.read` | مناقصات |
| `tendering.bid` | تقديم عرض |
| `marketplace.read` | سوق |
| `marketplace.list` | عرض منتجات (Supplier/Trader) |
| `org.verification` | CTA التحقق |
| `org.profile.edit` | CTA إكمال الملف |

**Phase 1 MVP:** مالك Org = كل permissions لـ capabilities المفعّلة. RBAC fine-grained لاحقاً.

## Supplier vs Trader (capabilities overlap)

| Capability | Supplier | Trader |
|------------|----------|--------|
| MARKETPLACE | ● catalog/stock | ● products/prices |
| PROCUREMENT | ● RFQ in (quotations) | ● RFQ + orders |
| COMPLIANCE | ● certifications | ○ |

## Multi-persona examples

| Organization | activePersonas | Nav modules |
|--------------|--------------|-------------|
| مقاول + مورد | CONTRACTOR, SUPPLIER | union of capabilities |
| شركة صيانة | COMPANY | SERVICES + PROCUREMENT |
| جهة حكومية | ENTITY | COMPLIANCE + SERVICES فقط |

Persona switcher يغيّر **Portal Home config** — لا يغيّر permissions تلقائياً.
