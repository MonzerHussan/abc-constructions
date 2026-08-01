# ABC Brand Identity v2 — تطبيق تحسين الهوية

> سجل تنفيذ تحسين الهوية البصرية (بدون تغيير الشخصية العامة). يوليو 2026.

## 1. مبدأ التنفيذ

- **الأساس:** الهوية الحالية معتمدة (Amber + Navy، نبرة B2B) — لم تتغير.
- **النطاق:** تطوير الشعار، App Icon/Favicon، توحيد لوحة الألوان داخل النظام.
- **خارج النطاق:** الخطوط (Cairo/Inter/Nastaliq كما هي)، التخطيط، وظائف الصفحات.

## 2. الشعار v2 — "ABC داخل ثلاثة مبانٍ متصاعدة"

مفهوم من المرجع المرسل: الأحرف **A وB وC** داخل **ثلاثة عناصر معمارية** (Skyline متصاعد يمثّل النمو والإنشاء).

| الملف | الوصف | الاستخدام |
|---|---|---|
| `docs/design-review/assets/logo/abc-logo-mark.svg` | Mark: إطار عنبري مستدير + 3 مبانٍ بيضاء بأحرف Navy | App Icon · Navbar · ≥24px |
| `.../abc-logo.svg` | Lockup (Mark + ABC) | خلفيات فاتحة |
| `.../abc-logo-white.svg` | Lockup | خلفيات داكنة |
| `.../abc-logo-mono.svg` | نسخة أحادية (Navy، بلا إطار) | طباعة/أحادي اللون |
| `public/logo/*` | نسخ الخدمة داخل التطبيق | `<Image src="/logo/abc-logo-mark.svg">` |

**الهندسة (viewBox 96):** مبانٍ بعرض 18، أسفل موحّد y=84، أعلى متصاعد (A=58, B=46, C=34)، زوايا عليا rx=5، أحرف fontWeight 800 fontSize 20 متمركزة في كل مبنى. **المخطط يبقى مقروءاً حتى 16px** (الأحرف تتضح ≥24px).

## 3. App Icon / Favicon

- `src/app/icon.svg` (= mark) + `src/app/icon.png` (192px) + `src/app/apple-icon.png` (180px) — مُولَّدة من الـ SVG عبر `sharp`.
- حُذف `favicon.ico` الافتراضي (شعار Next) — أيقونة ABC هي المصدر الآن.
- `src/components/Navbar.tsx` وصفحات `/auth/login` و`/auth/register`: استُبدلت أيقونة `Building2` بالـ Mark الجديد (Image) — بما فيها اللوحة الداكنة على `gradient-hero`.

## 4. توحيد لوحة الألوان (Tokens)

**التحويل (اسم-لاسم داخل `src/`، 77 ملف):**

| القديم (Tailwind) | الجديد (Token) | ملاحظة |
|---|---|---|
| `gray-*` | `surface-*` | كل المحايدات |
| `blue-*` | `info-*` | |
| `green-*` | `success-*` | |
| `red-*` | `danger-*` | |
| `yellow-*` | `warning-*` | |
| `orange-*` | `amber-*` | |
| `purple/indigo/violet/fuchsia-*` | `flagship-*` | |
| `sky/cyan-*` | `info-*` | |
| `rose/pink-*` | `danger-*` | |
| `lime-*` | `warning-*` | |
| **`emerald/teal-*`** | **مُبقاة كما هي** | هويات وحدة Delivery (emerald) وJobs (teal) — من الشخصية الحالية |

**سُلم الألوان:** مُوسَّع في `globals.css` إلى 50–800 لكل scale (success/warning/danger/info/amber/flagship) لضمان صدق كل فئة محوَّلة، وربطها بـ `@theme inline`.

**قاعدة CTA:** لا خلط Amber + أزرق/أخضر في نفس السياق. طُبّقت على:
- `/procurement` (زر RFQ الأزرق ← Navy secondary بجانب amber primary).
- `/tenders/materials` (زر الطلب الأخضر ← amber primary؛ أزرار عناصر القائمة ← Navy secondary).
- `/procurement/rfqs` (زر إنشاء RFQ ← amber primary).
- أُبقي الأخضر للـ **success-affirming actions** (مثل "اعتماد الطلب") والأزرق/المعلومات للإجراءات الثانوية في الوحدات التي لا تخلطه مع amber.

## 5. إصلاحات جانبية (مؤكَّدة / مسجَّلة)

- **zod v4 `z.enum`:** `errorMap` لم يعد مدعوماً — أُصلح إلى `{ message }` في `src/modules/core/validators/user-schemas.ts` (كان يكسر `tsc` و`build`). خطأ سابق الوجود.
- **`href` مكسور:** backtick زائد في `/procurement/rfqs/page.tsx` أُزيل.
- **غير ملموس:** أخطاء eslint `any` والـ setState-in-effect السابقة في admin/research تبقى كما هي (خارج النطاق).

## 6. التحقق

- [x] `npx tsc --noEmit` نظيف
- [x] `npm run build` ناجح
- [x] `npm run test` — 1073 اختباراً ناجحاً
- [x] ESLint: لا أخطاء جديدة (كل ما ظهر سابق الوجود)
- [x] Smoke: `/` و`/auth/login` = 200، الـ logo في الـ HTML، `icon.svg` و`/logo/*.svg` يُخدَّمان، `lang="ar"` صحيح
- [x] `grep` لأي class لوني خام = صفر (باستثناء emerald/teal المقصودة)

## 7. مراجع

- الهوية المرجعية: `docs/design-review/` + `assets/logo/`
- مقارنة ما قبل الاعتماد: `docs/design-review/comparison/`
