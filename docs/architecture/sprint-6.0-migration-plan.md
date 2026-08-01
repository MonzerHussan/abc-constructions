# Sprint 6.0 — Migration Plan (Prisma Schema)

> **المرحلة:** Phase 1b — خطة الهجرة قبل أي تغيير على `prisma/schema.prisma`  
> **التاريخ:** 2026-08-01  
> **الحالة:** 📝 **قيد المراجعة — لا تطبيق حتى الاعتماد**  
> **المرجع:** المقترح المعتمد `sprint-6.0-procurement-workflow-engine-proposal.md` (§7.3)

---

## 1. الغرض

إضافة نموذجين جديدين لتخزين سجل انتقالات Workflow (`WorkflowHistory`) وتعريفات سير العمل القابلة للتكوين (`WorkflowDefinition`). التغيير **Additive بالكامل** — لا حذف/إعادة تسمية/تعديل لأي عمود أو جدول موجود.

## 2. النماذج المقترحة

### 2.1 `WorkflowHistory` (سجل التدقيق الكامل)

```prisma
enum WorkflowHistoryResult {
  SUCCESS
  BLOCKED_BY_GUARD
  INVALID_TRANSITION
  ERROR
}

model WorkflowHistory {
  id          String                  @id @default(cuid())
  entityType  String                  // RFQ, QUOTATION, PR, EVALUATION, AWARD, PO, DELIVERY
  entityId    String
  action      String                  // submit, send, award, approve, ...
  fromStatus  String
  toStatus    String
  result      WorkflowHistoryResult   @default(SUCCESS)
  guardName   String?
  reason      String?
  actorId     String?
  actorRole   String?
  metadata    Json?
  createdAt   DateTime                @default(now())

  @@index([entityType, entityId])
  @@index([entityType, entityId, createdAt])
  @@index([actorId])
  @@index([result])
  @@index([createdAt])
}
```

**ملاحظات التصميم:**
- `entityType`/`entityId` نصيان (String) عمداً — المحرك **عام** ولا يملك علاقات Prisma مع كيانات النطاق (التزام W-7/§3.1b: لا معرفة بـ RFQ/PR/PO داخل المحرك).
- لا `@relation` مع `User` على `actorId` — يبقى المحرك مستقلاً عن النطاقات (سلوك `onDelete` للنطاقات لا يؤثر على السجل). `actorRole` يلتقط الدور وقت الانتقال (Snapshot) بدل قراءة الدور الحالي.
- `metadata` من نوع `Json?` لحمل الحمولة الإضافية (قيم، أسباب، معرّفات مرتبطة).
- 5 فهارس مركبة/مفردة تغطي مسارات الاستعلام الأساسية (سجل كيان، سجل كيان مرتب زمنياً، أرشيف حسب الفاعل، مرشحات النتيجة، التقادم).

### 2.2 `WorkflowDefinition` (تعريفات قابلة للتكوين — اختياري)

```prisma
model WorkflowDefinition {
  id            String   @id @default(cuid())
  name          String   @unique
  version       Int      @default(1)
  entityType    String
  statuses      Json
  transitions   Json
  guards        Json?
  isActive      Boolean  @default(true)
  createdBy     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([entityType])
  @@index([isActive])
}
```

**ملاحظات التصميم:**
- `statuses`/`transitions`/`guards` بتنسيق JSON تصريحي قابل للتسجيل في `WorkflowEngine`.
- `version` يدعم تطور التعريفات دون كسر التعريفات النشطة.
- `name` فريد — المفتاح الطبيعي للتسجيل في المحرك.
- يُنفَّذ في Sprint 6.0 كتعريفات **ثابتة في الكود** مع إمكانية التخزين؛ الجدول اختياري (يمكن تأجيله إن لم يُستخدم في النطاق).

## 3. تحليل الأمان (Safety Analysis)

| الفحص | النتيجة |
|-------|---------|
| `DROP TABLE` | **0** — لا حذف |
| `DROP COLUMN` / `ALTER COLUMN` | **0** — لا تعديل أعمدة |
| `DELETE` / `TRUNCATE` | **0** — لا مسح بيانات |
| جداول موجودة متأثرة | **لا يوجد** — إضافة جداول جديدة فقط |
| مخاطر `prisma db push --accept-data-loss` | صفر خسارة بيانات (لا أعمدة `required` تُضاف على جداول مملوءة) |
| فهارس | 5 (WorkflowHistory) + 2 (WorkflowDefinition) — إضافة فقط |

## 4. خطة التطبيق (خطوات التنفيذ بعد الاعتماد)

| # | الخطوة | الأمر/التفاصيل |
|---|--------|----------------|
| S-1 | **تحديث السكيما** | إضافة النموذجين (وفق §2) في نهاية `prisma/schema.prisma` |
| S-2 | **توليد SQL المعاينة** | `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` → مراجعة يدوية للتأكد من 0 DROP/0 DELETE |
| S-3 | **التحقق** | `npx prisma validate` (0 أخطاء سكيما) |
| S-4 | **التطبيق** | `npx prisma db push` (بيئة تطوير — إضافة جداول جديدة فقط) |
| S-5 | **توليد العميل** | `npx prisma generate` |
| S-6 | **التحقق النهائي** | `prisma migrate status` (up to date) + `migrate diff` فارغ + فحص أن الجداول الجديدة موجودة (`\dt`) |
| S-7 | **توثيق** | تسجيل التنفيذ هنا + تحديث `technical-debt-register.md` عند الاقتضاء |

## 5. النسخة الاحتياطية (Backup)

- **تم الإنشاء:** `prisma/backup-sprint60-20260801.dump` (2026-08-01 05:00) — نسخة Custom Format عبر `pg_dump`.
- **الأمر المستخدم:**
  ```powershell
  & "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -h localhost -p 5432 -U postgres -Fc abc_constructions -f prisma/backup-sprint60-20260801.dump
  ```
- **حالة المزامنة قبل التطبيق:** `prisma migrate status` → "Database schema is up to date!" (5 migrations).
- **التحقق من التزامن:** `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` → *"This is an empty migration."*

## 6. خطة التراجع (Rollback)

| السيناريو | الإجراء |
|-----------|---------|
| فشل التطبيق جزئياً | استعادة النسخة: `pg_restore --clean --if-exists -d abc_constructions prisma/backup-sprint60-20260801.dump` |
| إلغاء الميزة بعد النجاح | `DROP TABLE "WorkflowHistory"; DROP TABLE "WorkflowDefinition";` — جداول جديدة فقط، لا تمس بيانات النطاق |
| تعطيل السلوك (بدون DB) | تعطيل Feature Flag `NEW_WORKFLOW` → لا إنفاذ/أتمتة |

## 7. فحص القبول (Acceptance Checklist)

- [ ] SQL المعاينة يحتوي **0** `DROP` / `DELETE` / `ALTER`.
- [ ] `prisma validate` بلا أخطاء.
- [ ] `prisma generate` ينجح ويولّد أنواع `WorkflowHistory`/`WorkflowDefinition`/`WorkflowHistoryResult`.
- [ ] `prisma migrate status` → up to date بعد التطبيق.
- [ ] `migrate diff` → فارغ بعد التطبيق.
- [ ] الاختبارات الحالية (1073 unit + 552 architecture) تستمر بالنجاح.

---

> **قرار الاعتماد:** التوقيع هنا يعتمد هذا الـ Migration Plan ويسمح بتطبيق §4 بعد الاعتماد.
