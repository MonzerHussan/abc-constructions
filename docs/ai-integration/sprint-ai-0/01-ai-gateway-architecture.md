# Sprint AI-0 · Deliverable 1 — AI Gateway Architecture

> **المسار:** AI & Integration Layer — Sprint AI-0
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **يخدم القرارات:** G1 (قراءة عبر Public Interfaces) · G3 (AI ≠ Search/Analytics) · P4/P6 (الاقتراح)

---

## 1. الغرض

بوابة موحّدة داخل نطاق `modules/ai/` تكون **نقطة الدخول الوحيدة** لأي استدعاء نموذج (LLM/Embedding/OCR/Ranking). تفصل خدمات AI عن مزوّدي النماذج، وتفرض: الحصص، التخزين المؤقت، إعادة المحاولة، الـ Fallback، وتتبّع الاستخدام — بشكل مركزي.

```
┌────────────────────────────────────────────────────────────┐
│                     App / UI Layer                         │
│  /api/v1/ai/*  (route handlers رقيقة فقط)                  │
├────────────────────────────────────────────────────────────┤
│                 AI Services (مخططات)                        │
│  SupplierMatching · Recommendations · TenderAnalysis ·      │
│  BoqIntelligence · DocumentExtraction · Search · Pricing    │
├────────────────────────────────────────────────────────────┤
│                  ★ AI GATEWAY (تسليم هذا السبرينت)          │
│  ┌──────────────────────────────────────────────┐          │
│  │ IAiGateway (facade)                         │          │
│  │  ├─ Provider Registry & Capability Routing   │          │
│  │  ├─ Quota & Rate Control                     │          │
│  │  ├─ Cache Layer                              │          │
│  │  ├─ Retry / Timeout / Circuit Breaker        │          │
│  │  ├─ Deterministic Fallback                   │          │
│  │  └─ Usage Recorder → AiUsage                 │          │
│  └──────────────────────────────────────────────┘          │
│                      │                                      │
│              IAiProvider (adapter)                          │
│          openai.ts · anthropic.ts · local.ts (مستقبلاً)     │
└────────────────────────────────────────────────────────────┘
```

**قاعدة:** لا يوجد أي Service يستدعي مزوّد نماذج مباشرة — الكل عبر `AiGateway`.

---

## 2. عقد مزوّد النماذج (IAiProvider)

```typescript
// modules/ai/gateway/types.ts (مواصفة)
type AiCapability = 'text' | 'embedding' | 'vision' | 'ranking';

interface AiProviderConfig {
  id: string;                 // 'openai' | 'anthropic' | 'local'
  model: string;              // معرف النموذج
  capability: AiCapability;
  enabled: boolean;
  costPer1kInput?: number;    // لكل 1k tokens — للحساب
  costPer1kOutput?: number;
  maxTokens?: number;
}

interface IAiProvider {
  readonly id: string;
  readonly capabilities: AiCapability[];
  complete(params: CompletionParams): Promise<CompletionResult>;
  embed(params: EmbeddingParams): Promise<EmbeddingResult>;
  extract(params: ExtractionParams): Promise<ExtractionResult>;
  rank(params: RankingParams): Promise<RankingResult>;
}

interface CompletionParams {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}
```

**قرارات:**
- **P4:** استدعاء النماذج فقط عبر `IAiProvider` — لا ربط بمزود.
- Sprint AI-0 يفعّل **مزوداً تجريبياً واحداً** (Feature Flag `FF_AI_PROVIDER_*`) لإثبات البنية؛ مزود ثانٍ ونموذج محلي يُضافان لاحقاً بلا تغيير كود.

---

## 3. عقد البوابة (IAiGateway)

```typescript
interface AiGatewayRequest<T> {
  capability: AiCapability;
  feature: AiFeatureKey;      // 'supplier-matching' | 'search-assistant' | 'boq' | ...
  payload: T;
  orgId?: string;
  userId?: string;
  model?: string;              // تجاوز اختياري
  cacheTtlSeconds?: number;    // 0 = بدون كاش
  requestId: string;
}

interface AiGatewayResult<T> {
  data: T;
  provider: string;
  model: string;
  cached: boolean;
  fallbackUsed: boolean;
  usage: { inputTokens: number; outputTokens: number; cost: number; latencyMs: number };
}

interface IAiGateway {
  complete(req: AiGatewayRequest<CompletionPayload>): Promise<AiGatewayResult<CompletionResult>>;
  embed(req: AiGatewayRequest<EmbedPayload>): Promise<AiGatewayResult<EmbeddingResult>>;
  extract(req: AiGatewayRequest<ExtractionPayload>): Promise<AiGatewayResult<ExtractionResult>>;
  rank(req: AiGatewayRequest<RankPayload>): Promise<AiGatewayResult<RankResult>>;
}
```

### مسؤوليات البوابة (تسليم هذا السبرينت)

| المسؤولية | الوصف | السلوك عند التجاوز |
|-----------|-------|--------------------|
| **Provider Routing** | اختيار المزوّد/النموذج حسب `capability` + `feature` + Feature Flag | خطأ تكوين مسجّل |
| **Quota Control** | فحص حصة المنظمة (AiQuota) قبل التنفيذ | `AI_QUOTA_EXCEEDED` (موجود في `ai.errors.ts`) |
| **Rate Control** | حد معدل لكل منظمة (ثانوي) | `429` مع Retry-After |
| **Cache** | كاش للمتجهات والاستدعاءات الحتمية (TTL) | يعيد `cached: true` |
| **Retry/Timeout** | إعادة محاولة مع Backoff (مهلة محددة) | بعد N محاولات → Fallback |
| **Circuit Breaker** | إيقاف مزوّد متعثر مؤقتاً | توجيه لمزوّد بديل أو Fallback |
| **Deterministic Fallback (P6)** | قواعد حتمية عند فشل النموذج (بحث/مطابقة كلاسيكية) | `fallbackUsed: true` |
| **Usage Recorder** | كتابة `AiUsage` لكل استدعاء (تسليم 3) | التسجيل لا يُسقط الطلب |
| **PII Scrub** | إزالة الحد الأدنى من البيانات الشخصية قبل الإرسال | — |

### أوضاع التشغيل

| الوضع | الاستخدام | مثال |
|-------|-----------|------|
| **Sync** | استدعاءات خفيفة < 3s | بحث، توصية فورية |
| **Async (AiJob)** | عمليات ثقيلة | استخراج مستندات، توليد تضمين جماعي، تحليل مناقصة |

---

## 4. أخطاء موحّدة (يراجع `ai.errors.ts`)

| الرمز | المعنى |
|-------|--------|
| `AI_ANALYSIS_FAILED` | فشل تحليل |
| `AI_OCR_FAILED` | فشل استخراج |
| `AI_QUOTA_EXCEEDED` | تجاوز حصة المنظمة |
| `AI_PROVIDER_UNAVAILABLE` | **مقترح إضافة** — مزوّد غير متاح بعد Retry |
| `AI_MODEL_NOT_FOUND` | **مقترح إضافة** — نموذج غير معرّف |
| `AI_INVALID_RESPONSE` | **مقترح إضافة** — استجابة لا تطابق العقد (JSON فاسد) |

> ⚠️ إضافة رموز الأخطاء المقترحة تحتاج موافقة عند بدء التنفيذ (لا تُعدَّل الملفات الآن).

---

## 5. واجهات القراءة العامة (Public Read Interfaces — G1)

القراءة من نطاقات التجارة تتم **حصرياً** عبر عقود قراءة تُصرَّح في `index.ts` لكل نطاق (مثال):

```typescript
// modules/supplier-network/index.ts — إضافة مقترحة (G1)
export interface SupplierReadService {
  matchCandidates(query: MatchQuery): Promise<SupplierCandidate[]>;
  // supplierId, capability, coverage, verificationLevel, ratings, relationship
}

// modules/product-catalog/index.ts — إضافة مقترحة (G1)
export interface CatalogReadService {
  productsBySpecs(filter: CatalogFilter): Promise<ProductReadModel[]>;
  offeringsByProduct(productId: string, opts?): Promise<OfferingReadModel[]>;
}

// modules/inventory/index.ts — إضافة مقترحة (G1)
export interface InventoryReadService {
  availability(offeringIds: string[]): Promise<AvailabilityReadModel[]>;
}
```

| القاعدة | الوصف |
|---------|-------|
| قراءة فقط | لا دالة تعدّل أو تكتب في نطاق آخر |
| عبر index.ts | لا استيراد `services/` مباشرة (ADR-005/007) |
| نماذج قراءة (ReadModels) | لا تمرير كيانات Prisma كاملة |
| تُنفَّذ في Sprint AI-0b | العقد يُعتمَد في هذا السبرينت ويُنفَّذ مع التنفيذ |

> Sprint AI-0 يُسلِّم **العقود**؛ التنفيذ الفعلي لعقود القراءة يقع في Sprint التنفيذ بالتعاون مع مالكي النطاقات.

---

## 6. حدود معمارية (تكملة ADR-007 للنطاق AI)

```
AI ← shared/                    ✅ مسموح
AI ← supplier-network/index.ts  ✅ (قراءة فقط — G1)
AI ← product-catalog/index.ts   ✅ (قراءة فقط — G1)
AI ← inventory/index.ts         ✅ (قراءة فقط — G1)
AI ← marketplace/index.ts       ✅ (قراءة فقط — G1)
AI ← أحداث procurement          ✅ (استهلاك أحداث فقط — G2)
AI ← services/ من نطاقات أخرى   ⛔ ممنوع
AI ← Prisma Models من نطاقات أخرى ⛔ ممنوع
AI ← src/app/                   ⛔ ممنوع
```

---

## 7. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | عقود `IAiProvider` / `IAiGateway` مرجعية ومعتمدة |
| 2 | مصفوفة `capability × feature × provider` محددة |
| 3 | واجهات القراءة العامة (G1) معتمدة مع مالكي النطاقات |
| 4 | قائمة رموز الأخطاء المطلوب إضافتها معتمدة |
| 5 | لا تعارض مع ADR-006/007/009 |
