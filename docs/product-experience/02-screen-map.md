# خريطة الشاشات — ABC Screen Map

**الإصدار:** 1.0
**الحالة:** ✅ معتمدة — مرجع رسمي (Sprint 0)
**تاريخ الاعتماد:** 31 يوليو 2026

---

## اصطلاحات

| الرمز | المعنى |
|---|---|
| ✅ | موجودة في الكود حالياً (جزئية أو كاملة) |
| 🔧 | موجودة لكنها تعتمد بيانات تجريبية / تحتاج إعادة بناء على الـ Design System |
| 🔜 | مخطط لها — تنفيذ في Sprint قادم |
| P0 | حرجة للإطلاق (MVP) |
| P1 | مهمة (المرحلة الثانية) |
| P2 | تحسينية (لاحقاً) |

> قاعدة: كل شاشة هنا تُقرأ مع `01-ux-architecture.md`. الـ Route مقترح ويتم اعتماده مع الـ Frontend Architecture.

---

## 1. عام / الصفحة الرئيسية

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 1.1 | الصفحة الرئيسية (Landing) | `/` | 🔧 | P0 |
| 1.2 | صفحة "عن المنصة" | `/about` | 🔜 | P2 |
| 1.3 | تواصل معنا | `/contact` | 🔜 | P2 |
| 1.4 | الشروط والأحكام | `/terms` | 🔜 | P2 |
| 1.5 | الخصوصية | `/privacy` | 🔜 | P2 |

---

## 2. المصادقة والحساب

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 2.1 | تسجيل الدخول | `/auth/login` | ✅ | P0 |
| 2.2 | إنشاء حساب (اختيار الدور/المؤسسة) | `/auth/register` | ✅ | P0 |
| 2.3 | نسيان كلمة المرور | `/auth/forgot-password` | 🔜 | P1 |
| 2.4 | إعادة تعيين كلمة المرور | `/auth/reset-password` | 🔜 | P1 |
| 2.5 | التحقق الثنائي MFA | `/settings/mfa` | ✅ | P1 |
| 2.6 | الملف الشخصي للمستخدم | `/profile` | 🔜 | P0 |
| 2.7 | الإعدادات (اللغة، الحساب) | `/settings` | 🔜 | P1 |
| 2.8 | لوحة المستخدم الموحّدة (توجيه للبوابات) | `/dashboard` | 🔜 | P0 |

---

## 3. المؤسسة والتحقق (Organization & KYC)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 3.1 | قائمة المؤسسات التابعة | `/organization` | ✅ | P0 |
| 3.2 | ملف المؤسسة | `/organization/[id]` | ✅ | P0 |
| 3.3 | الأعضاء والصلاحيات (RBAC) | `/organization/[id]/members` | ✅ | P0 |
| 3.4 | الأدوار المخصصة | `/organization/[id]/roles` | ✅ | P0 |
| 3.5 | التحقق والوثائق | `/organization/[id]/verifications` | ✅ | P0 |
| 3.6 | التحقق الشخصي KYC | `/verification` | ✅ | P0 |
| 3.7 | Onboarding متعدد الخطوات للمؤسسات | `/onboarding/org` | 🔜 | P0 |

---

## 4. السوق (Marketplace)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 4.1 | بحث المنتجات (قائمة + فلاتر + فرز) | `/marketplace` | 🔧 | P0 |
| 4.2 | تفاصيل المنتج (مواصفات + عروض الموردين) | `/marketplace/[id]` | 🔜 | P0 |
| 4.3 | مقارنة المنتجات (حتى 4) | `/marketplace/compare` | 🔜 | P0 |
| 4.4 | مقارنة الموردين لمنتج واحد | `/marketplace/compare/suppliers` | 🔜 | P1 |
| 4.5 | ملف المورد العام (عام للجميع) | `/suppliers/[id]` | 🔜 | P0 |
| 4.6 | نتائج البحث المتقدم | `/marketplace/search` | 🔜 | P1 |
| 4.7 | إطلاق RFQ من صفحة المنتج | `/marketplace/[id]/rfq` | 🔜 | P0 |
| 4.8 | المفضّلات (منتجات/موردون) | `/favorites` | 🔜 | P1 |
| 4.9 | تقييمات المنتجات والموردين | (ضمن 4.2 / 4.5) | 🔜 | P1 |

**تدفق RFQ من السوق:** `[4.1/4.2] → [4.7 RFQ] → {أصناف/كميات/موعد} → [RFQ في المشتريات 8.3] → [متابعة 8.4]`

---

## 5. بوابة المورد (Supplier Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 5.1 | لوحة المورد (KPI) | `/supplier` | 🔜 | P0 |
| 5.2 | الملف التجاري للمورد | `/supplier/profile` | 🔜 | P0 |
| 5.3 | الفروع والمناطق | `/supplier/branches` | 🔜 | P1 |
| 5.4 | القدرات (Capabilities) | `/supplier/capabilities` | 🔜 | P1 |
| 5.5 | الشهادات والرخص | `/supplier/certifications` | 🔜 | P1 |
| 5.6 | البيانات البنكية | `/supplier/banking` | 🔜 | P1 |
| 5.7 | قائمة المنتجات المعروضة | `/supplier/products` | 🔜 | P0 |
| 5.8 | إضافة/تعديل عرض منتج | `/supplier/products/new` + `/supplier/products/[id]/edit` | 🔜 | P0 |
| 5.9 | المستودعات | `/supplier/warehouses` | 🔜 | P0 |
| 5.10 | الأصناف والمخزون | `/supplier/inventory` | 🔜 | P0 |
| 5.11 | استيراد مخزون (Excel/CSV) | `/supplier/inventory/import` | 🔜 | P1 |
| 5.12 | سجل حركات المخزون | `/supplier/inventory/transactions` | 🔜 | P1 |
| 5.13 | RFQs واردة | `/supplier/rfqs` | 🔜 | P0 |
| 5.14 | تقديم عرض سعر | `/supplier/rfqs/[id]/quote` | 🔜 | P0 |
| 5.15 | الطلبات وأوامر الشراء | `/supplier/orders` | 🔜 | P0 |
| 5.16 | الفواتير والمدفوعات | `/supplier/invoices` | 🔜 | P1 |
| 5.17 | التحليلات والأداء | `/supplier/analytics` | 🔜 | P1 |
| 5.18 | علاقات العملاء (مشتريون) | `/supplier/relationships` | 🔜 | P1 |

---

## 6. بوابة المصنع (Manufacturer Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 6.1 | لوحة المصنع | `/manufacturer` | 🔜 | P0 |
| 6.2 | المنتجات الرئيسية (Product Masters) | `/manufacturer/products` | 🔜 | P0 |
| 6.3 | إنشاء منتج رئيسي | `/manufacturer/products/new` | 🔜 | P0 |
| 6.4 | تفاصيل منتج / مواصفات / أوراق بيانات | `/manufacturer/products/[id]` | 🔜 | P0 |
| 6.5 | الأصناف والوحدات (Variants) | `/manufacturer/products/[id]/variants` | 🔜 | P1 |
| 6.6 | العلامات التجارية | `/manufacturer/brands` | 🔜 | P1 |
| 6.7 | الموردون المعتمدون | `/manufacturer/distributors` | 🔜 | P1 |

---

## 7. بوابة المقاول (Contractor Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 7.1 | لوحة المقاول | `/contractor` | 🔜 | P0 |
| 7.2 | قائمة المشاريع | `/contractor/projects` | 🔜 | P0 |
| 7.3 | إنشاء مشروع | `/contractor/projects/new` | 🔜 | P0 |
| 7.4 | تفاصيل المشروع | `/contractor/projects/[id]` | 🔜 | P0 |
| 7.5 | رفع/تحرير BOQ | `/contractor/projects/[id]/boq` | 🔜 | P0 |
| 7.6 | معاينة BOQ وتحويله إلى RFQ | `/contractor/projects/[id]/boq/preview` | 🔜 | P0 |
| 7.7 | طلبات الشراء الخاصة بي | `/contractor/purchase-requests` | 🔜 | P0 |
| 7.8 | إنشاء RFQ من BOQ | `/contractor/rfqs/new` | 🔜 | P0 |
| 7.9 | العروض الواردة ومقارنتها | `/contractor/rfqs/[id]/offers` | 🔜 | P0 |
| 7.10 | الترسية وإنشاء أمر شراء | `/contractor/rfqs/[id]/award` | 🔜 | P0 |
| 7.11 | أوامر الشراء والتوريد | `/contractor/orders` | 🔜 | P1 |
| 7.12 | المناقصات المتاحة | `/tenders/projects` | 🔧 | P0 |
| 7.13 | تفاصيل مناقصة / تقديم عرض | `/tenders/projects/[id]` | 🔜 | P0 |
| 7.14 | قائمة عروضي على المناقصات | `/contractor/bids` | 🔜 | P1 |
| 7.15 | الموردون المفضلون والعلاقات | `/contractor/suppliers` | 🔜 | P1 |
| 7.16 | الفريق والعمالة | `/contractor/team` | 🔜 | P1 |
| 7.17 | المشاريع المعروضة عامة | `/projects` | 🔧 | P1 |

---

## 8. المشتريات (Procurement — مشترك بين الأدوار)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 8.1 | لوحة المشتريات | `/procurement` | ✅ | P0 |
| 8.2 | طلبات الشراء (PR) | `/procurement/purchase-requests` | ✅ | P0 |
| 8.3 | إنشاء طلب شراء | `/procurement/purchase-requests/new` | ✅ | P0 |
| 8.4 | تفاصيل طلب شراء | `/procurement/purchase-requests/[id]` | ✅ | P0 |
| 8.5 | RFQs | `/procurement/rfqs` | ✅ | P0 |
| 8.6 | إنشاء RFQ | `/procurement/rfqs/new` | ✅ | P0 |
| 8.7 | العروض (Quotations) | `/procurement/quotations` | ✅ | P0 |
| 8.8 | أوامر الشراء (PO) | `/procurement/purchase-orders` | ✅ | P0 |
| 8.9 | الفواتير | `/procurement/invoices` | ✅ | P1 |
| 8.10 | استلام البضائع (GR) | `/procurement/goods-receipts` | 🔜 | P1 |
| 8.11 | فحص الجودة | `/procurement/quality` | 🔜 | P1 |
| 8.12 | مقارنة العروض (نموذج تقدير مرجّح) | `/procurement/rfqs/[id]/evaluate` | 🔜 | P0 |

---

## 9. القوى العاملة والمهنيون (Workforce & Professionals)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 9.1 | لوحة القوى العاملة | `/workforce` | 🔜 | P0 |
| 9.2 | ملف المهارات (Skills Profile) | `/workforce/profile` | 🔜 | P0 |
| 9.3 | معرض الأعمال | `/workforce/portfolio` | 🔜 | P1 |
| 9.4 | الشهادات والرخص | `/workforce/certifications` | 🔜 | P1 |
| 9.5 | بحث الوظائف | `/jobs` | 🔧 | P0 |
| 9.6 | تفاصيل وظيفة | `/jobs/[id]` | ✅ | P0 |
| 9.7 | تقديم طلب وظيفة | `/jobs/[id]/apply` | ✅ | P0 |
| 9.8 | وظائفي وتقديماتي | `/workforce/applications` | 🔜 | P1 |
| 9.9 | سوق التدريب | `/training` | ✅ | P0 |
| 9.10 | تفاصيل دورة | `/training/[id]` | ✅ | P0 |
| 9.11 | دروسي وتسجيلي | `/training/my-courses` | ✅ | P0 |
| 9.12 | مشغّل الدرس | `/training/[id]/lessons/[lessonId]` | ✅ | P0 |
| 9.13 | شهاداتي | `/workforce/certificates` | 🔜 | P1 |
| 9.14 | سجل العمل والتقييمات | `/workforce/history` | 🔜 | P2 |

---

## 10. الاستشاري / المهندس (Consultant Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 10.1 | لوحة الاستشاري | `/consultant` | 🔜 | P0 |
| 10.2 | المشاريع تحت الإشراف | `/consultant/projects` | 🔜 | P0 |
| 10.3 | الموافقات المعلقة | `/consultant/approvals` | 🔜 | P1 |
| 10.4 | فحوصات الجودة | `/consultant/quality` | 🔜 | P1 |
| 10.5 | تقارير NCR | `/consultant/ncr` | 🔜 | P2 |
| 10.6 | شهادات القبول | `/consultant/certificates` | 🔜 | P2 |
| 10.7 | مكتبة المواصفات | `/consultant/specs` | 🔜 | P2 |

---

## 11. مزوّد التدريب (Training Provider Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 11.1 | لوحة مزوّد التدريب | `/training-provider` | 🔜 | P0 |
| 11.2 | دوراتي | `/training-provider/courses` | 🔜 | P0 |
| 11.3 | إنشاء/تعديل دورة | `/training-provider/courses/new` + `/[id]/edit` | 🔜 | P0 |
| 11.4 | إدارة الدروس | `/training-provider/courses/[id]/lessons` | 🔜 | P1 |
| 11.5 | التسجيلات والطلاب | `/training-provider/enrollments` | 🔜 | P1 |
| 11.6 | إصدار الشهادات | `/training-provider/certificates` | 🔜 | P1 |
| 11.7 | أداء الدورات | `/training-provider/analytics` | 🔜 | P2 |

---

## 12. التوصيل (Delivery — عبر الدور)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 12.1 | طلب توصيل جديد | `/delivery/new` | ✅ | P0 |
| 12.2 | تتبع الطلب | `/delivery/track` | ✅ | P0 |
| 12.3 | طلبات التوصيل | `/delivery` | ✅ | P1 |
| 12.4 | لوحة السائق | `/delivery/driver` | ✅ | P1 |

---

## 13. لوحة الإدارة (Admin Portal)

| # | الشاشة | Route | الحالة | الأولوية |
|---|---|---|---|---|
| 13.1 | لوحة الإدارة (نظرة عامة) | `/admin` | ✅ | P0 |
| 13.2 | المستخدمون | `/admin/users` | ✅ | P0 |
| 13.3 | المؤسسات | `/admin/organizations` | ✅ | P0 |
| 13.4 | طلبات التحقق | `/admin/verifications` | ✅ | P0 |
| 13.5 | المناقصات | `/admin/tenders` | ✅ | P1 |
| 13.6 | المشتريات | `/admin/procurement` | ✅ | P1 |
| 13.7 | المالية | `/admin/finance` | ✅ | P1 |
| 13.8 | المحتوى | `/admin/content` | ✅ | P1 |
| 13.9 | الدعم (CRM) | `/admin/crm` + (leads/contacts/opportunities) | ✅ | P1 |
| 13.10 | سجل التدقيق | `/admin/audit-log` | ✅ | P0 |
| 13.11 | إعدادات الأدوار والصلاحيات | `/admin/roles` | 🔜 | P1 |
| 13.12 | تحليلات المنصة (BI) | `/admin/analytics` | 🔜 | P1 |
| 13.13 | مراجعة محتوى السوق | `/admin/marketplace` | 🔜 | P1 |

---

## 14. الأولويات الإجمالية (Rollout Order)

| الموجة | الشاشات | الهدف |
|---|---|---|
| **موجة 0 — الأساس** | 2.6، 2.8، 3.7 | إتمام تجربة الحساب والتنقل |
| **موجة 1 — السوق (MVP)** | 4.1–4.8، 5.1، 5.2، 5.7–5.15، 6.1–6.4، 8.5–8.8، 8.12 | السوق والمشتريات تمكين التبادل التجاري |
| **موجة 2 — المقاول/الاستشاري** | 7.x، 10.x | دورة المشروع وBOQ والجودة |
| **موجة 3 — العمل والتدريب** | 9.x، 11.x | المهارات والوظائف والشهادات |
| **موجة 4 — التحليلات** | 5.17، 11.7، 13.12 | لوحات الأداء |

---

## 15. الشاشات المشتركة (Shared Screens)

تُبنى مرة واحدة وتُعاد عبر البوابات:

| الشاشة | الوصف |
|---|---|
| قائمة عامة (List + Search + Filters + Pagination) | نمط موحّد لكل القوائم |
| تفاصيل كيان (Detail + Tabs) | منتج، مورد، مشروع، عرض |
| نموذج إنشاء/تعديل (Form + Validation + Draft) | نمط موحّد للنماذج |
| ملف Org العامة | صفحة org قابلة للربط (لينكات عامة) |
| مقارنة (Compare Drawer) | سلة مقارنة عائمة (حتى 4 عناصر) |
| جدول بيانات (Data Table) | BOQ، مخزون، عروض، فواتير |
| Stepper + Summary | عمليات متعددة الخطوات |
| EmptyState / Skeleton / Toast | حالات النظام |

---

**نهاية خريطة الشاشات**
