# 00 — الملخص التنفيذي للاقتراح (Executive Proposal Summary)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31

---

## 1. الهدف

إعداد تصوّر معماري متكامل لطبقة **الذكاء الاصطناعي** و**التكاملات الخارجية** فوق المنصة الحالية (Modular Monolith)، تعتمد على **Supplier Network** و **Product Catalog** و **Inventory** كمصادر بيانات أساسية، دون تعديل أي كود قائم ودون تغيير المعمارية المعتمدة.

---

## 2. المبادئ الحاكمة (Governing Principles)

| # | المبدأ | المبرر |
|---|--------|--------|
| P1 | **AI نطاق معزول (Bounded Context) وليس طبقة مخترقة** | يتوافق مع ADR-002 (16 Domain) وADR-005 (`modules/ai/`) وADR-011 (أحداث AI) |
| P2 | **القراءة عبر الأحداث + واجهات عامة فقط** — لا قراءة مباشرة لجداول النطاقات الأخرى | يحترم ADR-004 وADR-007 وقاعدة ملكية البيانات |
| P3 | **AI يوصي ولا يقرر** — Human-in-the-Loop دائماً | ترسية المناقصات والموافقات تبقى قراراً بشرياً |
| P4 | **تجريد مزودي النماذج (AiProvider Adapter)** — لا ربط بمزود واحد | تجنّب Lock-in وتكاليف غير متوقعة |
| P5 | **العمليات الثقيلة غير متزامنة (Async Jobs)** | استخراج المستندات والتضمين (Embeddings) لا يحدث داخل Request |
| P6 | **Fallback حتمي (Rule-based)** عند فشل النموذج | استمرارية الخدمة الأساسية (بحث/مطابقة) |
| P7 | **التكاملات عبر Gateway موحّد** | أمان، Retry، Idempotency، وMonitoring مركزي |
| P8 | **Feature Flags للتشغيل التدريجي** | يُستفاد من `feature-flags.ts` الموجود (`FF_AI_SUGGESTIONS`) |
| P9 | **المتجهات تُخزَّن في PostgreSQL + pgvector** | يتماشى مع استراتيجية "قاعدة بيانات واحدة" المعتمدة |
| P10 | **الإضافات Additive فقط** — لا Breaking Changes على المرحلة الأولى أو الثانية | شرط إلزامي معتمد من Sprint Closure Reports |

---

## 3. مكونات الاقتراح

### 3.1 طبقة منصة الذكاء الاصطناعي (7 قدرات)

| # | القدرة | الوحدة المقترحة | النطاق المصدر |
|---|--------|-----------------|---------------|
| 1 | **AI Supplier Matching** | `SupplierMatchingService` | Supplier Network |
| 2 | **AI Product Recommendations** | `RecommendationService` | Product Catalog + Marketplace |
| 3 | **AI Tender Analysis** | `TenderAnalysisService` | Procurement + Tenders |
| 4 | **BOQ Intelligence** | `BoqIntelligenceService` | Product Catalog + Procurement |
| 5 | **Material Extraction (PDF/Excel/Images)** | `DocumentExtractionService` | Storage + Product Catalog |
| 6 | **AI Search Assistant (RAG)** | `SearchAssistantService` | Marketplace + Search |
| 7 | **AI Pricing Intelligence** | `PricingIntelligenceService` | Product Catalog + Procurement |

### 3.2 أساس التكاملات الخارجية (6 أنواع)

| # | التكامل | البوابة المقترحة |
|---|---------|------------------|
| 1 | ERP Systems للموردين (SAP, Odoo, ERPNext, Oracle, Dynamics) | `ErpConnector` |
| 2 | Inventory Synchronization APIs (Webhook + Polling) | `InventorySyncConnector` |
| 3 | Payment Gateways (Stripe, PayTabs, HyperPay, Urway, Tabby/Tamara) | `PaymentConnector` |
| 4 | Shipping & Logistics APIs | `LogisticsConnector` |
| 5 | Government Verification APIs (السجل التجاري، VAT/ZATCA، الغرف) | `GovernmentVerificationConnector` |
| 6 | Manufacturer Data Sources (GS1/GDSN, EDI) | `ManufacturerDataConnector` |

### 3.3 استراتيجية بيانات الذكاء الاصطناعي

- نموذج بيانات AI جديد (مملوك لنطاق AI).
- تجميع إشارات المستخدمين (Events) لتغذية محرك التوصيات.
- أساس محرك توصيات هجين (Collaborative + Content-based + Rules).
- متطلبات تحليلات لأداء النماذج.
- **تقييم جاهزية الذكاء الاصطناعي (AI Readiness Assessment)** — تفصيل في القسم 5.

---

## 4. الملخص التنفيذي للنمذجة

```
┌────────────────────────────────────────────────────────────┐
│                    UI / App Router (مخطط)                    │
├────────────────────────────────────────────────────────────┤
│              AI APIs  (/api/v1/ai/*)                        │
├──────────────┬───────────────────────────────┬─────────────┤
│   AI Domain  │  Integration Gateway          │  Analytics  │
│  (نطاق جديد) │  (connectors, webhooks)       │  (مخطط)     │
├──────────────┴───────────────────────────────┴─────────────┤
│  Events (eventBus) ← SupplierNetwork · ProductCatalog ·     │
│                       Inventory · Marketplace · Procurement │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector  |  Storage (files)  |  Redis (مخطط) │
└─────────────────────────────────────────────────────────────┘
```

> الانتباه: مخطط أعلاه هو **مقترح** — التنفيذ الفعلي لا يبدأ إلا بعد اعتماد ADR المقترحة.

---

## 5. خلاصة تقييم الجاهزية (AI Readiness Summary)

| المحور | الجاهزية الحالية | أبرز الفجوة قبل Sprint التنفيذ |
|--------|------------------|--------------------------------|
| بيانات الموردين | 🟢 قوية | اكتمال نسب الـ Capabilities والـ Coverage |
| كتالوج المنتجات | 🟢 جيدة | اكتمال الـ Specifications المهيكلة ونسب الترجمة |
| المخزون | 🟡 متوسطة | دقة `availableQty` وربط الحجوزات بالطلبات (TD-INV-01) |
| الأحداث | 🟡 متوسطة | حالياً 0 مشتركين — AI سيكون أول مستهلك للأحداث |
| جودة البيانات | 🟡 متوسطة | فجوات في الترجمة (ar/en/ur) وقيم JSON غير موحدة |
| البنية التحتية | 🟡 متوسطة | لا يوجد pgvector ولا Job Queue ولا Credential Vault بعد |
| التكلفة/الخصوصية | 🟢 جاهز | القرار P4/P8 يقلّل المخاطر |

**الخلاصة:** المنصة **جاهزة بنسبة ≈65%** لبدء Sprint AI & Integration بشرط تنفيذ 3 متطلبات مسبقة (انظر 03-ai-data-strategy.md §8).

---

## 6. متطلبات مسبقة مقترحة قبل Sprint التنفيذ

1. **اعتماد مسودات ADR-022/023/024** (أو تعديلها) — هذا الاقتراح لا يُنفَّذ قبلها.
2. **اكتمال Sprint 5.4 (Marketplace)** — لأن قدرات التوصيات والبحث تعتمد عليه.
3. **سداد ديون فنية حرجة مرتبطة** — مراجعة `technical-debt-register.md` (TD-01/02/03/04 وTD-INV-01/02).

---

## 7. التسليمات المطلوبة من هذه الدراسة

| الوثيقة | الحالة |
|---------|--------|
| AI Architecture Document | ✅ في هذا الاقتراح (`01-ai-architecture.md`) |
| Integration Architecture Document | ✅ (`02-integration-architecture.md`) |
| Data Flow Diagrams | ✅ (`04-data-flow-diagrams.md`) |
| API Integration Strategy | ✅ (`05-api-integration-strategy.md`) |
| Future AI Roadmap | ✅ (`06-ai-roadmap.md`) |
| AI Data Strategy + Readiness | ✅ (`03-ai-data-strategy.md`) |

---

## 8. الخطوة التالية

1. مراجعة Programmer 1 و Programmer 3 لهذه الوثائق مع دراستهما.
2. اجتماع اعتماد التصميم (Architecture Review Board).
3. عند الاعتماد: تحديد **Sprint AI & Integration** وفق `06-ai-roadmap.md`.
