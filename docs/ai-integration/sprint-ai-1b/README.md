# Sprint AI-1b — BOQ Intelligence Implementation (خطة التنفيذ)

> **المسار:** AI & Integration Layer
> **المرجع:** Sprint AI-1 (✅ Closed 8/8) · `05-api-contracts.md` · `06-extraction-versioning.md` · `07-evaluation-dataset.md`
> **الوضع:** ⏸ **معلَّق — ينتظر G-2 فقط** (اعتماد المبرمج الأول لعقود API في `08-p1-api-contract-review.md`)
> **عند إغلاق G-2:** يعتبر Sprint AI-1b معتمداً ويبدأ التنفيذ وفق T1–T5
> **التاريخ:** 2026-07-31

---

## 1. الهدف

تنفيذ **BOQ Intelligence** وفق العقود والتصميمات المعتمدة حرفياً — دون تعديل Domain Models أو الـ ADRs إلا بموافقة رسمية مسبقة (G-4).

## 2. البوابات (Gates) قبل البدء

| # | الشرط | الحالة |
|---|-------|--------|
| G-1 | تصميمات Sprint AI-1 (1–7) معتمدة | ✅ |
| G-2 | مراجعة المبرمج الأول لعقود API = Approved (`08-p1-api-contract-review.md`) | ⏳ **القيد الوحيد المتبقي** |
| G-3 | خطة التنفيذ (هذه الوثيقة) معتمدة | ✅ |
| G-4 | موافقة رسمية على أي تغيير Domain/ADR (إن لزم) | — |

> **لا يبدأ أي كود قبل G-2 = Approved.** عند إغلاق G-2 يعتبر Sprint AI-1b معتمداً تلقائياً.

## 3. التزامات التنفيذ (إلزامية — توجيه رسمي)

| # | الالتزام |
|---|----------|
| C-1 | **لا تعديل على Domain Models** |
| C-2 | **لا تعديل على الـ ADRs** |
| C-3 | **لا وصول مباشر إلى Domain Data** (عبر Public Read Interfaces فقط — G1) |
| C-4 | الالتزام بـ **عقود API المعتمدة** فقط (`05-api-contracts.md`) |
| C-5 | الالتزام بـ **AI Governance (08)** و **AI Cost Management (09)** |
| C-6 | **Human-in-the-Loop** وفق العتبات المعتمدة (تسليم 7) |

## 3.1 تقارير التقدم الإلزامية

بعد نهاية **كل مهمة (T1 → T5)** يُصدر تقرير شامل يتضمن:
1. **الأعمال المنجزة.**
2. **نتائج الاختبارات.**
3. **مؤشرات الأداء والجودة مقارنة بالأهداف** (عتبات تسليم 7).
4. **أي مخاطر أو انحرافات.**
5. **أي قرارات معمارية تتطلب اعتماداً قبل الانتقال للمهمة التالية.**

> لا يُنتقل إلى المهمة التالية قبل استعراض تقرير المهمة الحالية والبت في القرارات المعلقة (إن وجدت).

## 3.2 مبادئ التنفيذ الإلزامية

1. **الفصل:** كل الكود داخل `modules/ai/` (و`components/ui/ai/` للواجهة) — لا لمس لـ Domains أخرى.
2. **عقود معتمدة:** الـ routes/الأخطاء/الردود مطابقة حرفياً لـ `05-api-contracts.md`.
3. **Feature Flags:** القدرة خلف `FF_AI_BOQ` (نمط `feature-flags.ts` الحالي) — إطلاق آمن.
4. **لا أسرار:** مفاتيح المزوّدين عبر `.env`/secrets فقط — لا تكتب في الكود/الملفات.
5. **التزامن مع 09:** Batching + Cache + Tiering منذ السطر الأول.
6. **اختبارات:** Unit + Contract + Integration — ومقياس جودة على Gold Dataset (تسليم 7) قبل الاعتماد.

## 4. تقسيم العمل (Tasks)

### المرحلة 1 — الأساس (Prisma + نموذج بيانات)
| المهمة | الوصف | يعتمد على |
|--------|-------|-----------|
| T1.1 | اعتماد نماذج AI (Prisma): `AiModel`, `AiUsage`, `AiQuota`, `AiJob` (ترقية), `AiExtractionVersion` | G-2/G-4 |
| T1.2 | قائمة انتظار بسيطة (`AiJobService` — Polling داخلي، نمط `InventoryImport`) | T1.1 |
| T1.3 | Feature Flag `FF_AI_BOQ` + تسجيل الاستخدام (Deliverable 0-3) | T1.1 |

### المرحلة 2 — بوابة النماذج (Sprint AI-0)
| المهمة | الوصف |
|--------|-------|
| T2.1 | `IAiProvider` + `AiProviderRegistry` (تسجيل مزوّد واحد تجريبي) |
| T2.2 | `AiGateway` (quota/cache/retry/fallback/usage) — وفق `01-ai-gateway-architecture.md` |
| T2.3 | أوّل تطبيق Tiering + Cache (09) عبر البوابة |

### المرحلة 3 — خط المعالجة (Pipeline)
| المهمة | الوصف | يعتمد على |
|--------|-------|-----------|
| T3.1 | `INGEST` + `VALIDATE` (ملف → Storage Interface، حجم/صيغة) | T2.x |
| T3.2 | `PARSE` (Text Layer → قراءة XLSX/CSV → OCR حسب الحاجة) | T2.x |
| T3.3 | `EXTRACT` (اكتشاف بنود → `BoqItem`) | T3.2 |
| T3.4 | `NORMALIZE` (`MaterialMappingService` — قواعد→متجهات→LLM) | T3.3 |
| T3.5 | `PERSIST` + لقطة الإصدارات (`AiExtractionVersion`) | T3.4 + T1.1 |
| T3.6 | أحداث `AI.Boq.*` | T3.5 |

### المرحلة 4 — واجهات الـ API (العقود)
| المهمة | الوصف |
|--------|-------|
| T4.1 | `POST /api/v1/ai/boq/extract` |
| T4.2 | `GET /api/v1/ai/jobs/:jobId` |
| T4.3 | `POST /api/v1/ai/jobs/:jobId/retry` |
| T4.4 | `POST /api/v1/ai/boq/items/:itemId/feedback` |
| T4.5 | (محجوز) `POST /api/v1/ai/boq/estimate` — لا تنفيذ |

### المرحلة 5 — أدوات الجودة (تسليم 7)
| المهمة | الوصف |
|--------|-------|
| T5.1 | مجلد `tests/ai/gold/` + manifest + عيّنات معماة |
| T5.2 | سكربت `npm run ai:eval` (تشغيل على Gold → تقرير) |
| T5.3 | تقرير قبل/بعد + بوابة القبول (عتبات تسليم 7) |

## 5. تعريف الإنجاز (DoD)

| # | المعيار |
|---|---------|
| DoD-1 | مسار كامل: رفع ملف → `jobId` → `COMPLETED/PARTIAL` → بنود مطبّعة |
| DoD-2 | كل الـ routes مطابقة لعقود `05-api-contracts.md` حرفياً |
| DoD-3 | لقطة إصدارات محفوظة لكل استخراج (تسليم 6) |
| DoD-4 | تقييم على Gold Dataset: المؤشرات ضمن عتبات تسليم 7 |
| DoD-5 | 0 أخطاء TypeScript + كل الاختبارات القائمة تمر (لا كسر عكسي) |
| DoD-6 | Feature Flag `FF_AI_BOQ` = Off افتراضياً (إطلاق آمن) |
| DoD-7 | 0 تعديل على Domain Models / ADRs (بدون موافقة موثقة) |

## 6. خارج النطاق (لاحقاً)

- تقدير التكلفة (`/boq/estimate`) → Pricing Intelligence.
- اقتراح منتجات لكل بند → Sprint AI-2/ما بعد.
- معالجة الملايين من المستندات (BullMQ/Redis) → المرحلة المتقدمة.
- مكوّنات UI (AiAnalysisPanel...) → Sprint للواجهة بعد اعتماد Design Spec.

## 7. إدارة المخاطر

| الخطر | التخفيف |
|-------|---------|
| تغيير في حدود Domain | G-4: أي لمسة تحتاج موافقة موثقة قبلها |
| تكلفة OCR/LLM عالية | 09: Tiering + Cache + Batching منذ التصميم |
| جودة عربية منخفضة | Gold Dataset عربي + معاينة يدوية قبل الاعتماد |
| تعارض مع `AiInsight` (Research) | إبقاء نسخة Research كما هي — لا نقل دون موافقة |

---

*إعداد: Programmer 4 — Sprint AI-1b: BOQ Intelligence Implementation. معلَّق على G-2 (مراجعة المبرمج الأول).*
