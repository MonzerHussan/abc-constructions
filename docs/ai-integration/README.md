# AI & Integration Layer — Architecture Proposal

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4 — دراسة وتجهيز Architecture Proposal
> **الحالة:** 📝 مقترح — قيد الدراسة (بانتظار مراجعة Programmer 1 و Programmer 3 واعتماد التصميم)
> **التاريخ:** 2026-07-31

---

## ⚠️ طبيعة هذه الوثائق

هذا المجلد يحتوي **مقترحات معمارية (Architecture Proposals)** فقط — **وليست قرارات معتمدة**.

- ❌ **لا يوجد أي تعديل على الكود** في هذا الاقتراح.
- ❌ **لا تغيير على أي ADR معتمد** أو بنية Modular Monolith الحالية.
- ✅ البناء **فوق** المصادر الأساسية: `Supplier Network` و `Product Catalog` و `Inventory`.
- ✅ كل المسودات (ADR-022/023/024) موسومة بعلامة **مقترح** وليست في `docs/architecture/adr/`.
- ✅ اعتماد هذه الوثائق لا يتم إلا بعد مراجعة المبرمجين وموافقة فريق العمارة.

---

## فهرس الوثائق

| # | الوثيقة | المحتوى | الحالة |
|---|---------|---------|--------|
| 0 | [`00-proposal-summary.md`](./00-proposal-summary.md) | الملخص التنفيذي للاقتراح | 📝 مقترح |
| 1 | [`01-ai-architecture.md`](./01-ai-architecture.md) | طبقة منصة الذكاء الاصطناعي (7 قدرات) | 📝 مقترح |
| 2 | [`02-integration-architecture.md`](./02-integration-architecture.md) | أساس التكاملات الخارجية (6 أنواع) | 📝 مقترح |
| 3 | [`03-ai-data-strategy.md`](./03-ai-data-strategy.md) | استراتيجية بيانات الذكاء الاصطناعي | 📝 مقترح |
| 4 | [`04-data-flow-diagrams.md`](./04-data-flow-diagrams.md) | مخططات تدفق البيانات (Mermaid) | 📝 مقترح |
| 5 | [`05-api-integration-strategy.md`](./05-api-integration-strategy.md) | استراتيجية تكامل الـ APIs | 📝 مقترح |
| 6 | [`06-ai-roadmap.md`](./06-ai-roadmap.md) | خارطة طريق الذكاء الاصطناعي المستقبلية | 📝 مقترح |
| 7 | [`07-ai-alignment-review.md`](./07-ai-alignment-review.md) | مراجعة التوافق (Architecture / Product / Business) قبل الاعتماد | 📝 مراجعة |
| 8 | [`08-ai-governance.md`](./08-ai-governance.md) | حوكمة الذكاء الاصطناعي (البيانات/النماذج/المخرجات/الامتثال) | ✅ معتمد |
| 9 | [`09-ai-cost-management.md`](./09-ai-cost-management.md) | استراتيجية إدارة تكاليف AI (روافع/ميزانية/تنبؤ) | ✅ معتمد |
| — | [`adr/ADR-022-proposed-ai-domain.md`](./adr/ADR-022-proposed-ai-domain.md) | مسودة ADR — نطاق الذكاء الاصطناعي | 📝 مقترح |
| — | [`adr/ADR-023-proposed-integration-gateway.md`](./adr/ADR-023-proposed-integration-gateway.md) | مسودة ADR — بوابة التكاملات الخارجية | 📝 مقترح |
| — | [`adr/ADR-024-proposed-ai-data-signals.md`](./adr/ADR-024-proposed-ai-data-signals.md) | مسودة ADR — بيانات وإشارات الذكاء الاصطناعي | 📝 مقترح |

---

## خطة Sprint AI-0 — AI Foundation

| الوثيقة | المحتوى |
|---------|---------|
| [`sprint-ai-0/README.md`](./sprint-ai-0/README.md) | خطة Sprint AI-0 (الهدف، النطاق، DoD، التسلسل) |
| [`sprint-ai-0/01-ai-gateway-architecture.md`](./sprint-ai-0/01-ai-gateway-architecture.md) | تسليم 1 — AI Gateway Architecture (G1/G3) |
| [`sprint-ai-0/02-event-consumption-pattern.md`](./sprint-ai-0/02-event-consumption-pattern.md) | تسليم 2 — Event Consumption Pattern (G2) |
| [`sprint-ai-0/03-ai-usage-tracking-model.md`](./sprint-ai-0/03-ai-usage-tracking-model.md) | تسليم 3 — AI Usage Tracking Model |
| [`sprint-ai-0/04-ai-design-components-spec.md`](./sprint-ai-0/04-ai-design-components-spec.md) | تسليم 4 — AI Design Components Specification (G4) |

## خطة Sprint AI-1 — BOQ Intelligence Foundation ✅ معتمد (8/8)

| الوثيقة | المحتوى |
|---------|---------|
| [`sprint-ai-1/README.md`](./sprint-ai-1/README.md) | خطة Sprint AI-1 (الهدف، النطاق، DoD، التسلسل) |
| [`sprint-ai-1/01-document-processing-pipeline.md`](./sprint-ai-1/01-document-processing-pipeline.md) | خط معالجة المستندات |
| [`sprint-ai-1/02-ocr-strategy.md`](./sprint-ai-1/02-ocr-strategy.md) | استراتيجية الـ OCR |
| [`sprint-ai-1/03-boq-extraction-flow.md`](./sprint-ai-1/03-boq-extraction-flow.md) | تدفق استخراج الـ BOQ |
| [`sprint-ai-1/04-material-mapping.md`](./sprint-ai-1/04-material-mapping.md) | تطبيع المواد إلى فئات/وحدات موحدة |
| [`sprint-ai-1/05-api-contracts.md`](./sprint-ai-1/05-api-contracts.md) | عقود الـ API |
| [`sprint-ai-1/06-extraction-versioning.md`](./sprint-ai-1/06-extraction-versioning.md) | إصدار عمليات الاستخراج (Prompt/Mapping/OCR/Model) |
| [`sprint-ai-1/07-evaluation-dataset.md`](./sprint-ai-1/07-evaluation-dataset.md) | Gold Dataset + مؤشرات الجودة + بوابة القبول |
| [`sprint-ai-1/08-p1-api-contract-review.md`](./sprint-ai-1/08-p1-api-contract-review.md) | مراجعة المبرمج الأول لعقود API (قيد البرمجة) |

## خطة Sprint AI-1b — BOQ Intelligence Implementation (معلَّقة)

| الوثيقة | المحتوى |
|---------|---------|
| [`sprint-ai-1b/README.md`](./sprint-ai-1b/README.md) | خطة التنفيذ (مهام، DoD، بوابات) — تبدأ بعد موافقة المبرمج الأول |

## خطة Sprint AI-2 — ABC Agent Operating System (تصميم فقط)

| الوثيقة | المحتوى |
|---------|---------|
| [`sprint-ai-2/README.md`](./sprint-ai-2/README.md) | خطة Sprint AI-2 (الهدف، النطاق، DoD، التسلسل) |
| [`sprint-ai-2/01-agent-taxonomy.md`](./sprint-ai-2/01-agent-taxonomy.md) | تصنيف الـ 17 وكيلاً عبر 4 منظومات |
| [`sprint-ai-2/02-orchestrator-architecture.md`](./sprint-ai-2/02-orchestrator-architecture.md) | نواة التنسيق (التخطيط/التوجيه/التفويض) |
| [`sprint-ai-2/03-shared-ai-services.md`](./sprint-ai-2/03-shared-ai-services.md) | خدمات AI المشتركة (S1–S12) |
| [`sprint-ai-2/04-memory-model.md`](./sprint-ai-2/04-memory-model.md) | نموذج الذاكرة (أنواع/نطاقات/احتفاظ) |
| [`sprint-ai-2/05-tool-permission-model.md`](./sprint-ai-2/05-tool-permission-model.md) | أذونات الأدوات + RBAC + Human-in-the-Loop |
| [`sprint-ai-2/06-rag-integration.md`](./sprint-ai-2/06-rag-integration.md) | تكامل RAG (فهارس/استرجاع/اقتباس) |
| [`sprint-ai-2/07-governance-rules.md`](./sprint-ai-2/07-governance-rules.md) | قواعد الحوكمة متعددة الوكلاء (توسعة 08) |
| [`sprint-ai-2/08-business-pricing-model.md`](./sprint-ai-2/08-business-pricing-model.md) | نموذج الأعمال والأسعار (إطار) |

---

## المصادر الأساسية (Primary Data Sources)

استناداً إلى المعمارية المعتمدة، تعتمد قدرات الذكاء الاصطناعي على:

| المصدر | الوحدة | الوثيقة المعتمدة |
|--------|--------|------------------|
| Supplier Network | `modules/supplier-network/` | ADR-018 |
| Product Catalog | `modules/product-catalog/` | ADR-019 |
| Inventory | `modules/inventory/` | ADR-020 |
| Marketplace | `modules/marketplace/` | ADR-021 (قيد التنفيذ) |
| Procurement Core | `modules/procurement/` | ADR-001 → ADR-017 |

---

## المراجع المعمارية

- `ABC_PLATFORM_ARCHITECTURE_v1.md` — العمارة المرجعية
- `docs/architecture/adr/` — جميع القرارات المعتمدة
- `docs/architecture/events-catalog.md` — سجل الأحداث
- `docs/architecture/capability-map.md` — خريطة القدرات
- `docs/architecture/phase-2-architecture-plan.md` — خطة المرحلة الثانية
- `docs/architecture/architecture-review-report.md` — مراجعة العمارة

---

## خلاصة الاقتراح بجملة واحدة

> بناء **نطاق AI معزول** يقرأ من نطاقات التجارة الأربعة عبر **الأحداث + واجهات قراءة عامة**، مع **بوابة تكاملات خارجية** تخدم الموردين والدفع والشحن والجهات الحكومية، وخط بيانات AI يجمع الإشارات ويخزّن المتجهات في **PostgreSQL + pgvector** — كل ذلك دون خرق أي ADR معتمد.

---

*إعداد: Programmer 4 — AI & Integration Layer Proposal. بانتظار المراجعة والاعتماد.*
