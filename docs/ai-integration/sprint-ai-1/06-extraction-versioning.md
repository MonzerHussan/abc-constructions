# Sprint AI-1 · Deliverable 6 — Extraction Versioning (إصدار عمليات الاستخراج)

> **المسار:** AI & Integration Layer — Sprint AI-1
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **المرجع:** `03-ai-data-strategy.md` (`AiJob`) · `01-document-processing-pipeline.md` · `04-material-mapping.md` · `05-api-contracts.md`
> **الغرض:** **قابلية التتبع وإعادة التحليل** — كل استخراج يُسجَّل بإصداراته ليتسنى إعادة التشغيل عند تحسين النماذج مستقبلاً.

---

## 1. الهدف

حفظ **لقطة إصدارات كاملة** لكل عملية استخراج BOQ:

| الإصدار | ما يمثله | يلتقط عند |
|---------|----------|-----------|
| **Prompt Version** | إصدار قالب الـ prompt (نص الاستخراج/التطبيع) | مرحلة `EXTRACT`/`NORMALIZE` |
| **Mapping Version** | إصدار قاموس المرادفات/قواعد التطبيع | مرحلة `NORMALIZE` |
| **OCR Engine Version** | إصدار محرك OCR المستخدم (إن وُجد) | مرحلة `PARSE` |
| **AI Model Version** | إصدار النموذج/المزوّد (من `AiModel`) | كل استدعاء |

> **القيمة:** عند تحسين نموذج/قاموس/مستند، يمكن **إعادة تحليل أي مستند سابق** بنفس الإصدارات أو مقارنة الإصدارات — دون فقدان أثر النتيجة الأصلية.

---

## 2. التصميم المقترح (نموذج بيانات)

إضافة نموذج جديد في نطاق AI (لا تعديل على أي جدول Domain):

```prisma
model AiExtractionVersion {
  id              String   @id @default(cuid())
  jobId           String                 // يرتبط بـ AiJob (EXTRACTION)
  type            String   // 'BOQ'
  fileId          String                 // مرجع Storage (إعادة التحليل)
  format          String   // pdf | xlsx | csv | image

  // === لقطة الإصدارات (المطلوبة) ===
  promptVersion   String   // git-hash/نموذج إصدار (مثال: "prompt-boq-v3")
  mappingVersion  String   // إصدار قاموس المرادفات (مثال: "map-steel-v5")
  ocrEngine       String?  // اسم/إصدار محرك OCR (null إذا لم يُستخدم)
  modelId         String?  // → AiModel (النموذج الرئيسي المستخدم)
  modelVersion    String?  // إصدار النموذج لدى المزوّد

  // === سياق التحليل ===
  extractionHash  String   // هاش المستند+الإصدارات (لتجنب التكرار — Cache, 09)
  reanalysisOf   String?   // jobId لتحليل سابق أُعيد (أثر السلسلة)
  createdAt       DateTime @default(now())

  @@index([fileId])
  @@index([mappingVersion])
  @@index([createdAt])
  @@unique([jobId, type])
}
```

**ملاحظة توافق:** هذا **نموذج جديد** في نطاق AI — لا يُعدَّل أي جدول `Prisma` قائم لـ Domains أخرى (القيود المعتمدة).

### 2.1 من أين تُقرأ الإصدارات؟

| الحقل | المصدر |
|-------|--------|
| `promptVersion` | ثابت إصدار يُدار في الكود (`constants/prompts.ts`) |
| `mappingVersion` | عداد إصدار قاموس المرادفات (يُزاد عند أي تعديل) |
| `ocrEngine` | اسم/إصدار من خدمة OCR (تسليم 2) |
| `modelId`/`modelVersion` | من سجل `AiModel` + استجابة المزوّد |

---

## 3. دورة الحياة

```
تحليل جديد → AiExtractionVersion(jobId, versions) → مستخدم/نظام
    ↑                                                      │
    └──── إعادة تحليل (reanalysisOf = jobId) ←─────────────┘
```

| الحالة | السلوك |
|--------|--------|
| تحليل عادي | تُحفظ لقطة إصدارات واحدة |
| تحسين نموذج/قاموس | إصدار جديد → **إعادة تحليل اختيارية** لأي ملف قديم (يُحفظ أثر `reanalysisOf`) |
| تتبع المشكلة | أي نتيجة مشكوك بها تُراجع بلقطتها الأصلية |
| التكرار (Cache) | نفس `extractionHash` لا يُعاد تحليله إلا بطلب صريح |

---

## 4. إعادة التحليل (Re-analysis)

- **الواجهة (مقترحة، تُضاف في Sprint AI-1b):**
  | Method | Path | الوصف |
  |--------|------|-------|
  | POST | `/api/v1/ai/boq/reanalyze` | إعادة تحليل `fileId` بالإصدارات الحالية |
  | GET | `/api/v1/ai/boq/jobs/:jobId/versions` | عرض لقطة إصدارات المهمة |

- **المقارنة:** نتيجة جديدة تُخزَّن بجانب القديمة (لا استبدال) — يقرر المستخدم/أدمن اعتماد أيها (Human-in-the-Loop, 08).
- **القياس:** عند إعادة التحليل على **Gold Dataset** (تسليم 7) تُحسب الجودة قبل/بعد — أساس قرار الترقية.

---

## 5. أحداث ذات صلة (G2)

| الحدث | متى |
|-------|-----|
| `AI.Boq.Extracted` | + `extractionVersionId` في الـ payload |
| `AI.Boq.Reanalyzed` | إعادة تحليل (مع `reanalysisOf`) |
| `AI.Boq.Version.Bumped` | ترقية أي إصدار (prompt/mapping/OCR/model) |

---

## 6. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | نموذج `AiExtractionVersion` معتمد (جديد — لا تعديل Domain) |
| 2 | الحقول الأربعة (Prompt/Mapping/OCR/Model) موثقة ومصدرها محدد |
| 3 | آلية إعادة التحليل (`reanalysisOf`) معتمدة |
| 4 | الربط مع Cache (09 §3.1) عبر `extractionHash` معتمد |
| 5 | الأحداث موقعة |
