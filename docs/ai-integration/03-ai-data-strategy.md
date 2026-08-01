# 03 — AI Data Strategy (استراتيجية بيانات الذكاء الاصطناعي)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31
> **يعتمد على:** ADR-004 (Event Bus), ADR-011/013/014 (الأحداث), ADR-016 (Money), ADR-018/019/020/021 (النطاقات التجارية), `events-catalog.md`

---

## 1. المبدأ

**AI يملك بياناته فقط.** نعمّل ذلك عبر ثلاثة مسارات لتغذية النماذج دون خرق ملكية البيانات:

1. **الأحداث** — مستهلك فعلي لأحداث النطاقات التجارية.
2. **واجهات القراءة العامة** — عبر `index.ts` لكل نطاق (قراءة فقط).
3. **جداول AI** — بيانات مشتقة (متجهات، ميزات، إشارات، نتائج، ملاحظات).

---

## 2. نموذج بيانات الذكاء الاصطناعي (مقترح — Prisma داخل نطاق AI)

> النماذج التالية **مقترحة** في مسودة `adr/ADR-024-proposed-ai-data-signals.md` — غير معتمدة بعد.

```prisma
model AiModel {
  id            String   @id @default(cuid())
  provider      String   // 'openai' | 'anthropic' | 'local'
  name          String
  capability    String   // TEXT | EMBEDDING | VISION | RANKING
  maxTokens     Int?
  costPer1kIn   Float?
  costPer1kOut  Float?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
}

model AiJob {
  id           String    @id @default(cuid())
  type         String    // EXTRACTION | EMBEDDING | ANALYSIS | MATCHING | RECOMMENDATION
  status       AiJobStatus @default(PENDING) // PENDING→PROCESSING→COMPLETED|FAILED
  payload      Json?
  result       Json?
  error        String?
  priority     Int       @default(0)
  orgId        String?
  createdById  String?
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())
  @@index([status])
  @@index([type, createdAt])
}

model AiEmbedding {
  id           String   @id @default(cuid())
  entityType   String   // PRODUCT | PRODUCT_OFFERING | SUPPLIER | CATEGORY | DOCUMENT
  entityId     String
  dimension    Int      @default(1536)
  vector       Unsupported("vector(1536)?")?  // pgvector — يُنفَّذ عبر تمديد extension
  model        String
  isCurrent    Boolean  @default(true)
  createdAt    DateTime @default(now())
  @@index([entityType, entityId])
  @@index([isCurrent])
}

model FeatureSignal {
  id          String   @id @default(cuid())
  signalType  String   // VIEW | SEARCH | SAVE | FAVORITE | RFQ | QUOTATION | AWARD | CLICK
  orgId       String?
  productId   String?
  supplierId  String?
  categoryId  String?
  context     Json?    // { projectId, boqItemId, searchQuery, rfqId }
  source      String   // 'marketplace' | 'ai' | 'integration'
  createdAt   DateTime @default(now())
  @@index([orgId, createdAt])
  @@index([productId])
  @@index([signalType])
  @@index([createdAt])
}

model RecommendationRecord {
  id             String   @id @default(cuid())
  orgId          String
  recType        String   // PRODUCT | SUPPLIER
  resultIds      String[]
  context        Json?
  servedAt       DateTime @default(now())
  @@index([orgId, servedAt])
}

model AiFeedback {
  id               String   @id @default(cuid())
  orgId            String
  feedbackType     String   // MATCH | RECOMMENDATION | SEARCH | ANALYSIS
  targetType       String
  targetId         String?
  rating           Int?     // 1-5
  action           String?  // ACCEPTED | DISMISSED | IGNORED | REJECTED
  comment          String?
  createdAt        DateTime @default(now())
  @@index([feedbackType, targetId])
  @@index([orgId])
}

model PriceIndex {
  id           String   @id @default(cuid())
  productId    String?
  categoryId   String?
  currency     String   @default("SAR")
  median       Float
  percentile25 Float?
  percentile75 Float?
  sampleSize   Int
  period       String   // '2026-W31' أسبوع / شهر / ربع
  computedAt   DateTime @default(now())
  @@unique([productId, currency, period])
  @@index([categoryId, period])
}
```

**ملاحظات تنفيذية مقترحة:**
- `AiInsight` حالياً مملوكة لـ Research (`schema.prisma:3336`). نقترح — **دون تنفيذ** — نقلها إلى نطاق AI عند بدء Sprint، أو إنشاء `AiInsight` جديدة لنطاق AI مع ترك نسخة Research كما هي (توافق عكسي). القرار النهائي يخص فريق العمارة.
- **pgvector**: إضافة تمديد عبر Prisma `postgresqlExtensions = [vector]` — لا يغيّر بنية DB الحالية ولا يمسّ النطاقات الأخرى.
- جميع الجداول تتبع نفس معايير الـ Indexing وSoft Delete المعتمدة في `ABC_PLATFORM_ARCHITECTURE_v1.md`.

---

## 3. تجميع أحداث البيانات (Event Data Collection)

### 3.1 الحالة الحالية
- 55+ حدثاً منشوراً، **0 مشتركين** (Architecture Review §4.2).
- أحداث Phase 2 جاهزة: `SupplierNetwork.*`, `ProductCatalog.*`, `Inventory.*`, `Marketplace.*`.

### 3.2 الاقتراح: AI أول مستهلك فعلي

| الحدث | الإجراء في AI |
|-------|---------------|
| `ProductCatalog.Product.Published` | توليد `AiEmbedding` للمنتج |
| `ProductCatalog.Offering.PriceChanged` | تحديث `PriceIndex` وإعادة ترتيب |
| `ProductCatalog.Offering.Created/Discontinued` | تحديث المتجهات والفهرسة |
| `SupplierNetwork.Profile.Completed` / `Verification.Upgraded` | إعادة تضمين المورد وتحديث مؤشر الثقة |
| `Inventory.Stock.LowStockAlert` | تحديث توفر التوصيات |
| `Marketplace.RFQ.Initiated` | تسجيل `FeatureSignal(RFQ)` |
| `Marketplace.Review.Submitted` | تسجيل إشارة جودة + إعادة تضمين |
| `Procurement.Quotation.Submitted` / `Award` | تحديث مؤشر الأسعار وإشارات الطلب |
| `Core.User.Updated` / `Core.Organization.Created` | مزامنة سياقات التوصيات |

### 3.3 أحداث AI المقترحة (مصدرها AI)

| الحدث | المعنى |
|-------|--------|
| `AI.Job.Created` / `.Completed` / `.Failed` | دورة حياة المعالجة |
| `AI.Analysis.Completed` | نتائج تحليل جاهزة |
| `AI.Match.Generated` | قائمة مطابقة موردين |
| `AI.Recommendation.Served` | توصية عُرضت |
| `AI.Feedback.Recorded` | ملاحظة مستخدم |
| `AI.Embedding.Updated` | تحديث متجه |

### 3.4 إثراء الحدث ببيانات سياق (مقترح لـ ADR-024)
نقترح إضافة حقول سياق اختيارية في `metadata` (لا كسر للتوافق — إضافات اختيارية فقط):
```typescript
metadata: {
  timestamp, correlationId, source, requestId?, userId?, orgId?,
  regionId?, sessionId?, language?   // إضافات اختيارية
}
```

---

## 4. أساس محرك التوصيات (Recommendation Engine Foundation)

### 4.1 النمط الهجين

```
                        ┌────────────────────────────┐
                        │   Candidate Generation     │
                        │  (توليد المرشحين)          │
                        ├────────────────────────────┤
                        │ 1. Content-based (متجهات)  │
                        │ 2. Collaborative (إشارات)  │
                        │ 3. Rules (قواعد أعمال)     │
                        └──────────────┬─────────────┘
                                       ▼
                        ┌────────────────────────────┐
                        │      Filter & Rank         │
                        │  (توفر، تحقق، سعر، زمن)    │
                        └──────────────┬─────────────┘
                                       ▼
                        ┌────────────────────────────┐
                        │  Explanation (لماذا؟)      │
                        └──────────────┬─────────────┘
                                       ▼
                                   النتائج
```

### 4.2 مكوّنات الحالة الباردة (Cold Start)
- قبل توفر إشارات كافية، نعتمد **Content-based + قواعد** (فئة، علامة، مستوى تحقق، توفر مخزون).
- مع نمو الإشارات، يتفعّل Collaborative تدريجياً.

### 4.3 حلقة التغذية الراجعة
- **Implicit:** بحث، مشاهدة، حفظ، مفضلة، RFQ، عرض سعر، ترسية.
- **Explicit:** تقييمات Marketplace (`ProductReview`/`SupplierReview`) + `AiFeedback`.
- يتم تحديث `FeatureSignal` و`RecommendationRecord` تلقائياً.

### 4.4 الشفافية
- كل نتيجة توصية/مطابقة تحمل `reasons[]` قابلة للعرض في الواجهة.
- سجل `RecommendationRecord` يمكن فريق المنتج من تحليل الجودة.

---

## 5. متطلبات التحليلات (Analytics Requirements)

> نطاق Analytics معروف في ADR-008/ADR-005 لكنه غير منفذ (مجلد فارغ). هذه المتطلبات تصف ما يجب أن يلتقطه AI حتى تكون لوحات التحليل ممكنة لاحقاً.

| المقياس | التعريف | المصدر المقترح |
|---------|---------|----------------|
| **Coverage** | نسبة المنتجات/الموردين ذوي المتجهات | `AiEmbedding` |
| **Latency** | زمن استدعاء النموذج (P50/P95) | سجلات `AiJob`/استدعاءات |
| **Cost per inference** | تكلفة كل عملية AI | سجل الاستخدام |
| **Precision@K** | صحة المرشحين ضمن أعلى K | `AiFeedback` + `RecommendationRecord` |
| **Match-to-Conversion** | مطابقة → RFQ → ترسية | `FeatureSignal` |
| **Recommendation CTR** | نسبة النقر/قبول التوصيات | `AiFeedback.action` |
| **Model Drift** | انحراف مخرجات النموذج مع الزمن | مراجعات دورية |
| **Provider Failure Rate** | نسبة فشل مزودي النماذج | Integration Monitoring |
| **Idle/Quota** | استهلاك حصص كل منظمة | `AiJob` + حدود |

**شرط هندسي:** كل حدث AI وكل استدعاء نموذج يُسجَّل بهيكل `{timestamp, orgId, model, tokens, latency, cost, status}` — ليكون جاهزاً لاستهلاك Analytics مستقبلاً.

---

## 6. تقييم الجاهزية (AI Readiness Assessment)

### 6.1 بطاقة التقييم (0-100)

| المحور | الوزن | الدرجة | المبرر |
|--------|-------|--------|--------|
| **بيانات Supplier Network** | 20 | 85 | ملفات غنية (capabilities, coverage, ratings, verification) — فجوة: نسب اكتمال الـ capability |
| **بيانات Product Catalog** | 20 | 70 | بنية ProductMaster/Offering ممتازة؛ فجوة: اكتمال Specifications وDataSheets والترجمة |
| **بيانات Inventory** | 15 | 55 | بنية جيدة؛ فجوة: دقة availableQty وعدم ربط الحجوزات بالطلبات (TD-INV-01) |
| **الأحداث (Events)** | 15 | 50 | كتالوج جاهز لكن 0 مشتركين وAt-Most-Once |
| **جودة البيانات العامة** | 10 | 60 | Float للأسعار (TD-08)، JSON غير موحّد، ترجمة غير مكتملة (ar/en/ur) |
| **البنية التحتية** | 10 | 40 | لا pgvector، لا Job Queue، لا Credential Vault، لا Outbox |
| **الأمان/الخصوصية** | 10 | 80 | مفاهيم جاهزة (RBAC، AuditLog) — نقص: ضوابط بيانات النماذج |

**النتيجة الإجمالية المقدرة: ≈ 63/100 (جاهزية متوسطة مع متطلبات مسبقة)**

### 6.2 المتطلبات المسبقة قبل Sprint التنفيذ

| # | المتطلب | النطاق | المرجع |
|---|---------|--------|--------|
| R1 | اعتماد ADR-022/023/024 (أو تعديلها) | Architecture | هذه الدراسة |
| R2 | إكمال Sprint 5.4 (Marketplace) | Marketplace | phase-2-architecture-plan.md |
| R3 | تفعيل مشتركين للأحداث الأساسية (PoC) | Shared/Events | ADR-004 + review §4 |
| R4 | بيانات تجريبية (Seed) بجودة عالية | Seed | `prisma/seed.ts` |
| R5 | حصر الفجوات: نسب اكتمال capability/specs | Supplier Network + Catalog | ADR-018/019 |
| R6 | إضافة تمديد pgvector (بيئة تجريبية فقط) | DB | هذه الدراسة |

### 6.3 المعيار: متى نعتبر الجاهزية "جاهزاً للبدء"؟
- R1-R3 مكتملة، و
- بيانات تجريبية تغطي ≥ 3 فئات رئيسية × ≥ 5 موردين × ≥ 50 منتجاً مع متجهات، و
- PoC لمطابقة مورد واحدة تعمل بنظام Hybrid مع أسباب.

---

## 7. خلاصة قرارات البيانات التي تتطلب اعتماداً

| القرار | مقترح | الوثيقة |
|--------|-------|---------|
| نماذج AI الجديدة (AiModel, AiJob, AiEmbedding, FeatureSignal, RecommendationRecord, AiFeedback, PriceIndex) | ✅ | ADR-024 |
| استخدام pgvector في نفس قاعدة البيانات | ✅ | ADR-024 |
| إضافة حقول سياق اختيارية في metadata | ✅ | ADR-024 |
| AI أول مستهلك للأحداث | ✅ | ADR-024 |
| إزاحة AiInsight إلى نطاق AI (قرار معماري منفصل) | مقترح للنقاش | ADR-024 |
