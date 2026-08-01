# معمارية CI/CD — منصة ABC

**التاريخ:** 2026-08-01  
**الأداة:** GitHub Actions (`.github/workflows/ci.yml`)

---

## 1. نظرة عامة

يجري pipeline كامل فحوصات الجودة والأمان والبناء والاختبارات الشاملة عند كل push إلى `main` أو PR، ويُنتج أثر build جاهز للنشر.

## 2. تدفق العمل

```
[push main | PR]
      │
      ▼
┌──────────────┐   ┌─────────────┐   ┌──────────────┐
│ quality      │   │ unit        │   │ audit        │
│ lint(⚠)      │   │ test        │   │ npm audit    │
│ typecheck    │   │ coverage    │   │ (critical)   │
└──────────────┘   └─────────────┘   └──────────────┘
      │                  │
      └─────────┬────────┘
                ▼
         ┌──────────────┐
         │ build        │  Postgres + prisma db push + next build
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │ e2e          │  Playwright (chromium) ضد الخادم المبدوء
         └──────────────┘
```

## 3. المراحل بالتفصيل

| المرحلة | الأوامر | الحالة الفاشلة |
|---|---|---|
| `quality` | `npm run lint` (continue-on-error) + `npm run typecheck` | typecheck يمنع المتابعة |
| `unit` | `npm test` + `npm run test:coverage` | تمنع البناء |
| `audit` | `npm audit --audit-level=critical` | تفشل عند Critical فقط |
| `build` | `prisma generate` + `prisma db push` + `npm run build` | تمنع النشر |
| `e2e` | `playwright install --with-deps chromium` + `next start` + `playwright test` | تمنع الإصدار |

## 4. البنية التحتية للتشغيل

- **Node.js 20** (ubuntu-latest) مع cache npm.
- **PostgreSQL 16** (خدمة جانبية) في مراحلي build/e2e عبر `postgres:16-alpine`.
- **متغيرات CI:** `DATABASE_URL`, `AUTH_SECRET` (قيمة وهمية للاختبار فقط), `AUTH_TRUST_HOST=true`.

## 5. الأثرات (Artifacts)

- `coverage/` — تقرير التغطية.
- `next-build/` — بنية Next للمراحل اللاحقة.
- `playwright-report/` — تقرير E2E (يحمل حتى عند الفشل).

## 6. البوابات قبل الإصدار

1. كل فحوصات CI خضراء (نعم للـ lint غير المُعطِّل حالياً).
2. تعبئة أسرار الإنتاج في بيئة الاستضافة (لا شيء في git).
3. تحديد مرجع التغطية والتراجع عنه.

## 7. خارطة مستقبلية

- إضافة نشر تلقائي إلى Vercel/Railway عند الدمج في `main` (CD).
- تشغيل E2E ضد بيئة staging قبل الإنتاج.
- إضافة فحص `gitleaks` للأسرار وفحص coverage threshold إلزامي.
