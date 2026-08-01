# Sprint AI-1 · Deliverable 8 — Programmer 1 API Contract Review (التنسيق قبل البرمجة)

> **المسار:** AI & Integration Layer — Sprint AI-1
> **المرجع:** `05-api-contracts.md` (العقود) · `01-ai-gateway-architecture.md` · `03-ai-data-strategy.md` · `06-extraction-versioning.md`
> **الغرض:** مراجعة **المراجعة الرسمية من المبرمج الأول** لعقود API ومطابقتها للـ Backend و Domain Boundaries — **شرط إلزامي قبل بدء Sprint AI-1b (البرمجة).**

---

## 1. ما المطلوب مراجعته

| # | عنصر المراجعة | المرجع |
|---|----------------|--------|
| 1 | النقاط النهائية الخمسة (Extract/Jobs/Retry/Estimate/Feedback) | `05-api-contracts.md` §7 |
| 2 | تنسيق Response Envelope + رموز الخطأ (ADR-006) | `05-api-contracts.md` §1 |
| 3 | نموذج `AiJob` + حالة `PARTIAL` وتوافقه مع أنماط المهام القائمة | `03-ai-data-strategy.md` |
| 4 | نموذج `AiExtractionVersion` (جديد — لا تعديل Domain) | `06-extraction-versioning.md` |
| 5 | الوصول للملفات عبر Storage Public Read Interface (G1) | `05-api-contracts.md` §8 |
| 6 | المصادقة/التفويض + عزل المنظمات (RBAC الحالي) | `05-api-contracts.md` §8 |
| 7 | عدم لمس Domain Models أو الـ ADRs المعتمدة | شرط إلزامي |
| 8 | أسماء الأحداث (`AI.Boq.*`) وتوافقها مع سجل الأحداث | `events-catalog.md` |

---

## 2. قائمة التحقق (Checklist للمبرمج الأول)

- [ ] النقاط النهائية متوافقة مع نمط `/api/v1` الحالي (تنسيق، مصادقة، pagination).
- [ ] رموز الخطأ تتبع `{DOMAIN}_{ENTITY}_{ISSUE}` ولا تتعارض مع رموز قائمة.
- [ ] `orgId` إلزامي والعزل بين المنظمات محفوظ.
- [ ] الوصول للملفات لا يخترق حدود Storage (G1) ولا يتطلب تعديلاً في Storage Domain.
- [ ] لا تعديل على أي Domain Model (`Prisma`) أو ADR معتمد.
- [ ] `AiJob` وحالة `PARTIAL` لا تتعارضان مع أنماط المهام غير المتزامنة القائمة.
- [ ] `AiExtractionVersion` و`AiUsage`/`AiQuota` نماذج جديدة داخل نطاق AI — لا تصادم تسميات.
- [ ] أسماء الأحداث متوافقة مع `buildEventName()` و`events-catalog.md`.
- [ ] عقد `POST /api/v1/ai/boq/estimate` محجوز (Pricing لاحقاً) — لا تنفيذ الآن.

---

## 3. النتائج المحتملة

| النتيجة | المعنى | الإجراء |
|---------|--------|---------|
| ✅ **Approved** | العقود متوافقة | فك القيد → بدء Sprint AI-1b |
| ⚠️ **Conditional** | ملاحظات غير جوهرية | معالجتها → إعادة الاعتماد |
| ❌ **Rejected** | تعارض مع Backend/حدود نطاق | مراجعة التصميم (Sprint AI-1) ثم إعادة العرض |

---

## 4. سجل الاعتماد

| الحقل | القيمة |
|-------|--------|
| التاريخ | 2026-07-31 |
| المراجع (المبرمج الأول) | □ مكتمل — الاسم/التاريخ |
| النتيجة | □ Approved □ Conditional □ Rejected |
| الملاحظات | — |
| القرار | — |

> **عند اعتماد هذه الوثيقة بعلامة Approved يُرفع القيد ويبدأ Sprint AI-1b.**

---

## 5. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | قائمة التحقق (بند 2) معتمدة من المبرمج الأول |
| 2 | سجل الاعتماد (بند 4) مكتمل |
| 3 | لا يوجد أي بند تحقق غير مؤكَّد قبل فك القيد |
