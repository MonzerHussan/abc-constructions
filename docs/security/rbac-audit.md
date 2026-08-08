# تقرير تدقيق الصلاحيات الأمني — منصة ABC (Beta)

**التاريخ:** 2026-08-01  
**المراجع:** المبرمج 5 (حارس البوابة)  
**النطاق:** نظام الصلاحيات الحالي (10 أدوار `UserRole`، `UserOrganization` + `Role` + `Permission`) — **لا يشمل** الـ 133 فئة (مؤجَّلة لما بعد Beta بموجب قرار المدير).

---

## 1. الملخص التنفيذي

| المعيار | الحالة | الخطورة |
|---|---|---|
| المصادقة (Authentication) | ✅ مطبّقة عبر middleware + `auth()` في 218/246 endpoint | جيد |
| التفويض الخشن (logged-in فقط) | ✅ | جيد |
| **التفويض الدقيق (RBAC granular)** | 🔴 **معطّل تقريباً** — 3/246 endpoint فقط | **حرج** |
| حماية IDOR (ملكية المورد) | ⚠️ جزئية — محترمة في entity-registry، ناقصة في أغلب else | **عالية** |
| تصعيد الصلاحيات عند التسجيل | ✅ مغلق (`selfRegisterSchema` allowlist) | جيد |
| حماية مسارات `/admin` | ✅ middleware + ADMIN/SUPER_ADMIN check | جيد |

**الحكم:** النظام الحالي **آمن بما يكفي للـ Beta المحدود (مستخدمون أوائل تجريبيون تحت إشراف)** لكنه **ليس آمناً للنشر العام** دون معالجة النقاط الحرجة أدناه. التفويض الخشن (logged-in) جيد، لكن **التفويض الدقيق (RBAC) شبه معطّل** رغم وجود البنية التحتية الكاملة له في الـ schema والكود.

---

## 2. الثغرات والأخطار المكتشفة (مرتبة بالخطورة)

### 🔴 VULN-01: التفويض الدقيق (RBAC) معطّل في 99% من endpoints

**الوصف:** يوفر `src/lib/rbac.ts` الدوال `requirePermission()`, `hasPermission()`, `hasAnyPermission()` — لكن فحص فعلي لعدد endpoints يظهر:
- **246** نقطة API إجمالاً
- **218** يتحقق من وجود جلسة فقط (`session.user.id`)
- **3 فقط** تستدعي `requirePermission()`

**الأثر:** أي مستخدم مسجل (دور `OWNER` مثلاً) يستطيع استدعاء endpoints الكتابة/الحذف على موارد لا تخصه طالما الـ route لا يفحص الملكية. هذا يعني أن الـ "صلاحيات" في الـ schema (`Role`, `Permission`, `RolePermission`, `UserOrganization`) **(mostly)** بناء تحتية غير مستغلة في الإنتاج.

**مثال خطير:** endpoint كـ `DELETE /api/v1/procurement/rfqs/[id]` لا يفحص ما إذا كان الـ RFQ يخص المؤسسة/المستخدم الحالي — أي مالك مشروع يمكنه حذف RFQs لمشروع آخر.

**الإصلاح الموصى به (بدون توسعات — Beta hardening فقط):**
1. لكل endpoint كِتابة/حذف: أضِف `requirePermission('<key>')` أو فحص ملكية صريح.
2. لا ح لبناء RBAC ديناميكي جديد — البنية موجودة، فقط استدعها.

### 🔴 VULN-02: حماية IDOR ناقصة في أغلب endpoints

**الوصف:** فحصت `EntityRegistryService.syncSupplier` ووجدت فحص ملكية (`PROFILE_FORBIDDEN`) — ممتاز. لكن في endpoints المشتريات/المخزون/المالية، أغلب خدمات الـ Service layer لا تفحص ما إذا كان `userId` الجاري يملك الـ `organizationId`/السجل المستهدف.

**الأثر:** مستخدم "أ" يقرأ/يعدّل سجلات مستخدم "ب" عبر تمرير `id` عشوائي في الـ URL.

**الإصلاح الموصى به:** لكل service method تتلقى `entityId`/`rfqId`/`poId`:
- جلب السجل (بما يشمل `organizationId`/`createdById`)
- فحص `session.user.id` ينتمي لنفس المؤسسة أو يملك `permission` مناسبة
- رفض بـ 403 إن لم يتحقق

### 🟠 VULN-03: `any` في `src/lib/rbac.ts` ( TD )

**الوصف:** line 5: `const membershipWhere: any = { userId, isActive: true }`.

**الأثر:** ضعف سلامة الأنواع؛ أخطاء وقت التشغيل غير مكتشفة.

**الإصلاح:** استبدال بنوع Prisma المُولّد: `Prisma.UserOrganizationWhereInput`.

### 🟠 VULN-04: `requirePermission` bypass للمدير — توثيق وتحديد

**الوصف:** `rbac.ts` line 43: `if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return { allowed: true }`.

**الأثر:** ADMIN/SUPER_ADMIN يتجاوزون فحص الصلاحية بالكامل. **مقبول** للإدارة، لكن:
- يجب أن يُوثَّق صراحة في كل endpoint إداري
- يجب ألا يُسمح لأي route بكتابة بيانات أعمال عبر هذا الـ bypass إلا للسجل المحدد

**الإصلاح الموصى به:** لا تغيير كود — فقط توثيق في `docs/security/rbac-admin-bypass.md` (يمكنني إنشاؤه لاحقاً).

### 🟡 VULN-05: غياب فحص `organizationId` صريح في `requirePermission`

**الوصف:** `requirePermission(permissionKey, organizationId?)` يمرر `organizationId` اختيارياً. الـ 3 endpoints التي تستدعيه **لا تمرّر** `organizationId` — فيُفحص عبر كل مؤسسات المستخدم.

**الأثر:** مستخدم عضو في مؤسستين يحصل على صلاحية من أي منهما ويطبّقها على موارد المؤسسة الأخرى. هذا قد يكون مقصوداً (cross-org admin) لكنه خطر إن لم يكن.

**الإصلاح الموصى به:** تمرير `organizationId` الصريح من الـ request (header أو body) وفحصه في كل endpoint متعدد المؤسسات.

---

## 3. ما هو آمن (مؤكَّد)

| النقطة | الدليل |
|---|---|
| التصعيد عند التسجيل | ✅ `selfRegisterSchema` يقبل 8 أدوار أعمال فقط، يرفض ADMIN/SUPER_ADMIN |
| المسارات `/admin` | ✅ middleware يفحص role ADMIN/SUPER_ADMIN |
| endpoints الـ seed | ✅ محمية (production disabled + admin) |
| رفع الملفات | ✅ magic bytes + حد حجم + اسم عشوائي + فحص ملكية session |
| الجلسات | ✅ 7 أيام +isActive check + rate limit على المحاولة |
| Entity Registry `syncSupplier` | ✅ فحص ملكية `PROFILE_FORBIDDEN` |

---

## 4. خلاصة المσιμοποι الحالي `src/lib/rbac.ts`

يوفر:
- `getUserPermissions(userId, organizationId?)` → قائمة `permission.key`
- `hasPermission(userId, key, orgId?)` → boolean
- `hasAnyPermission(userId, keys[], orgId?)` → boolean
- `requirePermission(key, orgId?)` → `{ allowed, error, status, userId }`
- `getUserOrganizations(userId)` → قائمة العضوية
- `getEffectiveOrgId(userId)` → المؤسسة الأساسية

**البنية التحتية كاملة وصحيحة.** المشكلة ليست في غياب RBAC، بل في **عدم استدعائه** عبر الـ route handlers.

---

## 5. التوصيات (ضمن نطاق Beta hardening — لا توسعات)

| الأولوية | الإجراء | الذنب |
|---|---|---|
| P0 | إضافة فحص ملكية `userId/organizationId` في endpoints الكتابة/الحذف (procurement, inventory, financial) | VULN-02 |
| P1 | استدعاء `requirePermission()` في endpoints الـ 215 المتبقية (لا ح لبناء جديد — استدعاء فقط) | VULN-01 |
| P1 | تمرير `organizationId` صريح في endpoints متعددة المؤسسات | VULN-05 |
| P2 | إزالة `any` في `rbac.ts` واستبدال بنوع Prisma | VULN-03 |
| P2 | توثيق قاعدة الـ ADMIN bypass | VULN-04 |

> **ملاحظة مهمة:** هذه الإصلاحات **لا تتطلب** بناء نظام 133 فئة. هي فقط استدعاء البنية الموجودة. القيام بها البته ضمن نطاق "تثبيت الأمان قبل Beta العام" — لا توسعات معمارية.

---

## 6. حكم حارس البوابة

```
🔴 لا يجوز فتح Beta للمستخدمين العامين دون معالجة VULN-01 و VULN-02
✅ يجوز proceeding مع Beta المحدود (مستخدمون تجريبيون قلائل تحت إشراف، NDA)
```

**التوصية:** عالِج VULN-01 و VULN-02 كأولوية P0 قبل أي إعلان عام للـ Beta. لا ح لبناء نظام صلاحيات ديناميكي — استدعِ فقط الـ RBAC الموجود في `src/lib/rbac.ts`.

---

## 7. المراجع

- `src/lib/rbac.ts` (67 سطر) — البنية التحتية RBAC
- `src/middleware.ts` (92 سطر) — حماية المسارات + ADMIN check
- `src/modules/core/validators/user-schemas.ts` — allowlist أدوار التسجيل
- `docs/security/security-audit.md` — التدقيق الأمني السابق
- `docs/technical-debt.md` TD-14 — مراجعة IDOR الشاملة (موجودة سابقاً)
- `prisma/schema.prisma` models: `User`, `UserOrganization`, `Role`, `Permission`, `RolePermission`