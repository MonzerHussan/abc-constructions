# Sprint AI-1 · Deliverable 1 — Document Processing Pipeline

> **المسار:** AI & Integration Layer — Sprint AI-1
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **المرجع:** `01-ai-architecture.md` §3.4/3.5 · `04-data-flow-diagrams.md` §3 · `05-api-integration-strategy.md` §2.3/2.4 · `09-ai-cost-management.md` §3.4

---

## 1. الغرض

خط معالجة موحّد يُحوّل **أي مستند BOQ** (PDF/Excel/CSV/صور) إلى **بنود منظمة جاهزة للتطبيع** — عبر مراحل ثابتة، حالة قابلة للتتبع (`AiJob`)، ومعالجة خلفية غير متزامنة.

## 2. الصيغ المدعومة ومصيرها

| الصيغة | المصدر | المسار | ملاحظة |
|--------|--------|--------|--------|
| PDF بنص (Text Layer) | لوحات BOQ رقمية | استخراج نص → تحليل جدولي | الأرخص (بدون OCR) |
| PDF ممسوح ضوئياً | صور ممسوحة | OCR → تحليل جدولي | أغلى — يُفعَّل حسب الحاجة |
| XLSX / CSV | جداول BOQ إلكترونية | قراءة جدولية مباشرة | الأدق والأرخص |
| صور (PNG/JPG) | لوحات/رسومات | OCR كامل | أغلى — حالات محدودة |

## 3. المراحل (Stages)

```
  1. INGEST     2. VALIDATE    3. PARSE       4. EXTRACT    5. NORMALIZE    6. PERSIST
(استلام الملف) (فحص الصيغة)  (تحليل هيكل)   (استخراج بنود) (تطبيع ← تسليم 4) (حفظ/حالة)
```

| # | المرحلة | الوصف | فشل = ؟ |
|---|---------|-------|---------|
| 1 | `INGEST` | الملف يصل عبر `fileId` من Storage module (لا رفع مباشر للنطاق AI) | FAILED |
| 2 | `VALIDATE` | الصيغة والحجم (حد أقصى 20MB) والقراءة | FAILED مع سبب |
| 3 | `PARSE` | استخراج النص/الجداول حسب الصيغة (Text Layer أو OCR أو قراءة Excel) | RETRY ثم FAILED |
| 4 | `EXTRACT` | اكتشاف بنود BOQ (اسم/كمية/وحدة/سعر اختياري) — تسليم 3 | PARTIAL ممكن |
| 5 | `NORMALIZE` | تطبيع إلى `MaterialCategory`/`UnitOfMeasure` — تسليم 4 | PARTIAL (مع أسباب) |
| 6 | `PERSIST` | حفظ النتيجة وربطها بـ `AiJob` + إصدار حدث `AI.Boq.Extracted` | COMPLETED |

## 4. حالات المهمة (AiJob)

```
PENDING → PROCESSING → COMPLETED
               │            │
               ▼            ▼
            PARTIAL ←──── FAILED (مع RETRY)
```

| الحالة | المعنى |
|--------|--------|
| `PENDING` | أُنشئت في انتظار معالج الخلفية |
| `PROCESSING` | جارٍ التنفيذ (يُلاحظ `progress` بالمرحلة) |
| `PARTIAL` | اكتملت ببنود صالحة + `warnings[]` (بنود مشكوك بها تُعلَّم) |
| `COMPLETED` | كل البنود طُبِّعت بنجاح |
| `FAILED` | فشل حتمي (صيغة/قراءة) مع `errorCode` — قابل لـ `retry` |

> مطابقة لنمط `InventoryImport` (PENDING → PROCESSING → COMPLETED → FAILED) في `01-ai-architecture.md` §3.5 — مع إضافة `PARTIAL` لطبيعة BOQ.

## 5. التصميم الفني

### 5.1 هيكل الخدمة (مقترح)

```
modules/ai/
└── boq/
    ├── pipeline/          # مراحل 1–6 (Stage Handlers)
    │   ├── ingest.handler.ts
    │   ├── validate.handler.ts
    │   ├── parse.handler.ts       # يختار: text-layer | ocr | spreadsheet
    │   ├── extract.handler.ts
    │   ├── normalize.handler.ts   # يستدعي MaterialMappingService (تسليم 4)
    │   └── persist.handler.ts
    ├── boq-job.service.ts         # حالة AiJob + استدعاء المراحل
    └── boq-events.ts              # AI.Boq.Extracted / AI.Boq.Failed
```

### 5.2 التزامن والمعالجة

- **غير متزامن بالكامل** عبر `AiJob` — `POST /api/v1/ai/boq/extract` يرجع `{ jobId }` فوراً.
- تنفيذ تسلسلي للمراحل داخل العامل؛ أي مرحلة فاشلة تنتقل حسب سياسة (جدول §3).
- **Retry:** يدوي (`POST /ai/jobs/:jobId/retry`) + تلقائي (مرة واحدة، فقط لمراحل `PARSE` المؤقتة).

### 5.3 محاذاة التكلفة (09 §3.4)

- `PARSE`: القاعدة تختار أرخص مسار صالح (Text Layer قبل OCR).
- `EXTRACT/NORMALIZE`: **Batching** — عدة بنود في استدعاء واحد بدل استدعاء لكل بند.
- Cache: نفس نوع المستند/الهيكل المتكرر لا يُعاد تحليله.

### 5.4 الأمان والحوكمة (08)

- لا وصول مباشر لملفات Domains — عبر `fileId` + Public Read Interface (G1).
- حجم/نوع محددان مسبقاً (منع ملفات خبيثة/ضخمة).
- النتيجة تُخزَّن داخل نطاق AI، وأي PII داخل المستند لا يُرسل خارج النطاق إلا بموافقة.

## 6. هيكل النتيجة الموحّد (خط النهاية)

```typescript
interface BoqExtractionResult {
  jobId: string;
  status: 'COMPLETED' | 'PARTIAL';
  items: BoqItem[];              // بنود خام منسّقة (تسليم 3)
  warnings: string[];            // تحذيرات (بنود مشكوك بها، وحدات غير قابلة للتعرف)
  rawMeta: { fileName: string; format: string; pageCount?: number };
  confidence: number;            // → AiConfidenceBadge (G4)
}
```

## 7. مصفوفة الفشل والأخطاء

| السيناريو | الخطأ | السلوك |
|-----------|-------|--------|
| صيغة غير مدعومة | `BOQ_UNSUPPORTED_FORMAT` | FAILED + رسالة واضحة |
| ملف تالف/غير قابل للقراءة | `BOQ_INVALID_FILE` | FAILED (قابل retry) |
| لا بنود قابلة للاستخراج | `BOQ_NO_ITEMS` | FAILED مع اقتراح صيغة بديلة |
| بعض البنود مشكوك فيها | — | PARTIAL مع `warnings[]` |
| فشل OCR (تسليم 2) | `AI_OCR_FAILED` | Fallback → خطأ مع إشعار |

## 8. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | مصفوفة الصيغ ومصيرها معتمدة |
| 2 | حالات `AiJob` (بما فيها `PARTIAL`) معتمدة |
| 3 | هيكل `BoqExtractionResult` معتمد (يستمر في تسليم 3) |
| 4 | مسار المعالجة متوافق مع 09 (Tiering/Batching) و08 (حوكمة) |
| 5 | لا تعارض مع Storage/Product Catalog ADRs |
