# الديون التقنية — منصة ABC (Beta)

**التاريخ:** 2026-08-01  
**الغرض:** تسجيل جميع الديون التقنية الحالية مع الوصف والأثر والأولوية والإجراء الموصى به، لضمان معالجتها بشكل منهجي خلال فترة Beta.

---

## 1. ديون ESLint الموروثة

### TD-01: أخطاء `@typescript-eslint/no-explicit-any` (≈186 خطأ)

- **Description:** استخدام واسع لنوع `any` في الكود الموروث (خدمات، صفحات، مكونات) — أغلب أخطاء lint الـ 208.
- **Impact:** ضعف سلامة الأنواع؛ أخطاء وقت التشغيل غير مكتشفة في وقت البناء؛ صعوبة إعادة البناء الآمنة.
- **Priority:** HIGH (بعد Beta مباشرة)
- **Recommended Action:** جلسات تصفير أخطاء `no-explicit-any` بالتدريج (ملف بملف) مع اختبارات قائمة كشبكة أمان؛ تفعيل القاعدة بشكل صارم للملفات الجديدة فقط.

### TD-02: تحذيرات `react-hooks/exhaustive-deps` + unused imports/vars (≈280 warning)

- **Description:** تحذيرات متعددة: مفاتيح useEffect ناقصة، استيرادات/متغيرات غير مستخدمة (أيقونات lucide، متغيرات سياق مثل `language`, `lng`, `session`).
- **Impact:** مخاطر أخطاء مزامنة الواجهة (stale closures)؛ كود ميت يضخّم الحجم ويُربك القراءة.
- **Priority:** MEDIUM
- **Recommended Action:** إزالة الاستيرادات غير المستخدمة آلياً (`eslint --fix`)؛ إصلاح exhaustive-deps يدوياً للمكونات النشطة؛ ضبط قاعدة `no-unused-vars` مع تجاهل أسماء `_`.

### TD-03: مخالفات `@next/next` / React المتبقية (نحو 20–30)

- **Description:** بعض تحذيرات Next/React (استخدام صور بدون next/image، أخطاء `next` مبعثرة، قواعد `react/...`).
- **Impact:** أداء تحميل صور دون المستوى؛ عدم اتساق مع أفضل الممارسات.
- **Priority:** LOW
- **Recommended Action:** معالجة فورية لما يتعلق بالصور (تحويل `<img>` إلى `next/image`)؛ الباقي ضمن تنظيف شامل.

---

## 2. اختبارات تحتاج توسعة لاحقاً

### TD-04: لا اختبارات لمكوّنات الواجهة (React/UI)

- **Description:** التغطية تغطي الخدمات (modules) فقط؛ لا اختبارات لمكونات React (نماذج التسجيل، الدخول، RFQ، لوحات الإدارة) أو تفاعلات واجهة.
- **Impact:** أخطاء UI غير مكتشفة؛ الهجمات على النماذج/التحقق العميل غير مغطاة.
- **Priority:** HIGH (بعد Beta)
- **Recommended Action:** إضافة Vitest + @testing-library/react + jsdom؛ اختبار مكوّنات حرجة (login, register, RFQ form, رفع الملفات).

### TD-05: اختبارات DB حقيقية (Integration layer)

- **Description:** اختبارات التكامل الحالية (buyer/supplier flow) تعتمد على mocks؛ لا توجد اختبارات ضد PostgreSQL حقيقي (إلا E2E).
- **Impact:** انحراف سلوكي بين Prisma الحقيقي والـ mocks (علاقات، constraints، transactions).
- **Priority:** MEDIUM
- **Recommended Action:** إنشاء `tests/db/` مع قاعدة اختبار (Testcontainers أو DB محلية) تُهيأ عبر migrations واختبار حالات حرجة (تزامن، قيود فريدة، معاملات).

### TD-06: تغطية المصادقة (Auth.js / MFA) محدودة

- **Description:** اختبارات MFA والجلسات تُغطى جزئياً عبر وحدة rate-limit/security؛ لا اختبار E2E كامل لدخول OTP أو جلسة 7 أيام.
- **Impact:** ثغرات تدفق OTP/جلسة غير مكتشفة.
- **Priority:** MEDIUM
- **Recommended Action:** إضافة E2E لمصادقة OTP (مع توليد رمز قابل للتنبؤ في بيئة الاختبار) والتحقق من انتهاء الجلسة.

### TD-07: معمارية فروع تدفقات نادرة (award, cancel, close)

- **Description:** اختبارات RFQ/Quotation تغطي المسار السعيد؛ انتقالات نادرة (إلغاء، إغلاق، رفض عرض) غير مشمولة.
- **Impact:** أخطاء في الحالات الحدّية أثناء الاستخدام الفعلي.
- **Priority:** LOW
- **Recommended Action:** إضافة حالات اختبار لكل انتقال state machine غير مغطى (بنية workflow تسمح بالتعداد).

---

## 3. تحسينات الأداء المؤجلة

### TD-08: N+1 queries في قوائم RFQ/العروض/المنتجات

- **Description:** استعلامات قائمة قد تجلب علاقات متعددة دون `include` مضبوط، مخاطر N+1.
- **Impact:** تباطؤ متدرج مع نمو البيانات؛ TTFB مرتفع على لوحات القوائم.
- **Priority:** HIGH (مؤجلة حتى بيانات Beta حقيقية لقياس الأثر)
- **Recommended Action:** تفعيل Prisma query logging في staging؛ قياس الاستعلامات البطيئة؛ تحويلها إلى `include`/`select` صريحة أو استعلامات مجمّعة.

### TD-09: غياب فهارس (Indexes) على الحقول الحرجة

- **Description:** لا فهارس مركبة على حقول الاستعلام الشائعة: `status`, `supplierId`, `productId`, `organizationId`, `createdAt`, `deadlineDate`.
- **Impact:** مسح جدول كامل عند تصفية/فرز القوائم مع نمو الحجم.
- **Priority:** MEDIUM
- **Recommended Action:** إضافة فهارس مركبة ضمن migration قادمة بناءً على EXPLAIN ANALYZE الفعلي.

### TD-10: حجم bundle للواجهات الإدارية

- **Description:** صفحات `/admin` تستورد react-query وleaflet (خرائط) داخل الواجهة دون تحميل كسول مضمون.
- **Impact:** أول تحميل أثقل؛ LCP مرتفع على صفحات خريطة/إدارة.
- **Priority:** MEDIUM
- **Recommended Action:** `next/dynamic` لـ leaflet والخرائط والمكونات الثقيلة؛ تقرير bundle عبر `next build` لقياس التقدم.

### TD-11: نقل الملفات المرفوعة إلى تخزين كائنات

- **Description:** الملفات تُخزن في `public/uploads` على القرص المحلي؛ نمو غير محدود + تعقيد في البيئات المتعددة/المُدارة.
- **Impact:** امتلاء قرص؛ فقدان الملفات عند إعادة النشر؛ لا CDN.
- **Priority:** MEDIUM (مؤجلة؛ مقبولة في مرحلة الاستخدام الصغير)
- **Recommended Action:** نقل إلى S3/R2 (R2 وS3) مع توليد URL موقّع؛ ضغط صور عبر Next Image/`sharp`.

### TD-12: Rate limiter في الذاكرة

- **Description:** `src/lib/rate-limit.ts` عدّادات في ذاكرة العقدة الواحدة؛ تُصفَّر عند إعادة التشغيل ولا تُشارك بين نسخ متعددة.
- **Impact:** غير كافٍ عند التوسع الأفقي أو إعادة النشر المتكررة.
- **Priority:** MEDIUM
- **Recommended Action:** نقل إلى Redis (حقول `INCR`+`EXPIRE`) عند اعتماد أكثر من عقدة أو لضمان استمرارية.

---

## 4. ديون عملياتية / بنية بيانات

### TD-13: ضعف المطابقة بين migrations و schema (137 جدولاً / 5 migrations)

- **Description:** يوجد 5 migrations فقط مقابل 137 نموذجاً؛ drift قائم بين قاعدة البيانات الحية وملفات migrations.
- **Impact:** خطورة على النشر الآلي لبيئات جديدة وتكرار الإعدادات.
- **Priority:** HIGH
- **Recommended Action:** تعميم baseline `prisma/baseline/0_baseline.sql` للنسخ الجديدة (موثّق في deployment-guide)؛ ومزامنة migrations مستقبلاً (كل تغيير بمهاجرة جديدة).

### TD-14: غياب مراجعة IDOR شاملة لكل نقاط API

- **Description:** التحقق من الملكية موجود في خدمات رئيسية (RFQ/Quotation/Profile) لكن لا يوجد تدقيق نظامي لجميع النقاط.
- **Impact:** إمكانية وصول غير مصرح لسجلات مستخدمين آخرين في نقاط غير مفحوصة.
- **Priority:** HIGH (جولة ما بعد Beta)
- **Recommended Action:** جرد كل route handler، التحقق من وجود تحقق ملكية/صلاحية، واختبار IDOR آلي لكل نقطة (مستخدم أ يقرأ مورد مستخدم ب).

---

## 5. أولويات التنفيذ المقترحة

| الأولوية | العناصر | التوقيت |
|---|---|---|
| P0 | TD-13 (baseline/migrations) + TD-14 (IDOR) | أول أسبوعين من Beta |
| P1 | TD-01 (any) + TD-04 (اختبارات UI) | أول شهر |
| P2 | TD-02 (warnings) + TD-08/09 (أداء DB) | خلال الشهر الأول |
| P3 | TD-03, TD-05, TD-06, TD-07, TD-10, TD-11, TD-12 | تدريجياً |
