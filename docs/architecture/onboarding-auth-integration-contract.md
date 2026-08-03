# Onboarding & Auth — Integration Contract (المبرمج 1 ↔ المبرمج 3)

> **المسار:** Onboarding & Auth — تقسيم المسؤوليات
> **التاريخ:** 2026-08-01
> **المرجع:** قرار فريق التكامل (P1 Backend / P3 Frontend / P5 Gatekeeper)

---

## 1. تقسيم المسؤوليات (المعتمد)

| المسؤولية | المبرمج | الأدوات |
|-----------|---------|---------|
| **Authentication** (دخول/خروج) | **المبرمج 5** | `auth.config.ts` · `middleware.ts` · دوال `login()/logout()/useSession()` |
| **Onboarding Wizard** (الواجهة) | **المبرمج 3** | يبني الواجهة ويستهلك الدوال/الـ APIs فقط |
| **Profile Storage** (حفظ البيانات) | **المبرجم 1** | `sync-entity-profile` — يربط `userId` من الجلسة بالـ Entity |

**قاعدة صارمة:** المبرمج 1 **لا ينشئ مستخدمين** — فقط يستقبل البروفايل ويربطه بجلسة موجودة.

---

## 2. عقد API — حفظ البروفايل (المبرمج 3 → المبرمج 1)

### `POST /api/v1/entity-registry/sync-entity-profile`

**المصادقة:** جلسة مستخدم نشطة (المبرمج 5). يُؤخذ `userId` تلقائياً من الجلسة — **لا يُرسل في الـ body**.

**الطلب:**
```json
{
  "entity": {
    "entityType": "CUST",
    "entitySubtype": "CONTRACTOR",
    "companyName": "شركة الإعمار الحديثة",
    "contactPerson": "محمد عبدالله",
    "languagePreference": "ARABIC",
    "location": "Dubai",
    "industrySegment": "Construction",
    "relationshipStatus": "NEW",
    "source": "REFERRAL",
    "pilotStatus": "INVITED",
    "crmClassification": "LEAD"
  },
  "profile": {
    "companySize": "10-49",
    "businessActivity": "مقاول عام",
    "relevantCategories": ["أسمنت", "حديد"],
    "digitalMaturity": "Excel"
  }
}
```

**الرد (201):**
```json
{
  "success": true,
  "data": {
    "entity": { "id": "...", "entityId": "ENTITY-00001", "entityType": "CUST", "companyName": "..." },
    "profile": { "id": "...", "profileId": "PROF-00001", "entityId": "ENTITY-00001", "userId": "<session.user.id>" }
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

**الأخطاء:**
| HTTP | الكود | متى |
|------|-------|-----|
| 401 | `CORE_USER_UNAUTHORIZED` | بلا جلسة |
| 422 | `VALIDATION_ERROR` | بيانات غير صالحة |
| 500 | `INTERNAL_ERROR` | خطأ داخلي |

---

## 3. ماذا يحدث خلف الكواليس (المبرمج 1)

1. `auth()` → يقرأ `session.user.id` (من المبرمج 5، **لا يُنشأ مستخدم**).
2. يُنشأ `Entity` (ENTITY-xxxxx) + `Profile` (PROF-xxxxx) في transaction واحد.
3. `Profile.userId = session.user.id` (نص عادي، **بلا FK** — عزل معماري محفوظ).
4. يُنشر حدث `EntityRegistry.Entity.Synced`.
5. Data (P2) / AI (P4) يقرؤون عبر `Entity`/`Profile` فقط.

---

## 4. الربط بالموردين (سوق البضائع)

عند تسجيل **مورد** (بدلاً من مقاول):
- يستخدم `POST /api/v1/entity-registry/sync-supplier`
- يرسل `supplierProfileId` الموجود (من طبقة العرض) → يُربط بـ `Entity` الجديد عبر `SupplierProfile.entityId`.

```
Entity (معزول) ──profile.userId──▶ User (أمان P5)          [موجود]
SupplierProductOffering ──supplierId──▶ SupplierProfile      [موجود]
SupplierProfile ──entityId──▶ Entity                        [جديد — Additive]
```

---

## 5. حالات الاختبار المتفق عليها

| # | السيناريو | المسؤول |
|---|-----------|---------|
| T-1 | تسجيل دخول → إكمال بروفايل → `ENTITY-xxxxx` ينشأ ويرتبط بالجلسة | P3 + P1 |
| T-2 | بروفايل بلا جلسة → 401 | P1 (مؤكد) |
| T-3 | إعادة استدعاء sync → upsert آمن (لا تكرار) | P1 (إضافة قادمة) |
| T-4 | تسجيل مورد → sync-supplier يربط الـ Offering | P1 + P3 |

---

## 6. حالة التنفيذ

| البند | الحالة |
|-------|--------|
| `sync-entity-profile` API | ✅ جاهز (يقرأ الجلسة، يربط الـ Entity، لا ينشئ مستخدمين) |
| `sync-supplier` API | ✅ جاهز (يربط المورد بـ Entity) |
| العزل المعماري (بلا FK) | ✅ محفوظ |
| الـ Migration التحضيرية (`SupplierProfile.entityId`) | ✅ جاهزة (Additive) |
| بوابة الجودة (tsc/1275 test/build) | ✅ ناجحة |

> **التواصل:** هذا العقد جاهز للمبرمج 3 لبدء الربط فور اكتمال الواجهة. أي تغيير في توقيع الـ API يُبلّغ عبر تحديث هذا الملف.
