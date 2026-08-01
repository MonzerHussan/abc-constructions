# خطة نظام التصميم — Design System Plan

**الإصدار:** 1.0
**الحالة:** ✅ معتمدة — مرجع رسمي (Sprint 0)
**تاريخ الاعتماد:** 31 يوليو 2026
**المرجع:** `03-frontend-architecture.md` · Tailwind CSS 4 (CSS-first) · globals.css الحالي

---

## 1. الهدف

نظام تصميم موحّد قابل للبناء التدريجي فوق البنية الحالية (Tailwind 4 CSS-first مع CSS Variables)، يوفر:

- **Tokens** موحّدة (لون/خط/تباعد/زوايا/ظلال) تُعبر عن هوية ABC (العنبر + الأزرق الداكن).
- **UI Kit** من مكونات أساسية (Button, Input, Select, Table, Badge, Modal, Toast...) بدون منطق أعمال.
- **أنماط (Patterns)** جاهزة للاستخدام المتكرر (DataTable، Forms، Status، Dashboards، EmptyStates).
- **دعم RTL/LTR** وثلاثية اللغات (العربية RTL · الإنجليزية LTR · الأردية RTL) كجزء من البنية لا كإضافة. **الأردية لغة معتمدة رسمياً (v1.1)**.

**قاعدة الجودة:** كل مكوّن يمر بثلاث طبقات: Props API موثقة → Tokens → A11y AA.

---

## 2. بنية الـ Tokens (Design Tokens)

### 2.1 النهج الفني (Tailwind 4 CSS-first)

تُعرّف في `globals.css` عبر `@theme` (الموجود) مع توسعة:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand-50:  #fffbeb;
  --color-brand-100: #fef3c7;
  --color-brand-500: #f59e0b;   /* العنبر — الأساسي */
  --color-brand-600: #d97706;
  --color-brand-700: #b45309;

  --color-navy-600: #1e3a5f;    /* الكحلي — الثانوي (من gradient-hero) */
  --color-navy-800: #0f172a;
  --color-navy-900: #0a1128;

  --color-surface-0: #ffffff;
  --color-surface-50: #f8f9fa;  /* الخلفية */
  --color-surface-100: #f1f3f5;
  --color-surface-200: #e9ecef;
  --color-surface-300: #dee2e6;
  --color-surface-400: #ced4da;
  --color-surface-500: #adb5bd;
  --color-surface-600: #6c757d;
  --color-surface-700: #495057;
  --color-surface-800: #343a40;
  --color-surface-900: #212529;

  /* Semantic */
  --color-success-500: #16a34a;
  --color-warning-500: #f59e0b;
  --color-danger-500:  #dc2626;
  --color-info-500:    #2563eb;

  /* Typography */
  --font-sans: "Cairo", "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif;
  --font-latin: "Geist", "Segoe UI", Arial, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Motion */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
}
```

### 2.2 الحالات الدلالية (Semantic Status Colors) — موحدة مع Status system

| الحالة | Token | أمثلة الاستخدام |
|---|---|---|
| نجاح / موثوق | `--color-success-*` | VERIFIED، COMPLETED، ACCEPTED، IN_STOCK |
| تحذير / معلق | `--color-warning-*` | PENDING، BASIC، LOW_STOCK، ON_HOLD |
| خطر / رفض | `--color-danger-*` | REJECTED، SUSPENDED، CANCELLED، OUT_OF_STOCK |
| معلومة | `--color-info-*` | إشعارات، نصائح، متطلبات |
| محايد | `surface-*` | DRAFT، PLANNING |

### 2.3 مستويات التحقق (من ADR-018) — خريطة لون ثابتة

| المستوى | اللون |
|---|---|
| UNVERIFIED | رمادي `surface-400` |
| BASIC | أزرق `info-500` |
| VERIFIED | أخضر `success-500` |
| TRUSTED | ذهبي `brand-500` |
| FLAGSHIP | بنفسجي `#7c3aed` (token `--color-flagship-500`) |

---

## 3. الطباعة (Typography)

### 3.1 استراتيجية الخطوط

| السياق | الخط | ملاحظة |
|---|---|---|
| العربية (الواجهة الأساسية) | **Cairo** أو **IBM Plex Sans Arabic** (وزن 400/600/700/800) | يفضَّل IBM Plex للتباين، Cairo للوضوح العملي |
| اللاتينية | Geist (موجود) أو Inter | خط sans حديث |
| الأردية (Nastaliq) | **Noto Nastaliq Urdu** (عناوين/محتوى) أو **Jameel Noori Nastaleeq** (عرض) | script Nastaliq ≠ Naskh؛ `line-height ≥ 1.7`، لا `letter-spacing`. fallback: خط العربي Naskh. القرار النهائي D9 |
| أرقام/كواد/جدول | Geist Mono | SKU، RFQ-001، كميات |

> **إصلاح مطلوب:** حالياً `body` يفرض `Segoe UI` فيتجاوز Geist. نعتمد خطة: `font-sans` يُدار بالمتغير `--font-sans` ويُستبدل ديناميكياً حسب اللغة (عربي/لاتيني/أردية) من `next/font` — متطلب أساسي لدعم الأردية.

### 3.2 مقياس النوع (Type Scale)

| الرمز | الحجم/السطر | الاستخدام |
|---|---|---|
| display-lg | 40px / 1.2 | صفحات الهبوط |
| display | 32px / 1.25 | عناوين البوابات |
| heading-xl | 24px / 1.3 | عناوين صفحات |
| heading-lg | 20px / 1.35 | عناوين أقسام |
| heading | 16px / 1.4 | عناوين بطاقات |
| body | 14px / 1.6 | النص العام (إفتراضي) |
| body-sm | 13px / 1.5 | تفاصيل، مساعدة |
| caption | 12px / 1.4 | تسميات، أرقام صغيرة |
| numeric | tabular-nums | جداول، كميات، أسعار |

**ملاحظات عربية:**
- ارتفاع سطر أعلى (1.5–1.6) للعربية لعلامات التشكيل والنقاط.
- لا `letter-spacing` في العربية إطلاقاً.
- `font-feature-settings` تبقى افتراضية (لا "frac"/"tnum" على النص العربي).

---

## 4. الألوان (Color System)

| الدور | المعنى |
|---|---|
| **Brand (عنبر/ذهبي)** | CTA، عناصر نشطة، لوغو، مميزات دفع/نمو |
| **Navy (كحلي داكن)** | خلفيات الهيرو، Sidebar للبوابات، عناوين النصوص الرئيسية |
| **Neutral (رمادي)** | سطوح، حدود، نصوص ثانوية |
| **Semantic** | حالة النظام (موفّق/محذّر/خطأ/معلومة) |

**قواعد الاستخدام:**
- زر أساسي واحد فقط في الشاشة (CTA) بلون Brand.
- لا خلط أزرق/عنبر في نفس السياق (يوجد حالياً `bg-blue-500` في صفحات procurement — يُوحَّد).
- التباين: النص على Surface يكون `surface-800/900`، النص على Brand يكون أبيض/داكن حسب الحالة (AA).
- **Dark Mode:** تُعرَّف النواة عبر `light-dark()` أو `[data-theme]` لاحقاً (P1) — التصميم يبدأ Light مع جاهزية التبديل.

---

## 5. المكونات (UI Kit)

### 5.1 الأزرار (Buttons)

```
Button.variant = primary | secondary | outline | ghost | danger | success | link
Button.size   = sm | md | lg | icon
```

| الحالة | التصميم |
|---|---|
| `primary` | `bg-brand-500 text-white hover:bg-brand-600` |
| `secondary` | `bg-navy-800 text-white hover:bg-navy-900` |
| `outline` | `border border-surface-300 text-surface-700 hover:bg-surface-50` |
| `ghost` | `text-surface-700 hover:bg-surface-100` |
| `danger` | `bg-danger-500 text-white hover:bg-danger-600` |
| `link` | `text-brand-600 underline-offset-4 hover:underline` |

- **تحميل:** خاصية `loading` تُبدّل النص بـ Spinner صغير مع تعطيل الزر.
- **أيقونة:** دعم `startIcon/endIcon` حسب الاتجاه (Logical).
- **أزرار أيقونة فقط:** `size="icon"` مع `aria-label` إلزامي.

### 5.2 النماذج (Forms)

| المكوّن | المواصفات |
|---|---|
| Input | `h-10 rounded-md border-surface-300 focus:ring-brand-500 focus:border-brand-500` |
| Select | نفس بنية Input مع سهم اتصالي |
| Textarea | `min-h-[96px]` مع عدّاد أحرف اختياري |
| Checkbox / Radio | `accent-brand-500` + تكبير منطقة اللمس (32px) |
| Switch | بنية Radix Switch، ألوان Brand |
| DatePicker | نص عربي/لاتيني حسب اللغة، `dd/mm/yyyy` + تقويم |
| FileUpload | منطقة إسقاط مع قائمة ملفات وحالة (رفع/فشل) |
| SearchInput | أيقونة بداية + زر مسح |
| Combobox/ASYNC | بحث عن مورّد/منتج (React-Query driven) |

**حالة التحقق (Validation):**
- خطأ: `border-danger-500` + رسالة `text-danger-600 text-sm` موصولة بـ `aria-describedby`.
- نجاح: `border-success-500` + علامة اختيار اختيارية.
- تعطيل: `disabled:opacity-50 disabled:cursor-not-allowed`.

**بنية النموذج (Form Layout):**
- `FormField` = `label + control + hint/error` (نمط موحّد).
- الحقول بتخطيط `grid grid-cols-1 md:grid-cols-2`، الحقول الواسعة `col-span-2`.
- أزرار الإرسال: أساسي في `end` + زر إلغاء `secondary`.

### 5.3 البطاقات (Cards)

| النوع | الاستخدام | المواصفات |
|---|---|---|
| Card (أساسية) | حاويات عامة | `bg-surface-0 rounded-xl border border-surface-200 shadow-sm` |
| Card-hover | قوائم قابلة للنقر | + `hover:shadow-md hover:-translate-y-0.5 transition` |
| ProductCard | سوق | صورة 16:9 + شارة تحقق + سعر + وحدة + حالة مخزون + زر CTA |
| SupplierCard | ملفات الموردين | لوغو + اسم + مستوى تحقق + تقييم + مناطق |
| StatCard | لوحات KPI | أيقونة + قيمة كبيرة + اتجاه + سهم صعود/هبوط |
| ProfileCard | حسابات | صورة + اسم + دور + إجراءات |

### 5.4 الجداول (Tables)

```
Table + TableHeader + TableBody + TableRow + TableCell + TableSortHeader
```

| المواصفة | القيمة |
|---|---|
| بنية | `w-full text-sm`، صفوف `divide-y divide-surface-200` |
| Header | `bg-surface-50 text-surface-600 text-xs uppercase` (في LTR) |
| الفرز | رأس قابل للفرز يعرض سهم (اتجاهي يُقلب) |
| التحديد | Checkbox اختياري في العمود الأول |
| Row actions | قائمة `...` (Dropdown) في آخر عمود |
| Pagination | تحت الجدول: صفّيحة + صفحة تالية/سابقة + عداد النتائج |
| Empty | سطر `EmptyState` ممتد على كل الأعمدة |
| Mobile | يتحول لبطاقات (cards) عبر `md:` — جدول مبسط + تفاصيل قابلة للتوسيع |
| الأرقام | `tabular-nums` + محاذاة `end` للأسعار/الكميات |

**أنواع الجداول الخاصة:**
- **BOQ Table:** أعمدة (بند، وصف، وحدة، كمية، سعر وحدة، إجمالي، حالة مطابقة) + صف مجموع. قابل للتصدير.
- **QuoteCompare Table:** أعمدة موردين متعددة متجاورة لمقارنة العروض (سعر، مدة، تحقق، تقييم، شروط).

### 5.5 لوحات المعلومات (Dashboards)

| المكوّن | المواصفة |
|---|---|
| KPI Row | `grid grid-cols-2 md:grid-cols-4 gap-4` من StatCards |
| Widget | بطاقة مع Header (عنوان + إجراء) + محتوى |
| Chart Card | غلاف Chart (Recharts) مع Legend وempty-state |
| Quick Actions | أزرار مختصرة (إنشاء RFQ، إضافة منتج، رفع BOQ) |
| Activity Feed | قائمة أحداث زمنية (إشعارات/سجل) |
| Progress Panel | أشرطة تقدم لدورة عمل (مثال: اكتمال ملف المورد KYC) |

**شبكة اللوحة:** `12-col` مع `col-span` للـ Widgets (هيراركية: KPI أوسع، تفاصيل أصغر).

### 5.6 الشارات والحالات (Badges & Status)

```
StatusBadge — خلفية soft + نص ملون + (نقطة/أيقونة اختيارية) — متوافق مع نظام Status
```

- Soft background: `bg-success-100 text-success-700` (بدل ألوان مشبعة).
- حالة التحقق: مستويات ADR-018 (قسم 2.3).
- شارة "مفاضلة/موثق/أذن": `TRUSTED`, `AUTHORIZED`, `VERIFIED_PURCHASE` بأيقونات.
- كل Status يقرن بـ `aria-label` أو نص واضح (لا لون وحده).

### 5.7 التنقل (Navigation)

| المكوّن | المواصفة |
|---|---|
| Navbar عام | `h-16 sticky bg-surface-0/90 backdrop-blur border-b` |
| LanguageSwitcher | مكوّن واحد بـ 3 خيارات (العربية / English / اردو) — عرض اسم اللغة بخطها الأصلي، أيقونة عالمية، حالة نشطة `aria-current`، حفظ في cookie `NEXT_LOCALE` |
| Sidebar بوابة | `w-64` (RTL: يمين، LTR: يسار) `bg-surface-0 border-e` — عنصر نشط `bg-brand-50 text-brand-700 border-s-2 border-brand-500` |
| Breadcrumbs | `text-sm text-surface-600`، فاصل `/` (مقاوم للاتجاه) |
| Tabs | شريط سفلي `border-b-2` للحالة النشطة، `aria-selected` |
| Stepper | دوائر رقمية/علامات + خطوط توصيل، حالة: done/current/pending |
| Pagination | أزرار أرقام + سابق/تالٍ (أيقونات تُقلب حسب الاتجاه) |
| Dropdown/Menu | Radix Menu، محاذاة منطقية للشاشة |

### 5.8 التغذية الراجعة (Feedback)

| المكوّن | المواصفة |
|---|---|
| Toast | حاوية `fixed bottom/end`، أنواع: success/error/warning/info، إغلاق تلقائي + يدوي |
| Alert (Inline) | `border-s-4` + أيقونة + رسالة قابلة للإغلاق |
| Modal/Dialog | Radix Dialog: خلفية `bg-black/40 backdrop-blur-sm`، لوحة `rounded-xl shadow-xl`، رأس بعنوان + زر إغلاق، `Escape` + `focus trap` |
| Drawer (مقارنة/فلترة) | من `end`، عرض `w-96`، على الجوال full-width |
| EmptyState | أيقونة + عنوان + وصف + CTA (قسم 2 من 01-ux-architecture) |
| Skeleton | خلفيات متدرجة pulse، مطابقة لأبعاد المحتوى |
| Tooltip | Radix Tooltip + `role=tooltip` |

### 5.9 المحاذاة RTL/LTR — قواعد إلزامية

1. **Logical Properties دائماً:** `ps/pe/ms/me/start/end` لا `left/right/pl/pr/ml/mr`.
2. **المرآة:** أيقونات الاتجاه (أسهم تنقل، chevrons، أيقونة "رجوع") تُقلب في LTR عبر `scale-x-[-1]` أو `rtl:rotate-180`.
3. **النص المختلط:** الأكواد (SKU, RFQ-001, وحدات القياس) داخل `dir="ltr"` محلياً.
4. **الأسعار:** `dir="ltr"` للرقم مع رمز العملة حسب اللغة.
5. **الفلوّات (Floating):** محاذاة Popovers/Menus عبر `--radix-side` + منطقية.

### 5.10 دعم اللغات الثلاث (Trilingual) — معايير قبول

| المعيار | التفصيل |
|---|---|
| **اللغات المعتمدة** | العربية (RTL) · الإنجليزية (LTR) · الأردية (RTL) — **متطلب رسمي معتمد** |
| **الخطوط** | 3 مسارات خطوط تُدار عبر `--font-sans` ديناميكياً (Cairo/Plex للعربي، Inter للاتيني، Noto Nastaliq Urdu/Jameel للأردي) |
| **أطوال النصوص** | كل المكوّنات تُراجع بمحتوى طويل/قصير في اللغات الثلاث؛ الأزرار `wrap`، الجداول `min-w` للأعمدة، الحقول توسع رأسي |
| **النماذج** | الـ placeholders والتسميات ورسائل الخطأ مترجمة وموصولة `aria-describedby` في اللغات الثلاث |
| **الاختبار** | Navigation · Forms · Tables تُختبر في اللغات الثلاث (دليل اختبار Sprint 1) |
| **الأرقام** | `Intl.NumberFormat`: عربي `ar-SA`، أردي `ur-PK` (أرقام هندية شرقية)، إنجليزي `en` |

### 5.11 مصفوفة اختبار RTL (D11 — RTL Testing Matrix)

> معيار قبول **إلزامي** لكل مكوّن وشاشة قبل اعتبارها "داعمة RTL". تُنفَّذ آلياً عبر Playwright + axe (معايير §7).

| المكوّن/العنصر | بُعد الاختبار | التوقع الصحيح في RTL (ar/ur) | التوقع في LTR (en) |
|---|---|---|---|
| **Navigation** | Navbar/Sidebar/Breadcrumbs/Tabs/Dropdowns | تبدأ من `start` (يمين)، الشريط الجانبي على اليمين، العنصر النشط `border-s-2` | مرآة كاملة (يسار) |
| **Navigation** | أيقونات الاتجاه (الأسهم، "رجوع"، chevrons) | تنقلب تلقائياً (لا حاجة لتصريح) | اتجاه أصلي |
| **Forms** | التسميات/الـ placeholders/رسائل الخطأ | تُقرأ من `start`، الأخطاء مموضعة `inline-end` وموصولة `aria-describedby` | مرآة |
| **Forms** | توسع البيانات الطويلة | لا قَطع للنص (wrap رأسي) في اللغات الثلاث | — |
| **Tables** | الرؤوس/الفرز/الأسعار | العمود الأول في `start`، الأرقام `tabular-nums` بمحاذاة `end`، سهم الفرز يُقلب | مرآة |
| **Tables** | طول النصوص | `min-w` للأعمدة + تفاف ذكي (الأردية/الإنجليزية أطول نصاً) | — |
| **Floating** | Dropdown/Popover/Modal/Drawer | `--radix-side` + محاذاة منطقية للشاشة (لا خروج خارج حدود العرض) | مرآة |
| **نص مختلط** | أكواد/وحدات (SKU, RFQ-001, m³) | `dir="ltr"` محلياً داخل RTL | — |
| **أرقام وعملات** | `Intl.NumberFormat` | عربي `٠١٢٣` / أردي `۰۱۲۳` / إنجليزي `0123` + رمز عملة حسب اللغة | — |
| **خطوط** | تطبيق الخط الصحيح | Naskh للعربية · Nastaliq للأردية · Inter للاتينية (عبر `--font-sans` ديناميكي) | — |
| **طول السطر** | `line-height` | العربية/الأردية أعلى من اللاتينية؛ لا `letter-spacing` | عادي |

**نطاق التنفيذ:** 3 لغات × عناصر القائمة أعلاه لكل شاشة من شاشات Sprint 1 (App Shell والبوابات المبنية). تقرير الاختبار يُرفق مع تعريف "جاهز للإطلاق".

---

## 6. التطبيق التقني (Implementation)

### 6.1 مكتبة الـ Primitives

- **Radix UI** (Headless: Dialog, Dropdown, Switch, Tabs, Tooltip, Select, Toast, Slot) للسلوك + الوصولية.
- **tailwind-variants (cva)** لتعريف الـ variants بشكل موحّد.
- كل مكوّن يُصدَّر: `Button.tsx`, `buttonStyles.ts` (cva), `Button.test.tsx`.

### 6.2 هيكل مجلد الـ UI Kit

```
src/components/ui/
├── button/            # Button.tsx + buttonStyles.ts + index.ts
├── input/
├── select/
├── textarea/
├── checkbox/
├── switch/
├── badge/
├── card/
├── table/             # Table.tsx + TableParts.tsx + types.ts
├── modal/
├── drawer/
├── toast/             # ToastProvider + useToast
├── tooltip/
├── tabs/
├── dropdown/
├── stepper/
├── pagination/
├── skeleton/
├── empty-state/
├── alert/
├── stat-card/
├── money-text/        # عرض Money/Currency (ADR-016) locale-aware
├── status-badge/      # نظام Status العام
└── index.ts           # re-export منظم (barrel)
```

### 6.3 مراحل البناء

| المرحلة | المخرجات |
|---|---|
| **Phase A (أساس)** | Tokens في globals.css + font strategy + Button/Input/Select/Textarea/Badge/Card/Table/Skeleton/EmptyState + `cn()` |
| **Phase B (تفاعلي)** | Modal/Drawer/Toast/Tabs/Dropdown/Switch/Tooltip/Stepper/Pagination (Radix) |
| **Phase C (أنماط)** | StatusBadge نظامي + MoneyText + DataTable + FormField/FormLayout + QuoteCompareTable + StatCard + DashboardShell |
| **Phase D (أمثلة)** | نموذج صفحة منتج/مورد/لوحة مورد (مرجعية) + Storybook (اختياري) |

### 6.4 الوثائق لكل مكوّن

- Props (TS interface موثق)
- Variants (عبر cva)
- مثال استخدام (AR/EN/UR)
- حالات خاصة (RTL، تحميل، خطأ، empty)
- اختبار A11y/Unit

---

## 7. الوصولية (Accessibility) — معايير القبول

- WCAG 2.1 AA لكل المكونات.
- `focus-visible` ring واضح: `focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`.
- تسميات ARIA على المكونات التفاعلية المجردة (IconButton, Switch, Tabs).
- الجداول بملخص `caption`؛ النماذج بـ `label + describedby`.
- لا تغيير مرئي يعتمد على اللون وحده.
- دعم `prefers-reduced-motion` (إيقاف الحركات غير الضرورية).
- اختبار آلي بـ axe في الـ E2E.

---

## 8. أمثلة تطبيقية (مقتطفات)

### مثال: زر

```tsx
// buttonStyles.ts (cva)
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:   "bg-brand-500 text-white hover:bg-brand-600",
        secondary: "bg-navy-800 text-white hover:bg-navy-900",
        outline:   "border border-surface-300 text-surface-700 hover:bg-surface-50",
        ghost:     "text-surface-700 hover:bg-surface-100",
        danger:    "bg-danger-500 text-white hover:bg-danger-600",
        link:      "text-brand-600 underline-offset-4 hover:underline",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

### مثال: عرض المال (MoneyText)

```tsx
<MoneyText value={offering.price} currency="SAR" locale={language} />
// ar → "ر.س 1٬250" | en → "SAR 1,250" | ur → "SAR ۱٬۲۵۰"
```
- الوثائق لكل مكوّن تُكتب بأمثلة AR/EN/UR (للمكونات المحلية: التسميات، الحقول، الرسائل).

---

## 9. مراجع ومصادر التمدد

- Tokens الإضافية تُضاف من خلال تحديث `globals.css` فقط (لا ملف config ثانٍ).
- أي مكوّن UI جديد يُسجّل في README نظام التصميم داخل `components/ui/README.md`.
- التصميم الجديد يتوافق مع هوية ABC الحالية (عنبر + كحلي) ولا يغيّرها دون اعتماد Product.

---

**نهاية خطة نظام التصميم**
