# ADR-007: Architecture Tests & Dependency Rules

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
بدون قوانين صارمة، ستنهار حدود الـ Domains مع الوقت. نحتاج نظاماً يمنع الاختراقات تلقائياً في كل Commit.

## القرار

### 1. Dependency Direction
```
UI Layer (app/)
    ↓
Application Layer (modules/{domain}/services/)
    ↓
Infrastructure Layer (modules/core/, Prisma, Event Bus, External APIs)
```

**ممنوع:**
- `src/app/` يستورد شيئاً من `src/app/api/`
- `src/modules/{domain}/services/` يستورد من `src/app/`
- `src/modules/{domain}/` يستورد Prisma Model من Domain آخر
- `src/lib/` يستورد من `src/modules/`

### 2. Architecture Tests (Vitest)
نستخدم **Vitest + Structure Checker** لمنع الاختراقات:

```typescript
// tests/architecture/module-imports.test.ts
describe('Module Import Rules', () => {
  it('Tenders module must not import Procurement services', () => {
    // Scan all files in modules/tenders/
    // Fail if any import matches modules/procurement/services/
  });

  it('No module should import Prisma models from other modules', () => {
    // Check that Prisma queries only reference models owned by the module
  });

  it('No module should import from app/ directory', () => {
    // Business logic must not depend on UI layer
  });
});
```

### 3. Architecture Test Rules
| القاعدة | الاختبار | CI يجب أن يفشل إذا |
|---------|----------|-------------------|
| Module Isolation | كل Domain لا يستورد من Domain آخر | استيراد مباشر بين Domains |
| Data Ownership | كل Prisma Model يستخدم فقط في Domain المالك | استخدام Model في Domain غير مالك |
| Layer Isolation | UI لا يستورد من Infrastructure | استيراد معكوس |
| Event Only | Domains تتواصل فقط عبر Events | استدعاء Service من Domain آخر مباشرة |

### 4. CI Integration
- Architecture Tests تعمل مع كل PR
- `npm run test:architecture` كجزء من CI Pipeline
- أي اختراق ← FAIL
