# 03 — تحليل تجربة الاستخدام (UX Analysis)

> تحليل مقارن لمبادئ UX بين الواجهة الحالية والـ Pack، وفق متطلبات UX Architecture v1.1 (`docs/product-experience/01-ux-architecture.md`).

## 1. التدفقات الرئيسية (من flows.html)

| التدفق | الحالية | الـ Pack | الفجوة |
|---|---|---|---|
| المقاول: Project → BOQ → RFQ → مقارنة عروض | مسار موجود، تجزئة عبر `/projects`, `/tenders/materials`, `/procurement/rfqs` | تدفق متصل بصرياً في 02 | الحالية مفككة بين وحدات؛ الـ Pack يوحّد سياق العرض |
| المورد: Profile → Products → Inventory → RFQs → Analytics | جزئي (marketplace) | متكامل في 03 | منتجات/مخزون غير ممثلة كشاشات كاملة |
| القوى العاملة: Skills → Jobs → Training → Certificates | jobs/training منفصلة | متكامل في 05 | ربط المهارات بالوظائف غير واضح في الحالية |
| المصنع: Product Master → موزع → عرض سعر → سوق → شراء | غائب كلياً | متكامل في 07 | **بناء جديد** |
| الإدارة: Overview → Verifications → KPIs | موجود (admin) | نموذج واحد (06) | بقية الـ admin غير مغطاة نمطياً |

## 2. التوطين الثلاثي والاتساق اللغوي

- **Shell (الحالية):** `html[lang]/dir` صحيحان من الكوكي؛ الخطوط تُقلَّب عبر `--font-active`؛ LanguageSwitcher 3 خيارات. ✅
- **الصفحات (الحالية):** ternaries مضمّنة: `language === "ar" ? "..." : language === "ur" ? "..." : "..."` (مثال `/procurement/page.tsx:48,82`). المشكلتان:
  1. **D10** يحظر ternaries — القاموس وحده مصدر النصوص (translations.ts + glossary.md).
  2. **R3 (أردية كاملة)** تُنتهك: أقسام Quick Actions في `/procurement/page.tsx:87-90` ترجِمت عربي/English فقط (أردية مفقودة) — سيظهر نص إنجليزي في سياق أردية.
- **الـ Pack:** يفترض قاموساً فقط (§8.0) وتطابقاً كاملاً.

## 3. RTL والمرآة

- **الأيقونات الاتجاهية:** الحالية تثبّت `ArrowLeft` في هيرو البداية و`ArrowRight` في Quick Actions (procurement) — **لا تنعكس** بين RTL/LTR. الـ Pack يوفّر `[dir="ltr"] .flip { transform: scaleX(-1) }` واستخدام Logical Properties.
- **الكتابة القياسية:** الحالية تعتمد `pl-*/pr-*/ml-*/mr-*` في مواضع عديدة؛ الـ Pack يستخدم `padding-inline/end` (راجع 02 من الحالية: `space-y` سليمة لكن `gap` و`ml` موجودة في أجزاء).
- **D11 (مصفوفة اختبار RTL):** تُطبَّق على كل الصفحات: `ar→rtl`, `en→ltr`, `ur→rtl`, + أرقام ur-PK، + فحص تجاوز نصوص Nastaliq في الجداول.

## 4. المحتوى والحالات الفارغة والحمل

| الجانب | الحالية | الـ Pack |
|---|---|---|
| حالة التحميل | نص فقط `{t("loading")}` | Skeleton مكوّن (ui kit) |
| حالة فارغة | جزئية (EmptyState موجود) | EmptyState موحّد |
| أخطاء النماذج | اعتماد المتصفح/يدوي | أخطاء موحّدة ضمن form kit |
| حالات Status (معلّق/معتمد/مرفوض) | StatusBadge موجود | StatusBadge موحّد (tokens success/warning/danger/info) |

## 5. التصفح والهيكل

- **Navbar الحالية:** sticky، بيضاء، Logical Properties في Sprint 1 (end-0/end-1)، LanguageSwitcher مضمن. لكن **لا Sidebar** للأدوار — الـ Pack يعتمد Sidebar داكن (Navy) للبوابات مع Topbar فاتح. هذا **اختلاف هيكلي رئيسي** يجب أن يُقَرَّر صراحةً (G1): هل نتبنى Sidebar للمساحات الداخلية أم نبقي Navbar أعلى الشاشة؟
- **Breadcrumbs:** موجودة في الحالية (marketplace، materials) — تُوحَّد عبر kit.

## 6. ملخص الثغرات الحاسمة (تعالج في Sprint 1b)

| # | الثغرة | المرجع | الخطورة |
|---|---|---|---|
| U1 | ternaries مضمّنة تنتهك D10 | §2 أعلاه، D10 | عالية |
| U2 | أردية ناقصة في بعض السلاسل | §2 أعلاه، R3 | عالية |
| U3 | أيقونات اتجاهية غير مرآة | §3 | متوسطة |
| U4 | حالة تحميل نصية بلا skeleton | §4 | منخفضة-متوسطة |
| U5 | هيكل تنقّل غير محسوم (Sidebar vs Topbar) | §5 | **قرار G1** |
| U6 | خلط ألوان CTA في نفس السياق | 02 (materials green CTA) | متوسطة |

## 7. توصية UX

- اعتماد **مكوّنات الـ Pack + هيكل التنقل الذي يقرره الفريق في G1**، مع إبقاء وظائف الشاشات الحالية.
- ترحيل النصوص من ternaries إلى translations.ts (يعتمد `useLanguage` فقط) قبل أي عمل بصري — يقلل فرص انحراف التعريب.
- تشغيل **D11 matrix** كبوابة جودة لكل صفحة مرحلة.
