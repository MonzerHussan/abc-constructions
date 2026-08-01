# 01 — AI Architecture Document (طبقة منصة الذكاء الاصطناعي)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31
> **يعتمد على:** ADR-001 (Modular Monolith), ADR-002 (Domain Boundaries), ADR-004 (Event Bus), ADR-005 (Module Structure), ADR-007 (Dependency Rules), ADR-008 (Cross-Cutting Modules), ADR-018 (Supplier Network), ADR-019 (Product Catalog), ADR-020 (Inventory), ADR-021 (Marketplace)

---

## 1. الموقع داخل العمارة

نقترح إنشاء **نطاق AI** كـ Bounded Context مستقل (كما هو محجوز أصلاً في ADR-002 رقم 13 و`modules/ai/` في ADR-005)، **بجانب** النطاقات التجارية وليس فوقها:

```
supplier-network ← product-catalog ← inventory ← marketplace
     ↓                  ↓               ↓          ↓
                 AI DOMAIN (مقترح)
     (يقرأ عبر الأحداث + واجهات القراءة العامة فقط)
     ↓
   ai/* (نطاق AI يملك بياناته فقط)
```

### قواعد صارمة مقترحة

| القاعدة | الوصف |
|---------|-------|
| AI لا يملك بيانات النطاقات الأخرى | لا يكتب في `SupplierProfile`/`ProductMaster`/`StockItem` إطلاقاً |
| AI لا يستورد خدمات النطاقات | عبر `index.ts` لكل نطاق — واجهات قراءة فقط |
| AI لا يستورد من `src/app/` | يتبع ADR-007 مثل بقية النطاقات |
| AI لا يقرأ Prisma Models من نطاق آخر | عبر الأحداث والـ Views العامة فقط |
| AI يستقبل الأحداث ولا ينشر أحداثاً تجارية | يضيف فقط أحداثاً بصيغة `AI.*` |

> **مقترح ADR:** كل ما سبق سيتجسد في مسودة `adr/ADR-022-proposed-ai-domain.md`.

---

## 2. البنية المنطقية لنطاق AI

```
modules/ai/
├── index.ts                     # Public API — Singleton services
├── events.ts                    # AI events + AI event handlers
├── services/
│   ├── AiProviderAdapter.ts     # تجريد مزودي النماذج
│   ├── SupplierMatchingService.ts
│   ├── RecommendationService.ts
│   ├── TenderAnalysisService.ts
│   ├── BoqIntelligenceService.ts
│   ├── DocumentExtractionService.ts
│   ├── SearchAssistantService.ts
│   ├── PricingIntelligenceService.ts
│   └── AiJobService.ts          # قائمة انتظار المعالجة غير المتزامنة
├── pipeline/                    # خط تجهيز البيانات للتضمين/الخصائص
│   ├── embedder.ts
│   ├── featurizer.ts
│   └── indexer.ts
├── providers/                   # مزودو النماذج (Adapters)
│   ├── types.ts
│   ├── openai.ts (مثال)
│   ├── anthropic.ts (مثال)
│   └── local.ts  (مثال — نموذج محلي/مفتوح)
├── validators/
├── types/
└── __tests__/
```

### واجهة مزود النماذج المقترحة

```typescript
interface IAiProvider {
  complete(p: CompletionParams): Promise<CompletionResult>;
  embed(p: EmbeddingParams): Promise<EmbeddingResult>;
  extract(p: ExtractionParams): Promise<ExtractionResult>; // OCR / doc
  rank(p: RankingParams): Promise<RankingResult>;          // re-ranking
  readonly id: string;             // 'openai' | 'anthropic' | 'local'
  readonly capabilities: AiCapability[]; // ['text','embedding','vision',...]
  readonly costModel: CostModel;
}

type CompletionParams = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
};
```

**اختيارات مزود:**
- **مرحلة 1 (تجربة):** مزود سحابي واحد مع `AiProviderAdapter` + ميزة Feature Flag.
- **مرحلة 2:** إضافة نموذج محلي للاستخراج (OCR) لتقليل التكلفة وتحقيق متطلبات الخصوصية الإقليمية.
- **مبدأ:** كل استدعاء للنموذج يُسجَّل (model, tokens, latency, cost, orgId) لأغراض التحليلات.

---

## 3. القدرات السبع — تفصيل

### 3.1 AI Supplier Matching (مطابقة الموردين الذكية)

**المصدر:** Supplier Network (`SupplierProfile`, `SupplierCapability`, `SupplierCapabilityCoverage`, `SupplierProjectReference`, `SupplierRelationship`, ratings, verification levels).

**الهدف:** عند RFQ أو طلب شراء أو مناقصة مواد، يقترح النظام أفضل الموردين مرتبين مع **سبب لكل ترشيح**.

**المنهجية (Hybrid):**

| المكوّن | النوع | الوصف |
|---------|-------|-------|
| **Semantic Matching** | Embeddings | تضمين `capability.category` + `product.name` + وصف المناقصة ومقارنة جيب التمام |
| **Rule Filtering** | قواعد حتمية | مستوى التحقق ≥ BASIC، تغطية جغرافية للموقع، توفر المخزون، `relationshipType` ≠ BLACKLISTED |
| **Scoring** | مرجّح | السعر، زمن التسليم، التقييمات، معدل الفوز، عدد الطلبات المكتملة |
| **Re-ranking** | Ranker | نموذج ترتيب نهائي للمرشّحين الأوائل |

**المخرجات:** `MatchResult { supplierId, score, reasons[], breakdown: {semantic, rules, price, delivery, rating} }` — **الشفافية إلزامية**.

**الواجهة المقترحة:** `POST /api/v1/ai/supplier-matching/match { rfqId | boqItems[] }` → قائمة مرتّبة مع الأسباب.

---

### 3.2 AI Product Recommendations (توصيات المنتجات)

**المصدر:** Product Catalog (`ProductMaster`, `SupplierProductOffering`), Marketplace (reviews, favorites), أحداث التصفح.

**الأهداف:**
- للمشترين: اقتراح منتجات مكمّلة أو بديلة حسب المشروع/الفئة.
- للموردين: اقتراح منتجات يضيفونها (بناءً على فجوات السوق).

**الأنماط (Patterns):**

| النمط | الوصف |
|-------|--------|
| Content-Based | تشابه الفئة/المواصفات/العلامة بين المنتجات |
| Collaborative | "المنظمات المشابهة اشترت أيضاً..." من إشارات RFQ/سلة/مفضلة |
| Contextual | ربط بسياق المشروع (BOQ) والموسم والموقع |
| Rules | مرشّحات أعمال: توفر، مستوى تحقق المورد، سعر ضمن الميزانية |

**منطقة التخزين:** جداول AI (مقترحة في ADR-024): `AiEmbedding`, `RecommendationRecord`, `FeatureSignal`.

**الواجهة:** `GET /api/v1/ai/recommendations/products?for={orgId}&context={projectId|boqId}`

---

### 3.3 AI Tender Analysis (تحليل المناقصات)

**المصدر:** Procurement (RFQ, Quotation, Evaluation, Award), Tenders (ProjectTender, MaterialTender), والمرفقات.

**الوظائف المقترحة:**
1. **تلخيص المناقصة** — استخراج الشروط، الجدول الزمني، الميزانية، متطلبات المستندات.
2. **تقييم مخاطر المناقصة** — مدى غموض الشروط، عدد المتطلبات، تضارب شروط.
3. **مراجعة العروض التمهيدية** — كشف العروض المكتملة الناقصة / المنخفضة شذوذاً.
4. **إعداد نصوص تقديم** — مساعدة المورد على إعداد عرض أولي (Human-in-the-Loop).

**المنهجية:** RAG (استرجاع + توليد) فوق مستندات المناقصات (المخزنة عبر Storage module).

**ملاحظة حدودية:** لأن Procurement مملوك للمرحلة الأولى ولا يُسمح باستيراد خدماته، سيقرأ AI أحداث `Procurement.*` وأكواد الخطأ/الأحداث المسجلة في `events-catalog.md` — مع واجهة قراءة عامة `GET /api/v1/ai/tenders/*` تتلقى نسخاً مجهولة الهوية من البيانات فقط حسب الحاجة.

---

### 3.4 BOQ Intelligence (ذكاء جداول الكميات)

**المصدر:** Product Catalog (فئات/وحدات/مواصفات) + وثائق المشاريع المرفوعة.

**الوظائف المقترحة:**
1. استخراج بنود BOQ من PDF/Excel (بالتكامل مع 3.5).
2. **تطبيع بنود BOQ** إلى فئات `MaterialCategory`/`UnitOfMeasure` الموحدة.
3. **تقدير تكلفة تقديرية** لكل بند (بناءً على أسعار العروض التاريخية — يغذي 3.7).
4. **اقتراح منتجات مطابقة** لكل بند BOQ مع بدائل.

**المخرجات:** `BoqItem { rawText, normalizedCategoryId, unitId, qty, estimatedCost, suggestedProducts[] }`

**قيمة العمل:** هذا هو الجسر الذي يربط "المشروع" بـ"السوق" — وهو ما تتوافق معه `SupplierCapability.category` (ADR-018).

---

### 3.5 Material Extraction (استخراج المواد من PDF/Excel/Images)

**المصدر:** Storage module (ملفات مرفوعة) + Product DataSheets + SafetySheets.

**الوظائف:**
- **OCR للصور** (فواتير، لوحات مواصفات، رسومات مبسطة).
- **استخراج جدولي من Excel/CSV** (بنود، كميات، وحدات، أسعار).
- **استخراج نصي من PDF** (فقرات، جداول، رؤوس).
- **تطبيع النتيجة** إلى هيكل `MaterialExtraction { lineItems[], confidence, warnings[] }`.

**النمط:** **معالجة غير متزامنة** عبر `AiJobService` — حالة مشابهة لـ `InventoryImport` (PENDING → PROCESSING → COMPLETED → FAILED) لتقديم تجربة موحدة:

```
POST /api/v1/ai/extraction  (fileId, type)  →  { jobId }
GET  /api/v1/ai/jobs/:jobId                 →  { status, result? }
```

---

### 3.6 AI Search Assistant (مساعد البحث الذكي — RAG)

**المصدر:** Marketplace search + Product Catalog + Supplier Network.

**الوظائف:**
- فهم الأسئلة الطبيعية متعددة اللغات (ar/en/ur): *"اعرض لي مورد حديد تيوتو معتمد بجدة يسلّم خلال أسبوع"*.
- تحويلها إلى استعلامات منظمة (فئة، مدينة، مستوى تحقق، زمن تسليم).
- ردود مبنية على السياق مع مصادر (Search Grounded).
- **Fallback:** إن لم يتوفر النموذج، يرجع إلى Search الكلاسيكي الحالي فوراً (مبدأ P6).

**البنية:** RAG pipeline:

```
Query → Embedding → Vector Search (pgvector) → Filter (rules) → LLM Rerank → Grounded Answer
```

---

### 3.7 AI Pricing Intelligence (ذكاء الأسعار)

**المصدر:** Product Catalog (`SupplierProductOffering.price`, `tierPricing`, `contractPrice`), Procurement (quotations, awards, POs), الأحداث (`ProductCatalog.Offering.PriceChanged`).

**الوظائف المقترحة:**
1. **مؤشر سعر السوق** لكل منتج/فئة (سعر وسيط، ربعي، تباعد).
2. **تنبيهات انحراف السعر** — تذبذب عن المتوسط بنسبة X.
3. **تقدير السعر العادل** للمورد عند تقديم عرض (Range).
4. **توصية تسعير** للموردين (اختيارية، بشرط تفعيلها).

**القيود الأخلاقية/التشغيلية:**
- لا يتم مشاركة أسعار مورد معين مع مورد آخر.
- مؤشرات الأسعار مجمّعة (aggregate) ومجهّلة الهوية فقط.
- أي ناتج تسعير هو **اقتراح غير ملزم**.

---

## 4. المعالجة غير المتزامنة (Async Processing)

| البند | الاقتراح |
|-------|----------|
| قائمة انتظار | جدول `AiJob` (Polling داخلي) في المرحلة 1، وRedis Queue/BullMQ في المرحلة 2 |
| مبرر | لا تتوفر بنية رسائل خارجية بعد؛ EventEmitter داخلي (ADR-004) لا يصلح لمهام ثقيلة |
| التنفيذ | `AiJobService` — إنشاء، تشغيل، تحديث حالة، تسجيل أخطاء |
| Idempotency | مفاتيح فريدة لمنع تكرار معالجة نفس الملف/المناقصة |
| المهلة | مهلات وRetry مع Backoff لكل استدعاء نموذج |

---

## 5. الأحداث المقترحة (نطاق AI)

| الحدث | المحفز |
|-------|--------|
| `AI.Job.Created` / `AI.Job.Completed` / `AI.Job.Failed` | دورة حياة مهام المعالجة |
| `AI.Analysis.Completed` | اكتمال تحليل (مناقصة، BOQ، سعر) |
| `AI.Embedding.Updated` | تحديث متجهات منتج/مورد |
| `AI.Match.Generated` | نتيجة مطابقة موردين |
| `AI.Recommendation.Served` | توصية قُدّمت لمستخدم |
| `AI.Feedback.Recorded` | تقييم المستخدم لنتيجة AI |

**مستهلكو أحداث النطاقات الموجودة (مقترح — سيكونون أول مشتركين فعليين):**

| الحدث الحالي | رد فعل AI المقترح |
|--------------|-------------------|
| `SupplierNetwork.Profile.Completed` / `.Verification.Upgraded` | تحديث تضمين المورد وإعادة فهرسته |
| `ProductCatalog.Offering.PriceChanged` | تحديث مؤشر الأسعار |
| `ProductCatalog.Product.Published` | توليد تضمين المنتج |
| `Inventory.Stock.LowStockAlert` | تحديث توفر التوصيات/البحث |
| `Marketplace.RFQ.Initiated` | توليد إشارة توصية (مصدر Collaborative) |

> هذه ستكون **أول حالة استخدام فعلية لـ Event Bus** — وهي تعالج فجوة "0 مشتركين" الموثقة في Architecture Review (§4.2).

---

## 6. الأمان والخصوصية

| المحور | الاقتراح |
|--------|----------|
| بيانات المستخدمين | لا تُرسل بيانات شخصية (PII) إلى مزود النماذج؛ يُمرَّر الحد الأدنى الضروري فقط |
| مفاتيح المزودين | في `env` / Vault — لا تُسجَّل في الكود |
| السجلات | السجلات لا تتضمن محتوى المطالبات (prompts) الحساس |
| الضبط الإداري | مسؤول المنصة يتحكم بحدود الإنفاق/الكميات لكل منظمة |
| الاحتفاظ | سجل استخدام النماذج يُحتفظ به وفق سياسة الاحتفاظ المتفق عليها |
| الامتثال الإقليمي | خيار تشغيل نموذج محلي/إقليمي للمستندات الحساسة (مقترح في Roadmap) |

---

## 7. الملخص: قرارات تتطلب اعتماداً

| القرار | نعم/لا | الوثيقة |
|--------|--------|---------|
| إنشاء نطاق `modules/ai/` | مقترح | ADR-022 |
| AI يقرأ من نطاقات التجارة عبر واجهات قراءة عامة | مقترح | ADR-022 |
| AI أول مستهلك فعلي للأحداث | مقترح | ADR-024 |
| pgvector داخل نفس قاعدة PostgreSQL | مقترح | ADR-024 |
| AiProviderAdapter تجريدي | مقترح | ADR-022 |
| نماذج Prisma جديدة لنطاق AI | مقترح | ADR-024 |

> جميع هذه **مقترحات قابلة للنقاش** — ولا تُنفَّذ قبل اعتمادها من فريق العمارة.
