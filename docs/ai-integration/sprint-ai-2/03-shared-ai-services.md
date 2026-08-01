# Sprint AI-2 · Deliverable 3 — Shared AI Services (الخدمات المشتركة)

> **المسار:** AI & Integration Layer — Sprint AI-2
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **المرجع:** Sprint AI-0 (بوابة/أحداث/استخدام) · Sprint AI-1 (AiJob) · `08`/`09` · `04-memory-model.md` (تسليم 4) · `06-rag-integration.md` (تسليم 6)

---

## 1. المبدأ

كل الوكلاء يستهلكون **خدمات AI مشتركة واحدة** — لا يعيد كل وكيل بناء أي خدمة. هذا يضمن: توحيد التكلفة (09)، التدقيق (08)، والتطوير التدريجي.

## 2. خريطة الخدمات المشتركة

| # | الخدمة | تقدم | يستهلكها | من Sprint |
|---|--------|------|----------|-----------|
| S1 | **AiGateway** (Provider/Quota/Cache/Retry/Fallback/Usage) | نقطة الدخول الوحيدة لكل نموذج | كل الوكلاء | AI-0 |
| S2 | **AiJobService** (المهام غير المتزامنة) | معالجة ثقيلة/دفعات | Orchestrator, الوكلاء | AI-1 |
| S3 | **AgentRegistry** | سجل الوكلاء/القدرات/التكلفة | Orchestrator | AI-2 |
| S4 | **MemoryService** | أنواع الذاكرة + الاحتفاظ (تسليم 4) | كل الوكلاء | AI-2 |
| S5 | **RAGService** | فهارس/استرجاع/اقتباس (تسليم 6) | وكلاء المحتوى | AI-2 |
| S6 | **ToolRegistry + Permissions** | أدوات بموافقة (تسليم 5) | Orchestrator → الوكلاء | AI-2 |
| S7 | **FeatureSignalService** | إشارات سلوك (VIEW/SEARCH/RFQ...) | وكلاء التوصيات | ADR-024 |
| S8 | **FeedbackService (AiFeedback)** | تقييم المستخدمين → تحسين | كل الوكلاء | ADR-024 |
| S9 | **NotificationService** | إشعارات للوكلاء/المستخدمين (أحداث) | وكلاء التذكيرات | موجود |
| S10 | **Observability (ADR-009)** | سجلات/مقاييس/تدقيق | الكل | موجود |
| S11 | **i18n/Localization** | مخرجات ثلاثية اللغات (ar/en/ur) | كل المخرجات | موجود |
| S12 | **AnalyticsReadService** | مقاييس مجهلة (قراءة فقط) | Analytics Agent + تقارير | — |

## 3. مسؤوليات كل خدمة (مختصر)

| الخدمة | الواجهة المقترحة |
|--------|------------------|
| S1 | `gateway.complete(req)` / `gateway.embed(text)` — يُصدّر من AI-0 |
| S2 | `job.enqueue({type, payload})` / `job.getStatus(id)` |
| S3 | `registry.find({ecosystem, role})` / `registry.list(capability)` |
| S4 | `memory.read({scope, kind})` / `memory.write(...)` (تسليم 4) |
| S5 | `rag.search({index, query, topK})` / `rag.getChunk(id)` (تسليم 6) |
| S6 | `tools.authorize(agentId, action, ctx)` (تسليم 5) |
| S7 | `signals.record({type, ctx})` |
| S8 | `feedback.submit({agentId, target, action, rating})` |
| S9 | `notify({channel, target, template, data})` |
| S10 | `obs.log({agentId, requestId, step, latency, cost})` |
| S11 | `i18n.t(key, {locale, params})` |
| S12 | `analytics.metrics({scope, from, to})` — Read-only |

## 4. قواعد الاشتراك

1. **لا خدمة جديدة دون تسجيل** في هذه الخريطة (قاعدة تطوير).
2. **الخدمات المشتركة لا تحتوي منطق أعمال لمنظومة بعينها** — منطق المنظومة داخل الوكيل/القراءة.
3. **قراءة البيانات عبر G1 فقط** — لا خدمة تصل مباشرة لـ Domain DB (G1/G2).
4. **كل خدمة تحسب تكلفتها** في `AiUsage` (feature = "agent.{ecosystem}.{role}" أو "shared.{service}").

## 5. الاعتماديات (Dependencies)

```
AiGateway (S1) ← AiJobService (S2) ← Orchestrator (L0) ← الوكلاء (L1–L3)
        ↕            ↕
   Memory (S4)   RAG (S5)   Tools (S6)   Feedback (S8)
```

## 6. محاذاة التكلفة (09)

- الخدمات المشتركة تسهّل **Cache** مركزي (استرجاع مكرر لا يُعاد حسابه).
- **Tiering** مركزي في S1 — الوكلاء لا يختارون النماذج بأنفسهم.
- **حصص لكل وكيل/منظومة** عبر `AiQuota` (feature-bucketed).

## 7. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | خريطة الخدمات (S1–S12) معتمدة |
| 2 | واجهات الخدمات (مقترحة) معتمدة |
| 3 | قواعد الاشتراك (لا منطق منظومة في الخدمات) معتمدة |
| 4 | الربط مع 09 (Cache/Tiering/Quota) معتمد |
| 5 | لا تعارض مع ADRs (الخدمات داخل نطاق AI) |
