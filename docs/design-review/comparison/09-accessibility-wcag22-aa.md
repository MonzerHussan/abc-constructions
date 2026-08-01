# 09 — تقرير الامتثال WCAG 2.2 AA (Accessibility Compliance Report)

> حالة الواجهة الحالية + خطة الوصول إلى WCAG 2.2 AA خلال Sprint 1b. الهدف: **AA إلزامي**، وليست ميزة اختيارية.

## 1. الأطر والمبادئ

- **WCAG 2.2 AA** (معيار اللجنة) يشمل 2.1 AA + معايير جديدة: 2.5.7 Dragging، 2.5.8 Target Size (24px)، 3.3.7 Redundant Entry، 4.1.3 Status Messages.
- **التأكيد التلقائي:** axe-core (في Storybook 07) + `@axe-core/react` في التطبيق.
- **الفحص اليدوي:** المطلوب لـ 2.4.7 (Focus Visible) و2.5.8 و1.4.11 (Non-text Contrast) وRTL.

## 2. تقييم الحالة الحالية (من فحص الكود)

| المعيار | الوضع الحالي | ملاحظة فعلية |
|---|---|---|
| **1.4.3** Contrast (نص ≥4.5:1) | ⚠️ | `text-gray-500` على `bg-white` في مواضع عدة (KPI labels) قد يقل عن 4.5:1 — تحتاج مراجعة مع Tokens |
| **1.4.11** Non-text Contrast (مكونات ≥3:1) | ⚠️ | `border-gray-200`/`bg-gray-100` في بطاقات/أزرار قد يخالفان في عناصر غير نشطة (focus rings، borders حساسة) |
| **2.4.4** Link Purpose | ⚠️ | روابط كاملة البطاقات (`/marketplace` منتجات) نصها وصف عام — تُراجع |
| **2.4.7** Focus Visible | ⚠️ | أزرار/روابط كثيرة بلا `focus-visible` صريح — يعتمد Tailwind default (راجع) |
| **2.5.8** Target Size (24×24) | ⚠️ | LanguageSwitcher عنصر المثلث وعلامات X في الحقول؛ أزرار icon-only بحاجة `aria-label` + مقاس |
| **3.3.2** Labels & Instructions | ⚠️ | نماذج قديمة تعتمد placeholder أحياناً دون `<label>` — تُرحَّل عبر form kit |
| **3.3.1/3.3.3** Errors | ⚠️ | أخطاء النماذج تعتمد نصاً مخصصاً — توحيد error text + aria-describedby |
| **4.1.2** Name/Role/Value | ⚠️ | أزرار icon-only (تعديل/حذف) بلا aria-label في مواضع |
| **4.1.3** Status Messages | ⚠️ | إشعارات/Toast تُبنى بلا `role="status"/aria-live` |
| **RTL/اللغات** (`lang` + `dir` + خطوط) | ✅ | Shell سليم (Sprint 1): `html lang/dir` SSR صحيح، خطوط ثلاثية، LanguageSwitcher بسمات aria |
| **1.1.1** (Alt) | ⚠️ | شعارات lucide `decorative` (غالباً سليمة)؛ صور المنتج المستقبلية تحتاج alt |

## 3. خطة الوصول (خلال Sprint 1b — موجات 06)

| الموجة | إجراءات A11y |
|---|---|
| Theme Rollout | ضبط ألوان النص مقابل Tokens لتحقيق 1.4.3/1.4.11؛ إضافة `focus-visible` موحّد (ring brand) |
| مكوّنات البيانات | Tables بسمات `<caption>`/`scope`؛ Skeleton بـ `aria-hidden`؛ EmptyState نصي واضح |
| التنقل | Sidebar/Navbar: `aria-current` للرابط النشط، حالة مفتوحة/مغلقة بالقائمة، `aria-expanded`؛ LanguageSwitcher موجود |
| التعريب | التأكد من `lang`/`dir` في الـ iframes/أجزاء؛ اختبار RTL لاتجاه القراءة في الجداول (D11) |

## 4. متطلبات إلزامية تُدرج في Definition of Done

- [ ] **2.5.8** كل العناصر القابلة للنقر ≥24×24 بكسل.
- [ ] **2.4.7** `:focus-visible` ظاهر على كل أزرار/روابط/مدخلات.
- [ ] **3.3.2** كل حقول النماذج بـ `<label>` مقترن (`htmlFor`/`id`).
- [ ] **3.3.3** رسائل خطأ نصية تصف الخطأ + `aria-describedby`.
- [ ] **1.4.3** فحص axe: صفر أخطاء في صفحات Sprint 1b الأساسية.
- [ ] **4.1.3** كل إشعارات النجاح/الخطأ بـ `role="status"`/`alert`.
- [ ] **أيقونات اتجاهية:** الأيقونات الزخرفية `aria-hidden="true"`، والوظيفية تحمل نصاً.

## 5. إدارة القياس (Tooling)

| الأداة | الاستخدام |
|---|---|
| axe-core (addon-a11y) | Storybook: فحص كل مكوّن (07) |
| Lighthouse | فحص صفحات رئيسية في CI |
| Playwright + axe | اختبارات E2E لكل صفحة مرحَّلة في اللغات الثلاث |
| D11 matrix | يضيف البعد RTL/UR إلى الفحص (Nastaliq لا يتأثر باتجاه كروي لكنه قد يكسر ارتفاع الصفوف) |

## 6. المستندات المرتبطة

- `docs/product-experience/04-design-system-plan.md` §5.10 (معايير قبول A11y) و§5.11 (D11).
- `03-ux-analysis.md` (الثغرات U1–U6 المرتبطة بسهولة الاستخدام).
