# 07 — إعداد Storybook لـ UI Kit

> وثيقة جاهزية التنفيذ: كيفية فتح مكوّنات `src/components/ui/` في Storybook كمختبر بصري/تفاعلي للمراجعين قبل وبعد الترحيل. **لا تُنفَّذ قبل G3.**

## 1. الهدف

- معرض حي لكل مكوّن من الـ UI Kit (button, input, select, textarea, badge, card, table, skeleton, empty-state, status-badge, stat-card, language-switcher) مع كل الحالات (default/hover/disabled/error/loading/empty).
- تثبيت سلوك RTL/LTR والخطوط الثلاثية (Cairo/Inter/Nastaliq) — فحص حقيقي للـ Nastaliq في Storybook (غالباً ما يظهر مختلفاً عن المتصفح في الظروف المختلفة).
- مرجع للمراجعين في G2 بدل فتح تطبيق كامل.

## 2. الإعداد المقترح (Next.js 16 + React 19 + Tailwind 4)

**الأدوات:** `@storybook/react-vite` أو `@storybook/nextjs`. يُفضَّل **`@storybook/nextjs`** لتوافق webpack/next/font.

```
# تثبيت (عند التنفيذ)
npx storybook@latest init --type nextjs --yes
```

**الخطوات المعتمدة من الاستكشاف الحالي:**
1. `storybook/main.ts`: إضافة `stories: ['../src/components/**/*.stories.@(ts|tsx)']`، و`staticDirs` للخطوط إن لزم.
2. `storybook/preview.ts`: استيراد `../src/app/globals.css` (يحمل Tokens والخطوط الثلاثية).
3. **الخطوط:** تضمين Cairo/Inter/Noto Nastaliq عبر `next/font` في `preview.tsx` وتطبيق متغيرات CSS (`--font-cairo`, `--font-inter`, `--font-nastaliq`) — لأن `--font-active` يعتمد عليها. بدون ذلك تظهر النصوص بخط النظام.
4. **مرحلة اللغة:** Toolbar مخصّصة (`globalTypes`) تضع `document.documentElement.lang/dir` من `LOCALES` (`src/lib/i18n.ts`) → تتحقق المعاينات بثلاثة اتجاهات فورياً.
5. **الشفافية:** `parameters.actions`, `controls` افتراضية.

## 3. قائمة القصص (Stories) المطلوبة

| المكوّن | الحالات |
|---|---|
| Button | primary/secondary/outline/ghost × sm/md/lg × loading/disabled × RTL flip للأيقونات |
| Input | default/error/disabled/required + `dir` عند الحاجة (أرقام، تواريخ) |
| Select | default/error/multi؟ |
| Textarea | default/error/disabled |
| Badge & StatusBadge | success/warning/danger/info/neutral + علامة نقطة/أيقونة |
| Card | أساسي/تفاعلي (hover) + CardHeader/CardTitle/CardBody |
| Table | أساسي + كثيف (جداول data) + فرز + حالة فارغة + Skeleton |
| Skeleton | نصوص/بطاقات/جداول |
| EmptyState | عام + مُخصّص (بحث بلا نتائج) |
| StatCard | كل الأصناف اللونية الدلالية |
| LanguageSwitcher | القائمة الثلاثية مفتوحة/مغلقة |

## 4. آليات الجودة

- **Chromatic** (اختياري): تسجيل بصري + diff لالتقاط انحدارات CSS أثناء الترحيل — يوصى به لـ 60+ صفحة.
- **axe-core addon** (`@storybook/addon-a11y`): كشف أخطاء WCAG داخل كل قصة — يتكامل مع تقرير 09.

## 5. قبول الخروج

- [ ] كل مكوّن يستجيب للـ toolbar الثلاثية (ar/en/ur) مع dir صحيح.
- [ ] خطوط Nastaliq/Inter/Cairo تظهر فعلياً في المعاينة (لا خط احتياطي).
- [ ] لا قصص مفقودة لأصناف الـ kit المستخدمة في Sprint 1b.
- [ ] تفعيل addon-a11y بلا أخطاء حرجة في المكوّنات الأساسية.
