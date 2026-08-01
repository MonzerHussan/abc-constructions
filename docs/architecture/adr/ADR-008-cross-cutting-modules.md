# ADR-008: Cross-Cutting Modules

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
بعض الـ Domains تُستخدم من قبل جميع Domains أخرى (Notification, Workflow, Rules, Storage, Search مدعومة بـ Core). بدلاً من حشرها في Core Domain أو تكرارها في كل Domain، ننشئ Modules مستقلة.

## القرار

### الـ Cross-Cutting Modules

| Module | المسؤولية | الخدمات |
|--------|-----------|---------|
| **Notification** | إرسال الإشعارات عبر القنوات | Email, SMS, Push, In-App, Telegram |
| **Workflow** | محرك سير العمل | تعريف مراحل الموافقة، تنفيذ السير، تتبع الحالة |
| **Rules** | محرك القواعد | تقييم القواعد (إذا X تحقق Y)، Business Rules Engine |
| **Storage** | إدارة الملفات | رفع، تحويل، CDN، توليد روابط مؤقتة |
| **Search** | محرك البحث | Full-Text Search, Filtering, Indexing |
| **Analytics** | التحليلات والتقارير | Events, Dashboards, Reports |
| **Audit** | التدقيق | سجل الأحداث، تغييرات البيانات (مدمج مع Core) |

### كيف تستخدمها الـ Domains

```
ProcurementService.createPurchaseOrder()
    ↓
  EventBus.publish('procurement.po.created')
    ↓
  NotificationEventHandler → sends email
  WorkflowEventHandler → starts approval flow
  RulesEventHandler → checks budget limits
```

### الاعتماديات
- **Notification** ← Core (User, Org), Storage (Templates)
- **Workflow** ← Core (User, Org, RBAC)
- **Rules** ← Core (User, Org)
- **Analytics** ← كل الـ Domains (مصدر بيانات)
- **Search** ← كل الـ Domains (مصدر بيانات)

### لا يُسمح بـ
- Cross-Cutting Module يستورد من Domain معين (مثل Procurement)
- Notification يقرأ من جداول Procurement مباشرة
