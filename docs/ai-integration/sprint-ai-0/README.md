# Sprint AI-0 — AI Foundation

> **المسار:** AI & Integration Layer
> **المرجع:** `docs/ai-integration/07-ai-alignment-review.md` — ✅ اعتماد مشروط (G1–G4)
> **الوضع:** 📝 خطة Sprint — جاهزة للاعتماد — **لا تنفيذ برمجي قبل اعتماد الخطة**
> **التاريخ:** 2026-07-31

---

## 1. الهدف

بناء **أساس نطاق AI** في Sprint واحد: بوابة نماذج موحّدة، نمط استهلاك أحداث، تتبّع استخدام/حصص، ومواصفات مكوّنات UI معتمدة — بحيث يكون النطاق جاهزاً لاستقبال **BOQ Intelligence** و **Matching Engine** في الـ Sprint التالية دون إعادة بناء.

## 2. القرارات المعتمدة التي يبني عليها هذا الـ Sprint

| القرار | المضمون |
|--------|---------|
| **G1** | Public Read Interfaces لكل Domain — لا وصول مباشر لـ Domain Data |
| **G2** | Outbox مسؤولية Domains/Gateway فقط — AI يستهلك Events عبر Event Bus |
| **G3** | Search=Retrieval · Analytics=Insights · AI=Understanding/Matching/Recommendations |
| **G4** | إضافة مكوّنات AI إلى Design System (4 مكوّنات) |

---

## 3. التسليمات (Deliverables) — 4

| # | التسليم | الوثيقة | يخدم |
|---|---------|---------|------|
| 1 | **AI Gateway Architecture** | [`01-ai-gateway-architecture.md`](./01-ai-gateway-architecture.md) | G1 (قراءة) + G3 |
| 2 | **Event Consumption Pattern** | [`02-event-consumption-pattern.md`](./02-event-consumption-pattern.md) | G2 |
| 3 | **AI Usage Tracking Model** | [`03-ai-usage-tracking-model.md`](./03-ai-usage-tracking-model.md) | Business (Credits) |
| 4 | **AI Design Components Specification** | [`04-ai-design-components-spec.md`](./04-ai-design-components-spec.md) | G4 |

---

## 4. نطاق Sprint AI-0 (In Scope)

| ✅ ضمن النطاق | ⛔ خارج النطاق (Sprint لاحقة) |
|---------------|-------------------------------|
| عقد `IAiProvider` + تسجيل المزوّدين (1 مزود تجريبي) | Supplier Matching Engine |
| `AiGateway` (quota/cache/retry/fallback/usage) | BOQ Intelligence |
| نمط استهلاك الأحداث + Public Read Interfaces | Tender Analysis |
| نماذج Prisma: `AiUsage`, `AiQuota` (+ ترقية `AiModel`/`AiJob` إن لزم) | Pricing Intelligence |
| مواصفات 4 مكوّنات UI (تسليم Design Spec لا التنفيذ) | Search Assistant |
| اعتماد عقود الواجهات للمرحلة التالية | Document Extraction |

---

## 5. تعريف الإنجاز (Definition of Done)

| # | المعيار |
|---|---------|
| DoD-1 | مواصفات الـ 4 تسليمات معتمدة (هذه الوثائق) |
| DoD-2 | عقود `IAiProvider` و `AiGateway` و `IAiGateway` مرجعية نهائية |
| DoD-3 | مصفوفة الأحداث المطلوب استهلاكها + عقود Public Read Interfaces موقعة (G1/G2) |
| DoD-4 | نموذج `AiUsage`/`AiQuota` معتمد + واجهات تقارير محددة |
| DoD-5 | مواصفات 4 مكوّنات UI معتمدة من Product Experience |
| DoD-6 | 0 انحراف عن الـ ADRs المعتمدة |

> تنفيذ الكود (Prisma models، الخدمات، الـ API routes) يبدأ في **Sprint AI-0b (التنفيذ)** بعد اعتماد هذه الخطة.

---

## 6. التسلسل بعد الاعتماد

```
Sprint AI-0 (هذه الخطة)  →  اعتماد  →  Sprint AI-0b (التنفيذ الأساس)
                                          │
                                          ▼
                              Sprint AI-1: Supplier Matching Engine
                              Sprint AI-2: BOQ Intelligence
```

---

## 7. مؤشرات نجاح Sprint AI-0

| المؤشر | الهدف |
|--------|-------|
| مراجعة التصميم | اعتماد من Architecture Review Board + Product Experience |
| اكتمال المواصفات | 4/4 تسليمات معتمدة |
| الجاهزية للمرحلة التالية | عقود Matching/BOQ جاهزة للبناء بدون تعديل بنية |

---

*إعداد: Programmer 4 — Sprint AI-0: AI Foundation. بانتظار اعتماد الخطة.*
