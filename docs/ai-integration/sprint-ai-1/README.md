# Sprint AI-1 — BOQ Intelligence Foundation

> **المسار:** AI & Integration Layer
> **المرجع:** `07-ai-alignment-review.md` (G1–G4) + Sprint AI-0 (✅ معتمد) + `08-ai-governance.md` + `09-ai-cost-management.md`
> **الوضع:** ✅ **Closed — Design Phase Complete (8/8 Deliverables)** — Sprint AI-1 مغلق رسمياً
> **باقٍ:** G-2 (اعتماد المبرمج الأول لعقود API) — شرط وحيد لبدء Sprint AI-1b
> **التاريخ:** 2026-07-31

---

## 1. سجل الإغلاق (Sprint Closure)

| الحقل | القيمة |
|-------|--------|
| نتيجة المراجعة | ✅ Approved — Sprint AI-1 مكتمل (8/8) |
| الوثائق المعتمدة | Extraction Versioning · Evaluation Dataset · P1 API Contract Review · Gates G-1..G-4 · AI-1b Plan |
| قرار منهجي | إيقاف التنفيذ حتى إغلاق G-2 — متوافق مع منهجية المشروع |
| ما يمنع التنفيذ الآن | G-2 فقط (لا Implementation/Migration/API Integration قبله) |

---

## 1. الهدف

تصميم **أساس BOQ Intelligence** — خط معالجة المستندات، استراتيجية الـ OCR، تدفق الاستخراج، تطبيع المواد، وعقود الـ API — بحيث يكون التنفيذ (Sprint AI-1b) مباشراً دون قرارات معمارية معلّقة. كل شيء هنا **تصميم/مواصفة** فقط.

## 2. القرارات الحاكمة المطبقة

| القرار | كيف يظهر في هذا الـ Sprint |
|--------|----------------------------|
| **G1** | الوصول للبيانات عبر Public Read Interfaces فقط |
| **G2** | مستهلكو أحداث لا يكتبون في Domains |
| **G3** | Retrieval/قواعد أولاً، ثم النموذج — أقل تكلفة كافية (09) |
| **G4** | النتائج تُعرض عبر `AiAnalysisPanel` + `AiConfidenceBadge` |
| **Governance (08)** | Human-in-the-Loop، Grounded Outputs، Fallback |
| **Cost (09)** | Tiering + Batching + Cache منذ التصميم |

## 3. التسليمات (Deliverables) — 8

| # | التسليم | الوثيقة |
|---|---------|---------|
| 1 | **Document Processing Pipeline** | [`01-document-processing-pipeline.md`](./01-document-processing-pipeline.md) |
| 2 | **OCR Strategy** | [`02-ocr-strategy.md`](./02-ocr-strategy.md) |
| 3 | **BOQ Extraction Flow** | [`03-boq-extraction-flow.md`](./03-boq-extraction-flow.md) |
| 4 | **Material Mapping** | [`04-material-mapping.md`](./04-material-mapping.md) |
| 5 | **API Contracts** | [`05-api-contracts.md`](./05-api-contracts.md) |
| 6 | **Extraction Versioning** | [`06-extraction-versioning.md`](./06-extraction-versioning.md) |
| 7 | **Evaluation Dataset & Quality Metrics** | [`07-evaluation-dataset.md`](./07-evaluation-dataset.md) |
| 8 | **P1 API Contract Review** | [`08-p1-api-contract-review.md`](./08-p1-api-contract-review.md) |

## 4. النطاق

| ✅ ضمن النطاق (تصميم) | ⛔ خارج النطاق (Sprint لاحقة) |
|------------------------|-------------------------------|
| خط معالجة المستندات (صيغ، مراحل، حالة) | تنفيذ كود الـ pipeline |
| اختيار استراتيجية OCR + Fallback | تقدير التكلفة (Pricing Intelligence) |
| تدفق استخراج BOQ (بنود/وحدات/كميات) | اقتراح منتجات لكل بند (Sprint AI-1b/AI-2) |
| تطبيع المواد إلى `MaterialCategory`/`UnitOfMeasure` | ربط مع Supplier Matching (Sprint لاحقة) |
| عقود API + خطأ + مخططات JSON | التنفيذ الفعلي للـ routes |

## 5. تعريف الإنجاز (Definition of Done)

| # | المعيار |
|---|---------|
| DoD-1 | التصميمات الخمسة معتمدة |
| DoD-2 | عقد BOQ (Extract → Normalize → Review) مرجعي نهائي |
| DoD-3 | مصفوفة الصيغ (PDF/Excel/CSV/صور) ومصير كل واحدة معتمدة |
| DoD-4 | استراتيجية OCR (متى وأي مزوّد وFallback) معتمدة |
| DoD-5 | مخطط تطبيع المواد (فئات/وحدات/قاموس مرادفات) معتمد |
| DoD-6 | 0 انحراف عن الـ ADRs المعتمدة + التوافق مع 08/09 |

> تنفيذ الكود يبدأ في **Sprint AI-1b (التنفيذ)** بعد اعتماد هذه الخطة **وبعد اكتمال مراجعة المبرمج الأول (تسليم 8).**

## 5.5 بوابة البرمجة (Gate)

| # | الشرط قبل Sprint AI-1b |
|---|------------------------|
| G-1 | تصميمات Sprint AI-1 (1–7) معتمدة ✅ |
| G-2 | مراجعة المبرمج الأول لعقود API = **Approved** (تسليم 8) |
| G-3 | خطة التنفيذ (`sprint-ai-1b/README.md`) معتمدة |
| G-4 | أي تعديل على Domain Models / الـ ADRs → **موافقة رسمية مسبقة** فقط |

---

## 6. التسلسل

```
Sprint AI-0 (معتمد ✅) → Sprint AI-1 (معتمد ✅) → مراجعة P1 (تسليم 8)
                                                          │
                                                          ▼
                                          Sprint AI-1b (تنفيذ BOQ) ← G-1..G-4
                                                          │
                                                          ▼
                                        Sprint AI-2: Supplier Matching
```

> ملاحظة: سلسلة التخصيص المعتمدة سابقاً رتّبت Matching قبل BOQ — يُعمل بتوجيه المعتمِد: **BOQ Intelligence أولاً**.

## 7. الاعتماديات

| يعتمد على | موجود؟ |
|-----------|--------|
| بوابة AI + تسجيل الاستخدام (Sprint AI-0) | ✅ معتمد |
| نمط استهلاك الأحداث (Sprint AI-0) | ✅ معتمد |
| `MaterialCategory` / `UnitOfMeasure` (Product Catalog, ADR-019) | ✅ موجودة في `prisma/schema.prisma` |
| حوكمة + إدارة التكلفة (08/09) | ✅ معتمدة |
| `AiJob` (المهام غير المتزامنة) | 📝 مواصفة — يُعتمد في التنفيذ |

## 8. مؤشرات نجاح Sprint AI-1

| المؤشر | الهدف |
|--------|-------|
| مراجعة التصميم | اعتماد من Architecture Review Board + Product Experience |
| اكتمال المواصفات | 5/5 تسليمات معتمدة |
| جاهزية التنفيذ | لا قرارات معمارية معلّقة عند بدء AI-1b |

---

*إعداد: Programmer 4 — Sprint AI-1: BOQ Intelligence Foundation. بانتظار اعتماد الخطة.*
