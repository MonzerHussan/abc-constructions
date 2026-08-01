# ADR-010: Naming Conventions & Coding Standards

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
وجود معايير تسمية واضحة يضمن اتساق الكود ويقلل الاحتكاك بين أعضاء الفريق.

## القرار

### 1. الملفات والمجلدات
| العنصر | القاعدة | مثال |
|--------|---------|------|
| Module folders | `kebab-case` (جمع) | `purchase-requests`, `purchase-orders` |
| Service files | `PascalCase` + `Service` | `PurchaseRequestService.ts` |
| Event files | `PascalCase` + `Event/Handler` | `PurchaseOrderCreatedEvent.ts` |
| Route files | `kebab-case` | `route.ts`, `[id]/route.ts` |
| Validator files | `PascalCase` + `Schema` | `CreatePurchaseRequestSchema.ts` |
| Type files | `PascalCase` | `PurchaseRequestTypes.ts` |
| Test files | نفس الملف + `.test` | `PurchaseRequestService.test.ts` |

### 2. التسمية في الكود
| العنصر | القاعدة | مثال |
|--------|---------|------|
| Classes | `PascalCase` | `class PurchaseRequestService` |
| Functions | `camelCase` | `createPurchaseRequest()` |
| Variables | `camelCase` | `const purchaseRequestId` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PO_AMOUNT` |
| Interfaces | `PascalCase` (لا بادئة I) | `interface PurchaseRequestService` |
| Types | `PascalCase` (لا بادئة T) | `type PurchaseRequestStatus` |
| Enums | `PascalCase` | `enum PurchaseRequestStatus` |
| enum members | `UPPER_SNAKE_CASE` | `DRAFT`, `SUBMITTED`, `APPROVED` |
| Private properties | `#camelCase` | `#prismaClient` |
| Async functions | `camelCase` | `async createPurchaseRequest()` |

### 3. معايير الكود
- **TypeScript صارم:** `strict: true`، `noImplicitAny`، `strictNullChecks`
- **لا `any`** مطلقاً. استخدم `unknown` مع Type Guards عند الضرورة
- **الدوال لا تتجاوز 30 سطراً.** إذا زادت، قسّمها
- **الملف لا يتجاوز 200 سطر.** إذا زاد، قسّمه إلى وحدات أصغر
- **Zod لـ Validation.** لا تستخدم `zod` داخل Prisma Schema — Prisma Schema هو تعريف DB فقط
- **ESLint + Prettier** مع قواعد TypeScript صارمة
- **استيراد فقط ما تحتاجه.** لا `import *` إلا عند الضرورة القصوى
- **Responsibility وحيدة لكل دالة:** دالة واحدة تفعل شيئاً واحداً

### 4. تعليقات
- لا توجد تعليقات في الكود. الكود يتحدث عن نفسه
- استثناء: JSDoc للـ Public APIs في الـ Shared Kernel
- استثناء: `TODO:` مع اسم الشخص وتاريخه
