# 08 — معمارية الـ Theme والـ Tokens (Next.js + Tailwind 4)

> توثيق البنية الموجودة فعلياً في `src/app/globals.css` + خطة استكمالها. مرجع التنفيذ في Sprint 1b.

## 1. الوضع الحالي (مؤكَّد من الكود)

- **Tokens** في `:root` داخل `globals.css` (brand/navy/surface/success/warning/danger/info/flagship + radius + motion).
- **@theme inline** يربط الـ tokens بـ Tailwind utilities: `bg-brand-500`, `text-navy-800`, `border-surface-300`, `text-success-600`... إلخ.
- **الخطوط الثلاثية:** `--font-active` يُقلَّب عبر `html[lang]` (ar→cairo، en→inter، ur→nastaliq)؛ `--font-sans: var(--font-active)`.
- **Line-height:** ar/ur 1.6، ur 1.7.
- **classes عامة:** `.gradient-amber`, `.gradient-hero`, `.card-hover`, `.text-gradient`.

## 2. التصميم الهرمي (المرجعي)

```
globals.css
 ├── :root (Tokens الخام) ──┐
 │   ├── colors (semantic scale) │
 │   ├── radius / motion          │→ @theme inline (Tailwind v4)
 │   └── font strategy (--font-active)
 ├── html[lang] overrides (font + line-height)
 └── utilities (.gradient-*, .card-hover, .text-gradient)
```

## 3. قواعد الاستخدام (تبنّيها إجبارياً في الترحيل)

| القاعدة | مثال صحيح | الممنوع (موجود حالياً) |
|---|---|---|
| ألوان من Tokens فقط | `bg-brand-500`, `text-surface-800` | `bg-blue-500`, `text-gray-900`, `bg-green-500` |
| دلالة الألوان | success=حالة، warning=تنبيه، danger=خطأ، info=معلومات | أخضر لزر CTA في tenders/materials |
| CTA الوحيد لكل سياق | primary amber / secondary navy | خلط amber+blue+green في صفحة واحدة |
| نص على الخلفيات | text-surface (0–900) | gray-* المبعثرة |
| أرقام ur-PK | `formatCurrency` مع `ur-PK` | — |
| أيقونات اتجاهية | مكوّن `Icon` يغلّف flip (rtl:rotate-180) | `ArrowLeft`/`ArrowRight` الثابتة |

## 4. فجوات يجب إغلاقها في Sprint 1b

| الفجوة | الخطة |
|---|---|
| `--navy-600` و`--navy-700` متطابقان (1e3a5f) | توحيد السلم (سلم Navy موحّد مثل الـ Pack: 700/800/900) |
| ألوان خام باقية في الصفحات | مسح شامل: `grep -rn "bg-blue-\|bg-green-\|bg-red-\|text-gray-\|border-gray-"` واستبدالها |
| مكوّن Icon موحّد | إنشاء `src/components/ui/icon.tsx` يغلف lucide + flip (Logical: `rtl:rotate-180`) |
| سلم الظلال | إضافة tokens ظلال (shadow-sm/md/lg) إن لم تكن في Tailwind الافتراضي مخصصة |
| Dark mode (اختياري مستقبلاً) | تصميم يعتمد خصائص CSS — جاهز لـ prefers-color-scheme لاحقاً دون إعادة بناء |

## 5. انتشار القرارات المرتبطة

- **D9 (Nastaliq):** يبقى عبر `--font-nastaliq` — لا تغيير.
- **D10 (ملكية الترجمة):** الـ Theme لا يمس النصوص؛ الترحيل اللغوي منفصل (الموجة 4 في 06).
- **D11 (RTL matrix):** اختبار كل صفحة بعد تطبيق Theme (لا يعتمد الـ Theme نفسه على مسارات rtl/ltr الثابتة).

## 6. قبول الخروج

- [ ] `grep` لـ `bg-blue-|bg-green-|bg-red-|text-gray-` داخل `src/app` = صفر نتائج (باستثناء المناطق المعتمدة).
- [ ] لا زر CTA أخضر/أزرق بجانب amber في نفس السياق.
- [ ] `tsc --noEmit` + `npm run build` سليمان بعد كل موجة.
- [ ] الفحص البصري في Storybook (07) بثلاث لغات.
