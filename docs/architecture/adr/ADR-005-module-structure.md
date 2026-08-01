# ADR-005: Module Structure & Folder Layout

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
تنظيم الكود داخل الـ Modules يحتاج معياراً ثابتاً يضمن سهولة التنقل وفصل المسؤوليات.

## القرار
اعتماد الهيكل التالي لكل Module:

```
src/modules/{domain}/
├── index.ts              # Public API (ما يسمح للـ Domains الأخرى باستيراده)
├── services/             # Business Logic (Service Layer)
│   └── {Entity}Service.ts
├── events/               # Event Publishers & Handlers
│   ├── publishers/
│   └── handlers/
├── validators/           # Zod Validation Schemas
├── dto/                  # Data Transfer Objects (مخططات API)
├── types/                # TypeScript Types & Interfaces
└── __tests__/            # Module Tests
    ├── services/
    └── events/
```

### الهيكل العام للمشروع

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth Route Group
│   ├── (dashboard)/              # Protected Routes
│   ├── api/v1/                   # API Routes (نسق بالعربي)
│   │   ├── core/
│   │   ├── procurement/
│   │   ├── tenders/
│   │   └── ...
│   └── layout.tsx
├── modules/                      # Domains
│   ├── core/
│   ├── procurement/
│   ├── tenders/
│   ├── marketplace/
│   ├── projects/
│   ├── jobs/
│   ├── delivery/
│   ├── training/
│   ├── research/
│   ├── crm/
│   ├── social/
│   ├── notification/
│   ├── ai/
│   ├── workflow/
│   ├── rules/
│   ├── analytics/
│   ├── search/
│   ├── storage/
│   └── shared/                   # Utilities, Events, Types
├── lib/                          # Shared Library (ملغي تدريجياً)
├── middlewares.ts                # Centralized Middleware
└── instrumentation.ts            # Observability Init
```

### قواعد الاستيراد
- **بين Domains:** فقط عبر الـ Public API (`index.ts`)
- **من App Router إلى Domains:** في اتجاه واحد (App → Module Service)
- **ممنوع استيراد Prisma Models من Domain آخر**
- **ممنوع استيراد `services/` من Domain آخر مباشرة — عبر `index.ts` فقط**
