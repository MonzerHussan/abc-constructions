# وثيقة العمارة الفنية لمنصة ABC

**الإصدار:** 1.0  
**آخر تحديث:** يوليو 2026  
**حالة الوثيقة:** ✅ معتمدة - المرجع الأساسي للتطوير  

---

## 1. الرؤية والمنتج

### الرؤية
> **"المنصة الرقمية الشاملة لكل ما يتعلق بالبناء والإنشاءات"**

### الرسالة
ربط جميع أطراف قطاع الإنشاءات في نظام بيئي رقمي واحد متكامل، يشمل مالكي المشاريع، الاستشاريين، المقاولين، المقاولين الفرعيين، الموردين، المصنعين، المستقلين، وشركات النقل. تهدف المنصة إلى تسهيل التواصل، وتبسيط العمليات التجارية، وزيادة الشفافية في جميع مراحل دورة حياة المشروع الإنشائي.

### القيمة المقترحة
- **منصة شاملة:** كل ما يحتاجه قطاع الإنشاءات في مكان واحد
- **تكامل عمودي:** ربط جميع الأطراف من المالك إلى المقاول إلى المورد
- **دعم ثلاثي اللغات:** العربية (أساسي)، الإنجليزية، الأردية
- **توثيق وثقة:** نظام KYC/KYB متكامل للتحقق من هوية وشرعية جميع الأطراف

### الجمهور المستهدف
1. **مالكو المشاريع (OWNER):** أفراد أو شركات لديهم مشاريع إنشائية
2. **الاستشاريون (CONSULTANT):** مكاتب هندسية واستشارية
3. **المقاولون (CONTRACTOR):** شركات المقاولات العامة
4. **المقاولون الفرعيون (SUBCONTRACTOR):** مقاولو التخصصات (كهرباء، سباكة، تشطيبات)
5. **الورش (WORKSHOP):** ورش التصنيع والنجارة والحدادة
6. **المستقلون (FREELANCER):** أفراد يقدمون خدماتهم بشكل مستقل
7. **الموردون (SUPPLIER):** موردو مواد البناء والمعدات
8. **تجار مواد البناء (TRADER):** تجار التجزئة والجملة لمواد البناء
9. **شركات النقل (عبر نظام التوصيل):** سائقون وشركات نقل مواد البناء

---

## 2. تقسيم الوحدات (Module Architecture)

### جدول الوحدات

| الوحدة | الحالة | الوصف | المسؤوليات |
|---|---|---|---|
| 🔐 **Auth & RBAC** | ✅ مكتمل | المصادقة والصلاحيات | NextAuth v5، JWT، 8 أدوار رئيسية، نظام صلاحيات مرن |
| 👤 **Users & Orgs** | ✅ مكتمل | المستخدمون والمؤسسات | Users، Organizations، UserOrganization مع RBAC متعدد المستويات |
| 🪪 **KYC/KYB** | ✅ مصمم | التحقق من الهوية والشركات | Verification، VerificationDocument، 16 نوع وثيقة |
| 🏗 **Projects** | ✅ مكتمل | عرض المشاريع | CRUD مشاريع، صور، تصنيفات، حالات متعددة |
| 📑 **Tenders** | ✅ مكتمل | المناقصات | ProjectTender + MaterialTender مع نظام المزايدة |
| 💼 **Jobs** | ✅ مكتمل | التوظيف | إعلانات وظائف، تقديم طلبات، حفظ الوظائف |
| 🎓 **Academy** | ✅ مكتمل | الأكاديمية والتدريب | دورات، دروس، تسجيلات، شهادات إتمام |
| 🚚 **Delivery** | ✅ مكتمل | خدمة التوصيل | طلب توصيل، تتبع سائق، خرائط لحظية |
| 🛒 **Marketplace** | 🔧 قيد التصميم | سوق المواد | عرض منتجات، واجهة موردين، مقارنة أسعار |
| 📦 **Procurement Core** | 🔜 قادم | دورة المشتريات الكاملة | RFQ، عروض أسعار، تقييم، ترسية، أوامر شراء |
| 🤖 **AI Assistant** | 🔜 مخطط | المساعد الذكي | تحليل BOQ، مطابقة ذكية، توصيات |
| 💬 **Social Feed** | 🔜 مخطط | التواصل الاجتماعي | منشورات، تعليقات، إعجابات، مجتمعات |
| 📚 **Knowledge Hub** | 🔜 مخطط | مركز المعرفة | مواصفات، كودات بناء، مكتبة معايير |
| 🏆 **Events** | 🔜 مخطط | الفعاليات | مؤتمرات، ورش عمل، ندوات عبر الإنترنت |
| 📊 **Analytics** | 🔜 مخطط | التحليلات | لوحات BI حسب الدور، تقارير ذكية |

### هيكل الوحدات في قاعدة البيانات (Prisma Schema)

```
📁 prisma/
  └── schema.prisma (نموذج بيانات موحد يشمل جميع الوحدات)
```

### علاقات الوحدات

```
Auth ──→ Users ──→ Organizations
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    KYC/KYB      Tendors      Projects
         │            │            │
         │       ┌────┘            │
         │       ▼                 │
         │    Bidding              │
         │       │                 │
         └───────┼─────────────────┘
                 ▼
            Marketplace ──→ Procurement
                 │
                 ▼
             Delivery
                 │
                 ▼
               Jobs ──→ Academy
                          │
                          ▼
                     Certificates
```

---

## 3. نموذج البيانات وهندسة قواعد البيانات (Domain Model / Data Architecture)

### استراتيجية قاعدة البيانات

| العنصر | الاختيار | السبب |
|---|---|---|
| **نظام DB** | PostgreSQL | علائقي، ACID، دعم JSON، أداء عالٍ |
| **ORM** | Prisma | Type-safe، auto-generation، migrations، relations |
| **استضافة DB** | Supabase / Render / VPS | حسب البيئة |
| **نهج التقسيم** | Schema واحد + module-based organization | تبسيط العلاقات بين الوحدات |

### المبادئ الأساسية

1. **نظام Enum للحالات:** جميع الحالات تُدار عبر Enums في Prisma
2. **Soft Delete:** حذف منطقي عبر `isActive` بدلاً من الحذف الفعلي
3. **التدقيق:** AuditLog model يسجل جميع الإجراءات الحرجة
4. **العلاقات:** علاقات واضحة مع indexing للأداء
5. **JSON للبيانات المتغيرة:** استخدام Json? للحقول المتغيرة (details, specifications)

### الكيانات الرئيسية وعلاقاتها

#### 🔐 المصادقة والصلاحيات
```prisma
User --has--> Account (OAuth)
User --has--> Session (JWT)
User --belongs_to--> Organization (via UserOrganization)
User --has--> Role (via UserOrganization.role)

Role --has_many--> Permission (via RolePermission)
Permission --independent--> (key, name, module)
```

#### 👤 المستخدمون والمؤسسات
```prisma
User (role, isVerified, isActive)
Organization (type, isVerified, verificationLevel)
UserOrganization (userId, organizationId, roleId, isPrimary)
```

**خصائص User:**
- `id` (String, CUID)
- `email` (String, Unique)
- `password` (String?, bcrypt hashed)
- `name`, `phone`, `avatar`, `bio`
- `role` (UserRole enum)
- `isVerified`, `isActive`, `emailVerified`
- `mfaEnabled`, `mfaSecret`
- `createdAt`, `updatedAt`

**خصائص Organization:**
- `id` (String, CUID)
- `name`, `nameAr` (نسخة عربية)
- `type` (OrganizationType enum)
- `logo`, `website`, `location`, `about`
- `taxNumber`, `commercialRegister`
- `isVerified`, `verificationLevel`
- `isActive`

#### 🪪 التحقق (KYC/KYB)
```prisma
Verification (userId, organizationId?, type, status, level)
  └── VerificationDocument (docType, fileUrl, fileName, status, expiresAt)
```

**أنواع الوثائق المدعومة (16 نوع):**
`NATIONAL_ID`, `PASSPORT`, `SELFIE`, `ADDRESS_PROOF`, `COMMERCIAL_REGISTER`, `TAX_CERTIFICATE`, `COMPANY_LICENSE`, `BANK_ACCOUNT`, `PROFESSIONAL_CERT`, `ENGINEERING_LICENSE`, `CONTRACTOR_CLASSIFICATION`, `AUTHORIZATION_LETTER`, `VEHICLE_LICENSE`, `OPERATING_PERMIT`, `PORTFOLIO`, `OTHER`

**حالات التحقق:**
`PENDING` → `PARTIALLY_VERIFIED` → `VERIFIED` | `REJECTED` | `SUSPENDED` → `EXPIRED`

#### 📑 المناقصات
```prisma
ProjectTender (title, description, category, location, budgetMin/Max, deadline, attachments[])
  └── ProjectTenderBid (amount, proposal, duration, status)
  
MaterialTender (title, description, materialType, quantity, unit, deliveryDate, location)
  └── MaterialTenderBid (unitPrice, totalPrice, proposal, deliveryTime, status)
```

**حالات المناقصة:** `OPEN` → `CLOSED` | `AWARDED` | `CANCELLED`
**حالات العروض:** `PENDING` → `ACCEPTED` | `REJECTED` | `WITHDRAWN`

#### 🛒 السوق والمتجر
```prisma
Product (name, description, category, price, unit, minQuantity, images[], specifications, inStock, location)
  └── SavedProduct (userId, productId)
```

#### 🏗 المشاريع
```prisma
Project (title, description, category, location, clientName, budget, area, startDate, endDate, images[], status, highlights)
  └── SavedProject (userId, projectId)
```

**حالات المشروع:** `PLANNING` → `IN_PROGRESS` → `COMPLETED` | `ON_HOLD`

#### 💼 التوظيف
```prisma
Job (title, description, category, jobType, salary, salaryMin/Max, location, requirements, benefits, vacancies, isUrgent, isActive)
  ├── JobApplication (coverLetter, cv, status)
  └── SavedJob (userId, jobId)
```

**أنواع الوظائف:** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`

#### 🚚 التوصيل
```prisma
DriverProfile (userId [unique], vehicleType, plateNumber, vehicleBrand/Model/Year/Color, licenseNumber, isAvailable, isApproved, currentLat/Lng, totalDeliveries, totalEarnings, avgRating)
  └── DeliveryOrder (orderNumber [unique], status, priority, paymentMethod, pickupDetails, deliveryDetails, materialType, weight, dimensions, pricing, trackingCode [unique])
       ├── DeliveryStatusHistory (status, note, lat, lng)
       └── DeliveryReview (rating, comment)
```

**حالات التوصيل:** `REQUESTED` → `PENDING_DRIVER` → `DRIVER_ASSIGNED` → `PICKING_UP` → `IN_TRANSIT` → `DELIVERED` | `CANCELLED`
**أنواع المركبات:** `MOTORCYCLE`, `PICKUP`, `TRUCK_SMALL`, `TRUCK_MEDIUM`, `TRUCK_LARGE`, `FLATBED`, `CRANE_TRUCK`

#### 🎓 الأكاديمية
```prisma
Course (title, titleEn, titleUr, description, category, level, price, originalPrice, thumbnail, duration, lessonsCount, studentsCount, rating, instructorId, instructorName, tags[], isPublished, isBestseller, status)
  ├── CourseLesson (title, titleEn, description, lessonType, videoUrl, pdfUrl, duration, orderIndex, isFree)
  ├── CourseEnrollment (userId, courseId, progress, completedLessons, isCompleted, completedAt)
  └── Certificate (title, userId, courseId, enrollmentId [unique], certificateUrl, issuedAt, expiresAt)
```

**مستويات الدورة:** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
**حالة الدورة:** `DRAFT` → `PUBLISHED` | `ARCHIVED`
**أنواع الدروس:** `VIDEO`, `PDF`, `QUIZ`, `ASSIGNMENT`

#### 💬 التواصل الاجتماعي
```prisma
Post (content, type, images[], tags[], likesCount, commentsCount)
  ├── PostComment (content)
  └── PostLike (userId, postId) [unique]

Message (content, senderId, receiverId, isRead)
Notification (title, message, type, isRead, link)
Review (rating, comment, authorId, targetId)
```

### استراتيجية الترقيم القياسي (Indexing)

```prisma
@@index([userId])          // AuditLog, Notifications
@@index([organizationId])  // AuditLog
@@index([action])          // AuditLog
@@index([createdAt])       // AuditLog, جميع models
@@index([courseId, orderIndex]) // CourseLesson
@@unique([userId, organizationId])  // UserOrganization
@@unique([userId, productId])   // SavedProduct
@@unique([userId, projectId])   // SavedProject
@@unique([postId, userId])      // PostLike
@@unique([userId, courseId])    // CourseEnrollment
@@unique([provider, providerAccountId])  // Account
```

---

## 4. نموذج الصلاحيات (RBAC Model)

### الأدوار الأساسية (8 أدوار + مدير)

| الرمز | الدور | الوصف | الصلاحيات الافتراضية |
|---|---|---|---|
| `OWNER` | مالك مشروع | يملك مشاريع ويطرح مناقصات | إنشاء مشاريع، مناقصات، تقييم عروض |
| `CONSULTANT` | استشاري | يقدم استشارات هندسية | الإشراف على المشاريع، تقديم استشارات |
| `CONTRACTOR` | مقاول | ينفذ المشاريع | التقدم للمناقصات، إدارة عمالة |
| `SUBCONTRACTOR` | مقاول فرعي | ينفذ تخصصات محددة | التقدم لمناقصات فرعية |
| `WORKSHOP` | ورشة | تصنيع وتجهيز | عرض منتجات وخدمات |
| `FREELANCER` | مستقل | يقدم خدمات فردية | التقدم لوظائف واستشارات |
| `SUPPLIER` | مورد | يوفر مواد بناء | عرض منتجات، التقدم لمناقصات مواد |
| `TRADER` | تاجر مواد بناء | بيع تجزئة/جملة | عرض منتجات، إدارة مخزون |
| `ADMIN` | مدير المنصة | إدارة النظام | جميع الصلاحيات |

### نظام الصلاحيات داخل المؤسسات (Organization-Level RBAC)

```prisma
model Role {
  id               String
  name             String
  nameAr           String?
  organizationType OrganizationType  // نوع المؤسسة التي ينتمي لها الدور
  isSystem         Boolean           // دور نظامي (لا يمكن حذفه)
  isActive         Boolean
  organizationId   String?           // null للأدوار النظامية
  
  permissions RolePermission[]
  users       UserOrganization[]
}

model Permission {
  id          String
  key         String  @unique  // مثلاً: "tenders:create", "users:manage"
  name        String
  nameAr      String?
  module      String           // مثلاً: "tenders", "users", "projects"
  description String?
}

model RolePermission {
  roleId       String
  permissionId String
  @@unique([roleId, permissionId])
}
```

### نظام الصلاحيات حسب الوحدة

```
Auth Module:     auth:manage, auth:view
Users Module:    users:create, users:edit, users:delete, users:view
Organizations:   orgs:create, orgs:edit, orgs:delete, orgs:view
KYC Module:      kyc:verify, kyc:reject, kyc:view
Tenders Module:  tenders:create, tenders:edit, tenders:delete, tenders:view, tenders:award
Bids Module:     bids:submit, bids:evaluate, bids:accept, bids:reject
Projects Module: projects:create, projects:edit, projects:delete, projects:view
Jobs Module:     jobs:create, jobs:edit, jobs:delete, jobs:view
Marketplace:     products:create, products:edit, products:delete, products:view
Delivery Module: delivery:create, delivery:assign, delivery:track
Academy Module:  courses:create, courses:edit, courses:delete, courses:enroll
Social Module:   posts:create, posts:edit, posts:delete, posts:moderate
Admin Module:    admin:audit, admin:settings, admin:users, admin:roles
```

### سجل التدقيق (Audit Log)

```prisma
model AuditLog {
  action         AuditAction  // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT, VERIFY, etc.
  entity         String       // "User", "Tender", "Bid", "Organization"
  entityId       String?
  details        Json?        // تفاصيل إضافية بصيغة JSON
  ip             String?      // IP المصدر
  userAgent      String?      // معلومات المتصفح
  userId         String?
  organizationId String?
  createdAt      DateTime
}
```

جميع الإجراءات الحرجة تُسجل تلقائياً:
- تسجيل الدخول/الخروج
- إنشاء/تعديل/حذف الكيانات
- الموافقة/الرفض على المناقصات
- التحقق من الوثائق
- تعيين/إلغاء الأدوار
- تقديم العروض
- ترسية المناقصات
- إجراء المدفوعات

---

## 5. تدفقات العمل (Business Workflows)

### 5.1 دورة المشتريات الكاملة (Procurement Workflow)

```
┌─────────────┐     ┌─────────┐     ┌──────────────────┐     ┌──────────────┐
│ Purchase    │────>│   RFQ   │────>│   Supplier       │────>│  Quotations  │
│ Request     │     │         │     │   Matching       │     │  Submission  │
└─────────────┘     └─────────┘     └──────────────────┘     └──────┬───────┘
                                                                   ▼
┌─────────────┐     ┌─────────┐     ┌──────────────────┐     ┌──────────────┐
│   Rating    │<────│ Payment │<────│    Invoice       │<────│    Purchase  │
│   & Review  │     │         │     │                  │     │    Order     │
└─────────────┘     └─────────┘     └──────────────────┘     └──────┬───────┘
                                                                   ▼
                                                              ┌──────────────┐
                                                              │   Delivery   │
                                                              │   & Receipt  │
                                                              └──────────────┘
```

**الخطوات التفصيلية:**

1. **Purchase Request:** المنشئ ينشئ طلب شراء مع المواصفات والكمية والمدة الزمنية
2. **RFQ (Request for Quotation):** تحويل طلب الشراء إلى طلب عروض أسعار
3. **Supplier Matching:** النظام يطابق طلب الشراء مع الموردين المناسبين تلقائياً
4. **Quotations:** الموردون يقدمون عروض أسعار مع تفاصيل التسليم
5. **Evaluation:** تقييم العروض بناءً على السعر، الجودة، وقت التسليم، التقييمات
6. **Award:** ترسية المناقصة على أفضل عرض
7. **Purchase Order:** إنشاء أمر شراء رسمي
8. **Delivery:** استلام المواد والتأكد من مطابقتها للمواصفات
9. **Invoice:** إصدار الفاتورة
10. **Payment:** الدفع (نقداً، بطاقة، تحويل، ضمان بنكي)
11. **Rating:** تقييم المورد وإغلاق دورة المشتريات

### 5.2 دورة المناقصات (Tendering Workflow)

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐     ┌────────────────┐
│  Tender         │────>│  Bids        │────>│  Bid           │────>│  Awarded      │────>│  Project       │
│  Published      │     │  Submitted   │     │  Evaluation    │     │               │     │  Started       │
└─────────────────┘     └──────────────┘     └────────────────┘     └──────────────┘     └────────────────┘
       │                      │                      │                      │
       ▼                      ▼                      ▼                      ▼
  • اختيار التصنيف      • تقديم عرض سعر      • لجنة التقييم        • توقيع العقد
  • تحديد الميزانية     • تقديم عرض فني      • مقارنة العروض       • دفع الدفعة الأولى
  • تحديد الموعد        • إرفاق المستندات    • فحص المؤهلات        • استلام الموقع
  • نشر المناقصة                               • المقابلات
```

### 5.3 دورة التوظيف (Jobs Workflow)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────┐
│  Job Posted  │────>│  Applications    │────>│  Shortlisting │────>│  Interviewing  │────>│  Hiring  │
│  (صاحب العمل) │     │  Received        │     │  (تصفية أولية) │     │  (مقابلات)     │     │  (تعيين) │
└─────────────┘     └──────────────────┘     └──────────────┘     └────────────────┘     └──────────┘
       │                      │                      │                      │
       ▼                      ▼                      ▼                      ▼
  • وصف الوظيفة         • سيرة ذاتية         • فحص المؤهلات        • مقابلة شخصية      • عرض وظيفي
  • المسمي والمهام      • خطاب تغطية         • اختبارات عملية      • مقابلة أونلاين    • قبول العرض
  • الراتب والمزايا     • حفظ التقدم          • المقارنة                              • توقيع العقد
  • نشر الإعلان
```

### 5.4 دورة الأكاديمية (Academy Workflow)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Course       │────>│  Published   │────>│  Student Enrolls │────>│  Completes       │────>│  Certificate     │
│  Created      │     │              │     │                  │     │  Lessons         │     │  Issued          │
└──────────────┘     └──────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
       │                      │                      │                      │
       ▼                      ▼                      ▼                      ▼
  • إنشاء المحتوى       • مراجعة المحتوى     • دفع الرسوم        • مشاهدة الدروس     • تقييم الدورة
  • رفع الفيديوهات      • الموافقة على       • متابعة التقدم      • حل الاختبارات     • شهادة معتمدة
  • إضافة الاختبارات      النشر              • إتمام الدروس      • إنهاء الدورة       • مشاركة الشهادة
  • تحديد السعر
```

### 5.5 دورة التوصيل (Delivery Workflow)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Order       │────>│  Driver           │────>│  Pickup          │────>│  In Transit  │
│  Requested   │     │  Assigned         │     │                  │     │              │
└──────────────┘     └──────────────────┘     └──────────────────┘     └──────┬───────┘
       │                      │                      │                      │
       ▼                      ▼                      ▼                      ▼
  • تحديد المواقع      • إشعار للسائق       • تأكيد الاستلام     • تتبع لحظي
  • اختيار نوع         • قبول الطلب         • تسجيل صورة         • تحديث الموقع
    المركبة                                                         عبر GPS
  • السعر الفوري                                                  • إشعار للمستلم
                                                                    ▼
                                                              ┌──────────────┐
                                                              │  Delivered   │
                                                              │  & Rated     │
                                                              └──────────────┘
```

---

## 6. هندسة التكامل (Integration Architecture)

### 6.1 العمارة التقنية الحالية

```
                    ┌─────────────────────────────────────┐
                    │         Next.js 16 App Router        │
                    │         (Full-stack Framework)        │
                    ├─────────────────────────────────────┤
                    │  Server Components  |  Client Pages   │
                    │  (API Routes)       |  ("use client") │
                    ├─────────────────────────────────────┤
                    │         NextAuth v5 (JWT)             │
                    ├─────────────────────────────────────┤
                    │         Prisma ORM                    │
                    ├─────────────────────────────────────┤
                    │         PostgreSQL                    │
                    └─────────────────────────────────────┘
```

### 6.2 واجهات API

**نمط RESTful داخل Next.js App Router:**
```
/api/auth/*          → NextAuth handlers (login, register, OAuth)
/api/tenders/*       → مناقصات (CRUD + bidding)
/api/projects/*      → مشاريع (CRUD)
/api/jobs/*          → وظائف (CRUD + applications)
/api/applications/*  → طلبات التوظيف
/api/courses/*       → دورات تدريبية
/api/enrollments/*   → تسجيلات الطلاب
/api/delivery/*      → طلبات التوصيل
/api/marketplace/*   → منتجات السوق
/api/organizations/* → إدارة المؤسسات
/api/permissions/*   → إدارة الصلاحيات
/api/verifications/* → التحقق من الهوية
/api/admin/*         → لوحة الإدارة (audit-log, verifications)
/api/seed/*          → بيانات تجريبية
```

### 6.3 التكاملات الخارجية (مخطط)

| النظام | نوع التكامل | الحالة | الوصف |
|---|---|---|---|
| **SAP** | REST API | 🔜 مخطط | تكامل مع أنظمة SAP ERP لإدارة المشتريات |
| **Oracle** | REST API | 🔜 مخطط | تكامل مع Oracle ERP Cloud |
| **Odoo** | XML-RPC/REST | 🔜 مخطط | تكامل مع Odoo ERP مفتوح المصدر |
| **ERPNext** | REST API | 🔜 مخطط | تكامل مع ERPNext |
| **Microsoft Dynamics** | REST API | 🔜 مخطط | تكامل مع Dynamics 365 |
| **WhatsApp Business** | Cloud API | 🔜 مخطط | إشعارات وتواصل مع العملاء |
| **Twilio** | REST API | 🔜 مخطط | رسائل SMS وإشعارات |
| **Google Maps** | JavaScript API | ✅ مستخدم | خرائط، تحديد مواقع، تتبع التوصيل |
| **Leaflet** | OpenStreetMap | ✅ مستخدم | بديل مفتوح المصدر للخرائط |

### 6.4 بوابات الدفع (مخطط)

| البوابة | المنطقة | الحالة | الميزات |
|---|---|---|---|
| **Escrow.com** | عالمي | 🔜 مخطط | دفع آمن لحساب الضمان |
| **Stripe** | عالمي | 🔜 مخطط | بطاقات ائتمان، Apple Pay، Google Pay |
| **Checkout.com** | عالمي | 🔜 مخطط | مدفوعات متعددة العملات |
| **PayTabs** | الشرق الأوسط | 🔜 مخطط | بوابات دفع عربية |
| **HyperPay** | الشرق الأوسط | 🔜 مخطط | مدفوعات متوافقة مع الشريعة |
| **Urway** | السعودية | 🔜 مخطط | مدفوعات محلية |
| **Tabby / Tamara** | السعودية | 🔜 مخطط | شراء الآن وادفع لاحقاً |

### 6.5 تخزين الملفات

```
Local Development:  /public/uploads/
Production:         AWS S3 Bucket (أو Storage Provider)
المستخدمات:
  • صور المستخدمين (avatars)
  • شعارات المؤسسات
  • صور المنتجات والمشاريع
  • وثائق التحقق (KYC/KYB)
  • مرفقات المناقصات
  • فيديوهات وملفات PDF للدورات
  • شهادات الإتمام
```

---

## 7. خارطة الطريق (Roadmap)

### Phase 1: الأساسيات والتجارة (الحالي - Q3 2026)

| الميزة | الحالة |
|---|---|
| ✅ المصادقة والأدوار (Auth & RBAC) | ✅ مكتمل |
| ✅ المستخدمون والمؤسسات | ✅ مكتمل |
| ✅ مناقصات المشاريع والمواد | ✅ مكتمل |
| ✅ نظام المزايدة | ✅ مكتمل |
| ✅ عرض المشاريع | ✅ مكتمل |
| ✅ سوق البضائع (أساسي) | 🔧 قيد التطوير |
| ✅ خدمة التوصيل | ✅ مكتمل |
| ✅ الأكاديمية والتدريب | ✅ مكتمل |
| ✅ التوظيف | ✅ مكتمل |
| 🔧 التحقق من الهوية (KYC/KYB) | 🔧 قيد التطوير |
| 🔧 المشتريات الأساسية (Procurement Core) | 🔜 بدء التطوير |
| 🔧 المساعد الذكي (AI) - أساسي | 🔜 بدء التطوير |

### Phase 2: المهن والتقييم (Q4 2026)

| الميزة | الوصف |
|---|---|
| 💼 **الملفات المهنية المتقدمة** | سيرة ذاتية، محفظة أعمال، شهادات |
| ⭐ **نظام التقييم والتصنيف** | تقييم المقاولين والموردين والمستقلين |
| 📊 **لوحات الإحصائيات** | إحصائيات لكل دور (مالك، مقاول، مورد) |
| 🔔 **نظام الإشعارات المتقدم** | إشعارات فورية، بريد إلكتروني، SMS |
| 📋 **تقارير الأداء** | تقارير للمقاولين والموردين |
| 🤝 **عقود رقمية** | توثيق عقود إلكترونية بين الأطراف |

### Phase 3: المجتمع والمعرفة (Q1 2027)

| الميزة | الوصف |
|---|---|
| 💬 **شبكة التواصل الاجتماعي** | منشورات، تعليقات، إعجابات |
| 👥 **المجتمعات التخصصية** | مجموعات حسب التخصص والمنطقة |
| 📚 **مركز المعرفة** | مكتبة رقمية للمواصفات والكودات |
| 🏆 **الفعاليات والمؤتمرات** | تنظيم وحضور فعاليات إنشائية |
| 📺 **البث المباشر** | ورش عمل وندوات عبر الإنترنت |
| 🎯 **التوصيات الذكية** | توصيات حسب الاهتمامات والتخصص |

### Phase 4: التكامل المتقدم (Q2-Q3 2027)

| الميزة | الوصف |
|---|---|
| 💳 **المدفوعات** | تكامل بوابات الدفع، محفظة رقمية |
| 🛡️ **التأمين** | تأمين مشاريع، تأمين مقاولين |
| 🚜 **تأجير المعدات** | منصة لتأجير الآلات والمعدات |
| 🔗 **تكامل ERP** | SAP, Oracle, Odoo, ERPNext, Dynamics |
| 📊 **تحليلات متقدمة (BI)** | ذكاء أعمال، تنبؤات، تقارير مخصصة |
| 🤖 **AI متقدم** | تحليل BOQ ذكي، مطابقة ذكية، مساعد صوتي |

---

## 8. معايير التطوير (Development Standards)

### 8.1 التقنيات المعتمدة

| المجال | التقنية | الإصدار |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.x |
| **اللغة** | TypeScript (strict mode) | 5.x |
| **قاعدة البيانات** | PostgreSQL | 16.x |
| **ORM** | Prisma | 7.x |
| **المصادقة** | NextAuth v5 | 5.x |
| **التنسيق** | Tailwind CSS | 4.x |
| **الأيقونات** | Lucide React | 1.x |
| **الخرائط** | Leaflet + React-Leaflet | 5.x |
| **التحقق** | Zod | 4.x |
| **البيانات** | TanStack React Query | 5.x |
| **التواريخ** | date-fns | 4.x |
| **التشفير** | bcryptjs | 3.x |

### 8.2 هيكل المجلدات

```
src/
├── app/                          # صفحات التطبيق (Next.js App Router)
│   ├── api/                      # API route handlers
│   ├── auth/                     # صفحات المصادقة
│   ├── tenders/                  # صفحات المناقصات
│   ├── projects/                 # صفحات المشاريع
│   ├── jobs/                     # صفحات التوظيف
│   ├── delivery/                 # صفحات التوصيل
│   ├── marketplace/              # صفحات السوق
│   ├── training/                 # صفحات الأكاديمية
│   ├── organization/             # صفحات المؤسسات
│   ├── verification/             # صفحات التحقق
│   ├── admin/                   # لوحة الإدارة
│   ├── layout.tsx                # التخطيط الرئيسي
│   ├── page.tsx                  # الصفحة الرئيسية
│   ├── globals.css               # الأنماط العامة
│   └── Providers.tsx             # مزودات التطبيق
├── components/                   # مكونات مشتركة
│   ├── Navbar.tsx
│   ├── AuthProvider.tsx
│   ├── SearchFilter.tsx
│   ├── ui.tsx
│   └── ...
├── lib/                          # مكتبات مساعدة
│   ├── auth.ts                   # إعدادات NextAuth
│   ├── prisma.ts                 # اتصال Prisma
│   ├── constants.ts              # الثوابت والأدوار والحالات
│   ├── translations.ts           # ملف الترجمة (ar, en, ur)
│   ├── LanguageContext.tsx        # سياق اللغة
│   └── utils.ts                  # دوال مساعدة
└── generated/                    # ملفات مولدة
    └── prisma/                   # Prisma Client
```

### 8.3 معايير الترميز

#### المبادئ الأساسية

1. **TypeScript Strict Mode:** تفعيل strict في tsconfig.json
2. **Server Components أولاً:** استخدام Server Components ما لم تكن هناك حاجة للتفاعل
3. **"use client" للتفاعل:** فقط الصفحات التي تحتاج JavaScript تُعلن كـ Client Component
4. **RTL-First Design:** التصميم يستهدف العربية كلغة أساسية (direction: rtl)
5. **رسائل الخطأ بالعربية:** جميع رسائل الخطأ للمستخدم تكون بالعربية
6. **التعليقات:** لا توجد تعليقات في الكود - الكود واضح بذاته

#### اصطلاحات التسمية

```
المجلدات:    kebab-case  (tender-market, project-tenders)
الملفات:     kebab-case  (auth.ts, constants.ts, page.tsx)
المكونات:    PascalCase  (Navbar.tsx, SearchFilter.tsx)
المتغيرات:   camelCase   (userId, isActive)
الثوابت:     UPPER_CASE  (ROLES, TENDER_STATUS)
الدوال:      camelCase   (getUser, fetchTenders)
الأنواع:     PascalCase  (UserRole, TenderStatus)
واجهات API:  kebab-case  (/api/tenders/projects)
```

#### 8.4 نظام الترجمة (i18n)

```typescript
// src/lib/translations.ts
// يدعم 3 لغات: ar (العربية - أساسي), en (الإنجليزية), ur (الأردية)

export const translations = {
  ar: { tendersTitle: "مناقصات المشاريع الحية", ... },
  en: { tendersTitle: "Live Project Bids", ... },
  ur: { tendersTitle: "لائیو پروجیکٹ ٹینڈرز", ... },
}

// الاستخدام في المكونات:
import { translations } from "@/lib/translations"
import { useLanguage } from "@/lib/LanguageContext"

const { language } = useLanguage()
const t = translations[language]
// t.tendersTitle → "مناقصات المشاريع الحية"
```

#### 8.5 إدارة الحالات (State Management)

```
حالة الخادم:    Prisma Direct (Server Components)
حالة العميل:    TanStack React Query (للبيانات من API)
حالة واجهة:     React useState/useReducer
السياق:         React Context (اللغة, المصادقة)
المزامنة:       Server Actions (للعمليات البسيطة)
```

#### 8.6 معايير الأداء

1. **الصور:** استخدام تنسيق WebP، تحميل كسول (lazy loading)
2. **API Routes:** تقليل حجم الاستجابة، pagination لجميع القوائم
3. **Database Queries:** استخدام Prisma `select` لتحديد الحقول فقط
4. **Caching:** استخدام Next.js `revalidate` و `cache` للبيانات الثابتة
5. **Code Splitting:** التحميل الديناميكي للمكونات الثقيلة (الخرائط)
6. **RSC (React Server Components):** تقليل JavaScript المرسل للعميل

---

## 9. هيكل الوحدة النمطية (Module Template)

### الهيكل القياسي لكل وحدة

```
Module/                           # مثال: Tenders/
├── prisma/                       # نموذج البيانات (في schema.prisma الموحد)
│   └── schema.prisma             # ProjectTender, ProjectTenderBid, ...
│
├── api/                          # Route Handlers
│   └── route.ts                  # GET, POST, PUT, DELETE
│
├── app/                          # صفحات الوحدة
│   ├── page.tsx                  # القائمة / العرض الرئيسي
│   ├── new/page.tsx              # إنشاء جديد
│   ├── [id]/page.tsx             # عرض التفاصيل
│   └── [id]/edit/page.tsx        # تعديل
│
├── lib/                          # منطق الوحدة
│   ├── actions.ts                # Server Actions
│   ├── queries.ts                # استعلامات Prisma
│   ├── types.ts                  # أنواع خاصة بالوحدة
│   └── validations.ts            # تحقق Zod
│
├── components/                   # مكونات واجهة المستخدم
│   ├── Card.tsx                  # بطاقة عرض
│   ├── Form.tsx                  # نموذج إدخال
│   ├── List.tsx                  # قائمة
│   └── Filters.tsx               # فلاتر البحث
│
├── permissions/                  # صلاحيات الوحدة
│   └── seeds.ts                  # بيانات صلاحيات الوحدة
│
├── notifications/                # الإشعارات والتنبيهات
│   ├── templates.ts              # قوالب الإشعارات
│   └── alerts.ts                 # تنبيهات البريد
│
├── audit/                        # سجل التدقيق
│   └── logger.ts                 # دوال تسجيل الإجراءات
│
└── dashboard/                    # عناصر لوحة التحكم
    ├── StatsCard.tsx             # بطاقة إحصائية
    ├── Chart.tsx                 # رسم بياني
    └── Widget.tsx                # عنصر واجهة
```

### مثال تطبيقي على هيكل وحدة Tenders

```
src/
├── app/
│   ├── api/
│   │   └── tenders/
│   │       ├── projects/
│   │       │   ├── route.ts              # GET/POST /api/tenders/projects
│   │       │   └── [id]/
│   │       │       ├── route.ts          # GET/PUT/DELETE /api/tenders/projects/:id
│   │       │       └── bids/
│   │       │           └── route.ts      # POST /api/tenders/projects/:id/bids
│   │       └── materials/
│   │           └── ... (نفس الهيكل)
│   └── tenders/
│       ├── projects/
│       │   ├── page.tsx                  # قائمة مناقصات المشاريع
│       │   ├── new/page.tsx              # إنشاء مناقصة جديدة
│       │   └── [id]/
│       │       ├── page.tsx              # تفاصيل المناقصة
│       │       └── bids/
│       │           └── new/page.tsx      # تقديم عرض
│       └── materials/
│           └── ... (نفس الهيكل)
```

### قواعد إنشاء وحدة جديدة

1. **إضافة النماذج:** إضافة models في `prisma/schema.prisma` مع التعليقات
2. **تشغيل الترحيل:** `npx prisma migrate dev --name module_name`
3. **API Routes:** إنشاء endpoints في `src/app/api/module_name/`
4. **الصفحات:** إنشاء الصفحات في `src/app/module_name/`
5. **الصلاحيات:** إضافة records في جدول Permission
6. **الترجمة:** إضافة مفردات جديدة في `translations.ts`
7. **الثوابت:** إضافة أي ثوابت جديدة في `constants.ts`
8. **التدقيق:** ربط الإجراءات الحرجة مع AuditLog

---

## الملحق: تشغيل البيئة التطويرية

```bash
# تثبيت الاعتماديات
npm install

# إعداد متغيرات البيئة (نسخ من .env.example)
cp .env.example .env
# تعديل DATABASE_URL و AUTH_SECRET

# تشغيل ترحيل قاعدة البيانات
npx prisma migrate dev

# تشغيل خادم التطوير
npm run dev

# بناء للإنتاج
npm run build

# فحص الكود
npm run lint
```

### متغيرات البيئة الأساسية

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## الملحق: فهرس قاعدة البيانات

| الجدول | الوحدة | الوصف | عدد الحقول |
|---|---|---|---|
| User | Auth/Users | المستخدمون | 24 |
| Account | Auth | حسابات OAuth | 10 |
| Session | Auth | جلسات المستخدمين | 5 |
| Organization | Orgs | المؤسسات | 17 |
| UserOrganization | Orgs | ربط المستخدمين بالمؤسسات | 7 |
| Role | RBAC | الأدوار | 9 |
| Permission | RBAC | الصلاحيات | 6 |
| RolePermission | RBAC | ربط الأدوار بالصلاحيات | 3 |
| Verification | KYC | طلبات التحقق | 9 |
| VerificationDocument | KYC | وثائق التحقق | 8 |
| AuditLog | Admin | سجل التدقيق | 9 |
| ProjectTender | Tenders | مناقصات المشاريع | 14 |
| ProjectTenderBid | Tenders | عروض مناقصات المشاريع | 8 |
| MaterialTender | Tenders | مناقصات المواد | 13 |
| MaterialTenderBid | Tenders | عروض مناقصات المواد | 8 |
| Product | Marketplace | المنتجات | 13 |
| SavedProduct | Marketplace | المنتجات المحفوظة | 3 |
| Project | Projects | المشاريع | 16 |
| SavedProject | Projects | المشاريع المحفوظة | 3 |
| Job | Jobs | الوظائف | 16 |
| JobApplication | Jobs | طلبات التوظيف | 7 |
| SavedJob | Jobs | الوظائف المحفوظة | 3 |
| Post | Social | المنشورات | 9 |
| PostComment | Social | التعليقات | 5 |
| PostLike | Social | الإعجابات | 4 |
| Message | Social | الرسائل | 6 |
| Notification | Social | الإشعارات | 7 |
| Review | Social | التقييمات | 6 |
| Course | Academy | الدورات | 22 |
| CourseLesson | Academy | الدروس | 12 |
| CourseEnrollment | Academy | التسجيلات | 9 |
| Certificate | Academy | الشهادات | 8 |
| DriverProfile | Delivery | ملفات السائقين | 18 |
| DeliveryOrder | Delivery | طلبات التوصيل | 38 |
| DeliveryStatusHistory | Delivery | سجل حالات التوصيل | 7 |
| DeliveryReview | Delivery | تقييمات التوصيل | 6 |

---

**نهاية وثيقة العمارة الفنية**  
© 2026 ABC Platform - All About Constructions  
هذه الوثيقة هي المرجع الأساسي لجميع عمليات التطوير. يجب تحديثها عند إضافة أي وحدة أو تغيير جوهري في العمارة.
