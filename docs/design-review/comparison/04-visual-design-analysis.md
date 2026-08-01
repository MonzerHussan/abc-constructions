# 04 — تحليل التصميم البصري (Visual Design Analysis)

> مقارنة الهوية البصرية بين ما هو مطبّق فعلياً في `src/globals.css` (من Sprint 1) وما في `docs/design-review/assets/preview.css`.

## 1. معمارية الألوان (Color Tokens)

| Token | الحالية (`globals.css`) | الـ Pack (`preview.css`) | التطابق |
|---|---|---|---|
| `--brand-*` (amber) | ✓ ffh f59e0b/d97706/b45309 | ✓ مطابق | ✅ |
| `--navy-*` | navy-600/700=1e3a5f, 800=0f172a, 900=0a1128 | navy-700=1e3a5f, 800=0f172a, 900=0a1128 | ✅ (إعادة تسمية 600→700 قيد المراجعة) |
| `--surface-*` (0–900) | ✓ | ✓ مطابق | ✅ |
| `--success-*`, `--warning-*`, `--danger-*`, `--info-*` | ✓ | ✓ مطابق | ✅ |
| `--flagship-*` (violet) | ✓ 7c3aed/ede9fe | ✓ مطابق | ✅ |
| الربط بـ Tailwind `@theme inline` | ✓ (`bg-brand-500`, `text-navy-800`, `border-surface-300`) | — (مرجع CSS يدوي) | ⚠️ الحالية متقدمة |

**النتيجة:** الطبقة التحتية (Tokens) **مطابقة تماماً** بين الكود والـ Pack — إذ إن Tokens صيغت من الـ Pack أصلاً في Sprint 1. **الفرق الحقيقي في الاستخدام**: صفحات `src/` ما زالت تستخدم ألوان Tailwind الخام `bg-blue-500`/`bg-green-500`/`text-gray-900` بدل Tokens.

## 2. الألوان السامية (Semantic usage) — الفجوة الفعلية

| السياق | الحالية (أمثلة فعلية) | القاعدة (الـ Pack) |
|---|---|---|
| CTA رئيسي | `bg-amber-500 text-white` (home, marketplace) | `btn-primary` = amber |
| CTA ثانوي | `bg-blue-500` (procurement RFQ) | `btn-secondary` = navy |
| CTA في tenders/materials | `bg-green-500` (طلب شراء) | **لا يُستخدم الأخضر لـ CTA** — green=نجاح/حالة |
| بطاقات KPI | مزيج amber/blue/green/yellow/purple في صفحة واحدة | تلوين مقيّد بدلالة (success/info/warning/danger) |
| نص أساسي | `text-gray-900` | `text-surface-800/900` (رسمياً) — بصرياً متطابق |

> **قاعدة الـ Pack الأساسية:** "لا تخلط Amber (brand) مع أزرق/أخضر في نفس سياق الإجراء". الحالية تخالفها في `/procurement` و`/tenders/materials`.

## 3. الطباعة (Typography)

| الخط | الحالية | الـ Pack | ملاحظة |
|---|---|---|---|
| العربي | Cairo (next/font) | Cairo / IBM Plex Sans Arabic | ✅ |
| اللاتيني | Inter | Inter | ✅ |
| الأردية | **Noto Nastaliq Urdu** (next/font) | Noto Nastaliq Urdu / Jameel Noori | ✅ (D9) |
| Mono | Geist Mono | Geist Mono | ✅ |
| التبديل التلقائي | `--font-active` عبر `html[lang]` | `html[lang="en"] { font-family }` | ✅ الحالية أشمل |
| Line-height | ar/ur 1.6، ur 1.7 | body 1.6 | ✅ الحالية أكثر دقة لـ Nastaliq |

**النتيجة:** الطباعة مطابقة بل إن الكود الحالي **أسبق** (يدعم ur فعلياً). لا فجوة في الطباعة.

## 4. المكوّنات (Component Library)

| المكوّن | الحالية (`src/components/ui/`) | الـ Pack (`preview.css`) | الملاحظة |
|---|---|---|---|
| Button | ✓ (button.tsx) | ✓ 4 أصناف + sm/lg | الحالية تحتاج محاذاة أصناف (primary amber، secondary navy، outline، ghost) |
| Card | ✓ | ✓ | متطابقان بصرياً |
| Input/Select/Textarea | ✓ | ✓ | نماذج |
| Badge/StatusBadge | ✓ | ✓ (Status مع أيقونات) | الحالية تستخدمه جزئياً في الصفحات |
| Table | ✓ | ✓ | أولوية ترحيل لصفحات البيانات |
| Skeleton | ✓ | — (مرجع يدوي) | الحالية أسبق |
| Sidebar / Navigation | **غير موجود** في `src/` | ✓ في البوابات (Navy) | **أكبر فجوة هيكلية** — القرار في G1 |

## 5. الرموز والأيقونات

- الحالية: lucide-react (موحّد) — جيد.
- القاعدة: **أيقونات اتجاهية تُقلَّب عبر المرآة** (الـ Pack `[dir="ltr"] .flip`). الحالية تثبّت `ArrowLeft/ArrowRight` بلا مرآة → تُصلح عبر أداة `Icon` تغلّف `rtl:rotate-180` أو flip.

## 6. الشعار

- الحالية: `Building2` lucide داخل مربع amber — **ليس شعاراً رسمياً**.
- الـ Pack: placeholders `assets/logo/abc-logo*.svg` (فاتح/داكن/Mark) — **يُستبدل عند استلام SVG الرسمي**. لا يُبنى هوية نهائية قبل الاستلام؛ تُحجز المساحات فقط.

## 7. الملخص البصري

| الجانب | التقييم |
|---|---|
| Tokens الطبقة السفلية | ✅ متطابق |
| الطباعة الثلاثية | ✅ مطابق بل أسبق |
| الاستخدام السامي في الصفحات | ⚠️ خرق قاعدة CTA/ألوان KPI |
| مكتبة المكونات | ⚠️ مكتملة البنية، ترحيل الاستخدام ناقص |
| التنقل (Sidebar) | ❌ فجوة هيكلية — قرار G1 |
| الشعار | 🕓 placeholder حتى وصول SVG |

> **استنتاج:** لا "إعادة تصميم" مطلوبة — **ترحيل استهلاكي** من Tailwind الخام إلى Tokens والمكوّنات، مع حسم قرار الـ Sidebar في G1.
