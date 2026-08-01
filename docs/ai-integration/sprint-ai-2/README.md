# Sprint AI-2 — ABC Agent Operating System (Multi-Agent Intelligence Platform)

> **المسار:** AI & Integration Layer
> **المرجع:** Sprint AI-0 (✅) + Sprint AI-1 (✅ Closed 8/8) + `08-ai-governance.md` + `09-ai-cost-management.md` + `07-ai-alignment-review.md` (G1–G4)
> **الوضع:** 📝 **خطة Sprint — Design Only — لا تنفيذ برمجي قبل الاعتماد**
> **التاريخ:** 2026-07-31

---

## 1. الهدف

توسيع مفهوم "وكيل لكل حساب" إلى **ABC Multi-Agent Intelligence Platform**: منظومة وكلاء متخصصة لكل منظومة أعمال (Career / Learning / Construction / Platform Business)، تديرها **نواة تنسيق** (Orchestrator) فوق **خدمات AI مشتركة** — بتصور Architecture كامل **قبل أي تنفيذ**.

> **النطاق هنا = التصميم فقط.** ممنوع: كتابة كود · تعديل Domain Models · Migrations · تغيير ADRs.

## 2. المبادئ الحاكمة (مستمرة من الأسباقات السابقة)

| المبدأ | التطبيق هنا |
|--------|-------------|
| **G1** | الوكلاء يقرؤون فقط عبر Public Read Interfaces — لا وصول مباشر |
| **G2** | الوكلاء يستهلكون أحداثاً ولا يكتبون في Domains |
| **G3** | القواعد/Retrieval أولاً ثم النموذج — لا عمل LLM بلا حاجة |
| **G4** | كل ناتج وكيل يعرض ثقة + أسباب + مصادر (شفافية) |
| **08** | Human-in-the-Loop + امتثال + تدقيق لكل وكيل |
| **09** | كل استدعاء عبر البوابة + حصص + Cache + Tiering |
| **Feature Flags** | كل وكيل خلف `FF_AGENT_*` — إطلاق منفصل |

## 3. الوكلاء (17) عبر 4 منظومات

| المنظومة | الوكلاء |
|----------|---------|
| **Career** | Job Seeker · Recruiter |
| **Learning** | Student · Trainer |
| **Construction** | Contractor · Supplier · Procurement · Logistics |
| **Platform Business** | Customer Service · Sales · Marketing · Finance · Legal · HR · Analytics · Security · Admin |

## 4. التسليمات (Deliverables) — 8

| # | التسليم | الوثيقة |
|---|---------|---------|
| 1 | **Agent Taxonomy** | [`01-agent-taxonomy.md`](./01-agent-taxonomy.md) |
| 2 | **Orchestrator Architecture** | [`02-orchestrator-architecture.md`](./02-orchestrator-architecture.md) |
| 3 | **Shared AI Services** | [`03-shared-ai-services.md`](./03-shared-ai-services.md) |
| 4 | **Memory Model** | [`04-memory-model.md`](./04-memory-model.md) |
| 5 | **Tool Permission Model** | [`05-tool-permission-model.md`](./05-tool-permission-model.md) |
| 6 | **RAG Integration** | [`06-rag-integration.md`](./06-rag-integration.md) |
| 7 | **Governance Rules** | [`07-governance-rules.md`](./07-governance-rules.md) |
| 8 | **Business/Pricing Model** | [`08-business-pricing-model.md`](./08-business-pricing-model.md) |

## 5. النطاق

| ✅ ضمن النطاق (تصميم) | ⛔ خارج النطاق |
|------------------------|----------------|
| تصنيف الوكلاء والمنظومات | أي كود/مكونات React |
| نواة التنسيق (Orchestrator) | تعديل Domain Models / ADRs |
| خدمات AI المشتركة | Migrations |
| نموذج الذاكرة | تنفيذ أدوات/توكلات |
| نموذج أذونات الأدوات | التكامل مع مزوّدين خارجيين |
| تكامل RAG | — |
| قواعد الحوكمة | — |
| نموذج الأعمال/الأسعار | — |

## 6. تعريف الإنجاز (Definition of Done)

| # | المعيار |
|---|---------|
| DoD-1 | تصنيف الوكلاء (17) مع خصائص كل وكيل معتمد |
| DoD-2 | بنية الـ Orchestrator (تخطيط/توجيه/تفويض) معتمدة |
| DoD-3 | خرائط خدمات AI المشتركة معتمدة |
| DoD-4 | نموذج الذاكرة (أنواع/نطاقات/احتفاظ) معتمد |
| DoD-5 | نموذج أذونات الأدوات + RBAC/Human-in-the-Loop معتمد |
| DoD-6 | تكامل RAG (مصادر/فهارس/استرجاع) معتمد |
| DoD-7 | قواعد الحوكمة متعددة الوكلاء معتمدة (توسعة 08) |
| DoD-8 | نموذج أعمال/أسعار معتمد (يتماشى مع 09) |
| DoD-9 | 0 انحراف عن ADRs + التوافق التام مع G1–G4/08/09 |

> التنفيذ (Sprint AI-2b) لن يبدأ إلا بعد اعتماد هذا التصميم **وبعد** مسار BOQ (AI-1b) بحسب أولوية الأسباقات.

## 7. التسلسل

```
Sprint AI-1 (Closed ✅) → [G-2 من AI-1b] → Sprint AI-1b (تنفيذ BOQ)
                                                │
Sprint AI-2 (هذا التصميم) → اعتماد → Sprint AI-2b (تنفيذ Multi-Agent)
```

## 8. مؤشرات نجاح Sprint AI-2

| المؤشر | الهدف |
|--------|-------|
| اكتمال التصميم | 8/8 تسليمات معتمدة |
| الاتساق | 0 تعارض مع G1–G4/08/09/ADRs |
| الجاهزية | لا قرارات معمارية معلّقة عند فتح AI-2b |
| قابلية التوسع | تصميم يدعم +17 وكيلاً دون إعادة بناء |

---

*إعداد: Programmer 4 — Sprint AI-2: ABC Agent Operating System. بانتظار الاعتماد.*
