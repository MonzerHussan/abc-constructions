# Technical Spec — ABC Marketplace (سوق البضائع)

> **المسار:** Marketplace (القطاع الأكثر طلباً — 80% حسب تحليل السوق)
> **المرحلة:** Technical Spec — Phase 1 (ربط البنية القائمة + Entity Registry)
> **التاريخ:** 2026-08-01
> **القرار:** بناء على البنية القائمة (`ProductCatalog` + `Inventory` + `Marketplace`) — **لا إعادة بناء**
> **الأساس:** Entity Registry (`Entity`/`Profile`) — طبقة بيانات السوق المعزولة
> **الحالة:** ✅ **Approved** — §3.3 معتمدة (SupplierProfile.entityId) — 2026-08-01

---

## 1. الملخص التنفيذي

يُبني نظام **سوق البضائع** فوق بنية موجودة ومختبرة بالفعل (`ProductCatalog` + `Inventory` + `Marketplace`). لا يتم إنشاء جداول منتجات/فئات/مخزون جديدة من الصفر. العمل في هذه المرحلة:

1. **توثيق البنية القائمة** (جداول + APIs).
2. **ربط Entity Registry** بسوق البضائع — بحيث يرتبط كل منتج/عرض (Offering) بمورّد يمثّله **Entity/Profile** في سجل الكيانات المعزول.
3. تحديد **الفجوات** للإصلاح في الخطوة التالية.

**الهدف الاستراتيجي:** جعل بيانات السوق (منتجات/موردين/مخزون) قابلة للتحليل من المبرمج 2 (Data) والمبرمج 4 (AI) عبر `Entity`/`Profile` فقط — دون كسر طبقة الأمان.

---

## 2. البنية الحالية (مؤكدة بالفحص)

### 2.1 نماذج Product Catalog & Inventory (Prisma)

| النموذج | الدور | الموقع (سطر) |
|---------|-------|--------------|
| `ProductMaster` | كتالوج المنتج (name/sku/وصف/فئة/علامة) | 2294 |
| `ProductVariant` | متغيرات المنتج (حجم/لون/مواصفة) | 2341 |
| `ProductSpecification` | مواصفات فنية | 2359 |
| `UnitOfMeasure` | وحدات القياس (طن/متر/قطعة) | 2281 |
| `MaterialCategory` | فئات المواد (أسمنت/حديد/كهرباء...) | 1746 |
| `MaterialSubcategory` | فئات فرعية | — |
| `Brand` | العلامات التجارية | — |
| `SupplierProductOffering` | عرض المورّد (سعر/عملة/حد أدنى/مهلة/توفر) | 2414 |
| `Warehouse` | المخازن | 2498 |
| `StockItem` | أرصدة المخزون (متاح/محجوز) | 2523 |
| `InventoryImport` | استيراد مخزون غير متزامن | 2572 |

> **ملاحظة:** نموذج `Product` القديم (سطر 644) **ميت** — نسخة بديلة حديثة عبر `ProductMaster`+`Offering`. لا يُبنى عليه.

### 2.2 الوحدات (Modules)

| الوحدة | المسؤولية | الملفات |
|--------|-----------|---------|
| `product-catalog` | إدارة المنتجات/العروض/الوحدات + آلتا حالة (`ProductStateMachine`, `OfferingStateMachine`) | `services/ProductCatalogService.ts` + validators + 3 اختبارات |
| `inventory` | المخازن + الأرصدة + الاستيراد | نماذج + `InventoryImport` |
| `marketplace` | الاكتشاف/البحث/المقارنة/المفضلة/التقييمات/مطابقة الموردين | `services/MarketplaceService.ts` (708 سطراً) + validators + اختبارات |

### 2.3 نقاط API القائمة

| النطاق | المسارات |
|--------|----------|
| `/api/v1/marketplace/*` | `products`, `categories`, `compare`, `favorites/products`, `favorites/suppliers`, `reviews/products`, `reviews/suppliers`, `suppliers`, `suppliers/compare`, `rfq` (17 مساراً) |
| `/api/v1/product-catalog/*` | `products` (+ variants/specs/images/data-sheets/safety-sheets/status), `offerings` (+ status), `units` (19 مساراً) |

---

## 3. ربط Entity Registry (الجسر المعماري)

### 3.1 المشكلة الحالية

`SupplierProductOffering.supplierId → SupplierProfile` — أي أن العروض مربوطة بنموذج **SupplierProfile** (طبقة العرض/التحقق)، وليس بنموذج **Entity** (طبقة بيانات السوق المعزولة).

المطلوب (من الإدارة التقنية): تحليل بيانات الموردين مستقبلاً عبر `Entity`/`Profile` **فقط** — بلا وصول مباشر لـ `SupplierProfile` أو `User`.

### 3.2 آلية الربط المقترحة (بدون كسر العزل)

نحافظ على عزلة Entity Registry تماماً. نضيف **رابط توصيلي** بين الطبقتين عبر إشارة اختيارية لا تخلق علاقة FK مباشرة مع `User`/`Organization`:

```
Entity (سجل الكيانات)   ──profile.userId──▶  User (طبقة الأمان)        [موجود: نص عادي بلا FK]
SupplierProfile         ──userId──▶          User                      [موجود: FK]
SupplierProductOffering ──supplierId──▶      SupplierProfile           [موجود: FK]
```

**الفجوة:** لا يوجد حقل يربط `SupplierProductOffering` (أو `SupplierProfile`) بكيان `Entity` مباشرة.

### 3.3 الاقتراح (Additive — في الخطوة التالية بعد موافقة)

إضافة **حقل اختياري** في `SupplierProfile` (وليس في Entity Registry):

```prisma
model SupplierProfile {
  // ... الموجود
  entityId String?   // 🔜 إشارة إلى Entity.entityId (نصي، اختياري، بلا FK — عزل محفوظ)
  @@index([entityId])
}
```

**لماذا في `SupplierProfile` وليس `Entity`؟**
- `Entity` معزولة تماماً (لا تعرف SupplierProfile/User).
- `SupplierProfile` هو "الطبقة الموصلة" القابلة للربط بالطبقتين.
- لا FK → لا كسر عزل، ولا تأثير على حذف/قيود.

**التسلسل عند تسجيل مورد جديد:**
1. يُنشأ `User` (طبقة أمان).
2. يُنشأ `Entity` (CUST/SUPP + subtype) + `Profile` (مع `userId`).
3. يُنشأ/يرتبط `SupplierProfile` (طبقة عرض) بـ `entityId` الاختياري.
4. `SupplierProductOffering` يستمر بالربط بـ `SupplierProfile`.

**الاستهلاك من Data/AI:** عبر `Entity` + `Profile` فقط → يجلبون المنتجات عبر `entityId → SupplierProfile → SupplierProductOffering` عبر API مخصص (غير مباشر).

### 3.4 API الجسر المقترح (لاحقاً)

```
POST /api/v1/entity-registry/sync-supplier
```
- Body: `{ entity, profile, supplierProfileId? }`
- ينشئ Entity+Profile ويربطهما بـ `SupplierProfile` الموجود.

---

## 4. قرارات معمارية (ثابتة)

| القرار | الحالة |
|--------|--------|
| لا إعادة بناء Product Catalog / Inventory / Marketplace | ✅ معتمد |
| Entity Registry معزولة (بلا FK إلى User/Org) | ✅ معتمد |
| الربط عبر `SupplierProfile.entityId` (Additive، بلا FK) | 🔜 مقترح — بانتظار الموافقة |
| استهلاك Data/AI عبر Entity/Profile فقط | ✅ معتمد |
| `Product` القديم لا يُستخدم | ✅ |

---

## 5. الفجوات المحددة

| # | الفجوة | النوع | الحالة |
|---|--------|-------|--------|
| G-1 | لا رابط `SupplierProfile.entityId` → Entity | Schema (Additive) | ✅ **منفّذ (2026-08-01)** |
| G-2 | لا API `sync-supplier` (جسر الـ Supplier) | API | ✅ **منفّذ (2026-08-01)** |
| G-3 | بيانات قديمة في `Product` (الجدول الميت) | تنقية | 🔜 فحص/هجرة لاحقاً |
| G-4 | مطابقة `MaterialCategory` مع فئات الـ Entity (صناعة المقاول) | Mapping | 🔜 مراجعة لاحقاً |
| G-5 | سلسلة `Entity → SupplierProfile → Offering` بلا وصول مباشر | API قراءة | 🔜 بعد G-1 (يُضاف عند الحاجة)

---

## 6. حالة التنفيذ الحالية (تم — مسبقاً)

| البند | الحالة |
|-------|--------|
| Entity Registry (7 جداول + 21 enum) | ✅ مكتمل (بُني في الجلسة السابقة) |
| `_pending_abc_entities.sql` (Migration Additive) | ✅ جاهز (بلا تطبيق) |
| بوابة الجودة: tsc + 1275 test + build | ✅ ناجحة |

---

## 7. الخطوات التالية

1. ✅ ~~موافقة على `SupplierProfile.entityId` + `sync-supplier` API~~ — **منفّذ**
2. ✅ ~~تحديث migration SQL التحضيري~~ — **منفّذ**
3. مراجعة الفجوات G-3..G-5 وترتيب الإصلاح.
4. الربط مع واجهة المبرمج 3 عند جاهزيتها.
5. رفع PR إلى المبرمج 5 (حارس البوابة).

---

> **الحالة:** ✅ **Approved & Implemented** — `SupplierProfile.entityId` + `sync-supplier` API منفّذان (Additive، بلا FK). بانتظار مراجعة الفجوات المتبقية والربط مع الواجهة.
