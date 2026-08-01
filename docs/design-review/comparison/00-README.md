# المراجعة النهائية — المقارنة قبل الاعتماد (Final Comparison Before Approval)

> مرحلة **مستندات فقط — بلا تنفيذ ولا إعادة تصميم.** هذه المستندات تقارن بين الواجهة الحالية (`src/`) وDesign Review Pack (`docs/design-review/`) وتبني قرار الاعتماد، مع تجهيز الـ deliverables الخمسة لجاهزية التنفيذ بعد الموافقة.

## الغرض

- إصدار قرار صريح ومبنيّ على تحليل: **الإبقاء / التبني الكامل / الدمج (Hybrid)**.
- إثبات أن الـ UI الجديد يحقق المتطلبات المعتمدة R1–R6 والتصميم الثلاثي AR/EN/UR، أو كشف الفجوات قبل الاعتماد.
- تجهيز وثائق التنفيذ (Storybook · Theme · A11y · Responsive · Motion) بحيث يبدأ **Sprint 1b — Platform-wide UI Application** فور الاعتماد دون فجوات قرار.

## بوابات الاعتماد (Approval Gates)

| البوابة | الشرط | المسؤول |
|---|---|---|
| **G1** | مراجعة مستندات المقارنة 01–06 والتصويت (تبنٍّ/دمج/إبقاء) | فريق المنتج |
| **G2** | مراجعة deliverables 07–11 (جاهزية التنفيذ) والتصويت | فريق المنتج + التقني |
| **G3** | سحب الموافقة النهائية = إشارة البدء **Sprint 1b — Platform-wide UI Application** | مدير المشروع |

> لا يبدأ أي تطبيق واسع للـ UI Kit على صفحات `src/` قبل اجتياز G1+G2 وموافقة G3.

## المستندات

| # | المستند | المحتوى |
|---|---|---|
| 01 | [executive-comparison.md](01-executive-comparison.md) | التقرير التنفيذي + مصفوفة القرارات العليا |
| 02 | [page-by-page-comparison.md](02-page-by-page-comparison.md) | مصفوفة صفحة-بصفحة (الصفحة الحالية ↔ المقترح) |
| 03 | [ux-analysis.md](03-ux-analysis.md) | تحليل تجربة الاستخدام (التدفقات، المحتوى، RTL، الأخطاء) |
| 04 | [visual-design-analysis.md](04-visual-design-analysis.md) | التحليل البصري (Tokens، Typography، المكونات، الاتساق) |
| 05 | [product-vision-alignment.md](05-product-vision-alignment.md) | مواءمة الرؤية (R1–R6، D9–D11، رحلة الشركة B2B) |
| 06 | [final-recommendation.md](06-final-recommendation.md) | التوصية النهائية + نطاق Sprint 1b |
| 07 | [storybook-setup.md](07-storybook-setup.md) | إعداد Storybook لـ UI Kit |
| 08 | [theme-architecture.md](08-theme-architecture.md) | معمارية الـ Theme والـ Tokens في Next.js/Tailwind |
| 09 | [accessibility-wcag22-aa.md](09-accessibility-wcag22-aa.md) | تقرير الامتثال WCAG 2.2 AA |
| 10 | [responsive-layout-spec.md](10-responsive-layout-spec.md) | مواصفة التخطيط المتجاوب (Breakpoints، Navigation، Tables) |
| 11 | [motion-interaction-guidelines.md](11-motion-interaction-guidelines.md) | إرشادات الحركة والتفاعل |

## حقائق تأسيسية (مؤكَّدة من الكود، يوليو 2026)

- **الحالية (`src/`):** Shell مبني في Sprint 1 (خطوط ثلاثية، Tokens، LanguageSwitcher، Route Protection، UI Kit foundation) — لكن **صفحات الأعمال (Pages) ما زالت** بميول Tailwind يدوية hardcoded: `gray-*`, `bg-blue-500`, `bg-green-500`, ternaries الترجمة المضمّنة، وأيقونات اتجاهية غير مقلوبة (`ArrowLeft`/`ArrowRight`).
- **المقترح (`docs/design-review/`):** هوية Amber+Navy كاملة، 8 بوابات (7 أدوار + إدارة)، مكتبة مكونات، Logical Properties، معاينة جوال 390px.
- **المتطلبات:** R1–R6 (واجهات كاملة AR/EN/UR)، D9 (Nastaliq)، D10 (لا ternaries — قاموس فقط)، D11 (مصفوفة اختبار RTL).

## تحديث الحالة (بعد تنفيذ تحسين الهوية v2)

> أُنجز خارج سير عمل المقارنة — توثيق كامل في [identity-v2.md](../identity-v2.md).

- **الشعار v2** (ABC داخل ثلاثة مبانٍ) + App Icon/Favicon + Navbar/Auth — **منفَّذ**.
- **توحيد الألوان**: تحويل `gray→surface`, `blue→info`, `green→success`, `red→danger`, `yellow→warning`, `orange→amber`, `purple/indigo/violet/fuchsia→flagship`, `sky/cyan→info`, `rose/pink→danger`, `lime→warning` عبر 77 ملف. **`emerald/teal` مُبقاة كألوان وحدة (Delivery/Jobs)**.
- **قاعدة CTA** (أحادي amber primary / navy secondary) طُبّقت في `/procurement`, `/tenders/materials`, `/procurement/rfqs`.
- **ما زال معلّقاً من 06:** Sidebar قرار (Q1)، ترحيل ternaries → القاموس (D10/R3)، مرآة الأيقونات الاتجاهية، Skeleton في كل الحمّولات، نطاق Sprint 1b الكامل (Storybook، A11y، RTL matrix) — بانتظار قرارات G1/G2/G3.

## نطاق مستبعد من هذه المرحلة

- أي تعديل كودي على `src/` (قرار G3 يفتحه).
- ملفات `admin/*` و`research/*` وأخطاء eslint `any` السابقة للوجود — تُميَّز في التنفيذ ولا تُحل هنا.
- استلام الشعار الرسمي (يظل placeholder حتى وصول SVG من العميل).
