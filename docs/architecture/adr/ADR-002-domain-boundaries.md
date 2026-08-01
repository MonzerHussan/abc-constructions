# ADR-002: Domain Architecture — 16 Bounded Contexts

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
لتطبيق Domain-Driven Design (DDD) يجب تحديد Bounded Contexts واضحة. كل Domain يمثل منطقة مسؤولية محددة، ويمتلك نماذج البيانات (Prisma Models) الخاصة به.

## الـ Domains المعتمدة

| # | Domain | المسؤولية | الموديلات المملوكة |
|---|--------|-----------|-------------------|
| 1 | **Core** | هوية، صلاحيات، مصادقة، تدقيق | User, Organization, UserOrganization, Role, Permission, RolePermission, AuditLog, Settings |
| 2 | **Tenders** | مناقصات المشاريع والمواد | ProjectTender, ProjectTenderBid, MaterialTender, MaterialTenderBid |
| 3 | **Marketplace** | سوق المنتجات والفئات والعلامات | Product, MaterialCategory, MaterialSubcategory, Brand, Tag |
| 4 | **Procurement** | المشتريات (PR → RFQ → PO → Invoice → Payment) | PurchaseRequest, RFQ, Quotation, Award, PurchaseOrder, GoodsReceipt, Invoice, Payment, SupplierRating |
| 5 | **Projects** | عرض المشاريع | Project, SavedProject |
| 6 | **Jobs** | التوظيف | Job, JobApplication, SavedJob |
| 7 | **Delivery** | التوصيل | DriverProfile, DeliveryOrder, DeliveryStatusHistory, DeliveryReview |
| 8 | **Training** | التدريب | Course, CourseLesson, CourseEnrollment, Certificate |
| 9 | **Research** | الأبحاث والاستبيانات | ResearchCampaign, Survey, SurveyResponse, FeatureRequest, AiInsight, وغيرها (25 موديل) |
| 10 | **CRM** | إدارة العملاء | Lead, CrmContact, Opportunity, CrmActivity |
| 11 | **Social** | تفاعل المستخدمين | Post, Message, Notification, Review |
| 12 | **Notification** | الإشعارات (منفصل عن Social) | Notification (قد يكون مشتركاً مع Social) |
| 13 | **AI** | الذكاء الاصطناعي | AiInsight (مملوك حالياً لـ Research، سيتم نقله) |
| 14 | **Workflow** | محرك سير العمل | WorkflowDefinition, WorkflowInstance |
| 15 | **Rules** | محرك القواعد | RuleDefinition, RuleEvaluation |
| 16 | **Analytics** | التحليلات والتقارير | AnalyticsEvent, Dashboard |

## قواعد حديدية
1. **كل Entity مملوك لـ Domain واحد فقط.** لا يمكن Domainين امتلاك نفس الـ Entity.
2. **إذا احتاج Domain بيانات من Domain آخر:** عبر Service Interface أو Event فقط.
3. **ممنوع استيراد Prisma Model من Domain آخر.** ممنوع `prisma.purchaseRequest` داخل Tenders.
4. **Core Domain هو الوحيد الذي يتعامل مع User/Org/RBAC مباشرة.**
5. **الـ Domains الـ 16 هي الحد الأقصى.** لا يسمح بإنشاء Domain جديد دون ADR.

## القرار
اعتماد 16 Bounded Contexts وفق الجدول أعلاه.

## النتائج
- **إيجابي:** عزل كامل للمسؤوليات، وضوح في ملكية البيانات، سهولة توزيع العمل على فرق
- **سلبي:** يحتاج انضباطاً في التطوير لمنع الاختراقات بين الـ Domains
- **محايد:** بعض الـ Domains (Social, Notification) قد تندمج لاحقاً

## بدائل مستقبلية
- يمكن دمج Social + Notification إذا ثبت أنهما Domain واحد
- يمكن استخراج AI كـ Domain منفصل بمجرد بدء التكامل الفعلي
