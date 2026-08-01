# ADR-011: Event Catalog — المسجل الرسمي للأحداث

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
مع تزايد الـ Events، يجب وجود سجل رسمي لكل Event: اسمه، Payload، ومتى يُنشر. هذا يمنع التضارب ويسهل الصيانة.

## القرار
كل Event يُوثق في هذا ADR.

### Core Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `core.user.created` | إنشاء مستخدم جديد | بعد تسجيل مستخدم جديد | userId, email, name |
| `core.user.updated` | تحديث بيانات مستخدم | بعد تعديل الملف الشخصي | userId, changes |
| `core.user.deleted` | حذف مستخدم | بعد حذف حساب | userId |
| `core.org.created` | إنشاء مؤسسة جديدة | بعد تسجيل مؤسسة | orgId, name, ownerId |

### Procurement Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `procurement.pr.created` | إنشاء طلب شراء | بعد تقديم PR | prId, orgId, items, totalAmount |
| `procurement.pr.submitted` | تقديم PR للموافقة | بعد رفع PR | prId, submittedBy |
| `procurement.pr.approved` | الموافقة على PR | بعد موافقة المشرف | prId, approvedBy |
| `procurement.pr.rejected` | رفض PR | بعد رفض المشرف | prId, rejectedBy, reason |
| `procurement.pr.converted` | تحويل PR إلى RFQ | بعد بدء التوريد | prId, rfqId |
| `procurement.rfq.created` | إنشاء طلب عرض سعر | بعد إنشاء RFQ | rfqId, items, deadline |
| `procurement.rfq.quotation-received` | استلام عرض سعر | بعد تقديم مورد | rfqId, quotationId, supplierId, amount |
| `procurement.po.created` | إنشاء أمر شراء | بعد الترسية | poId, supplierId, items, totalAmount |
| `procurement.po.approved` | الموافقة على PO | بعد موافقة管理层 | poId, approvedBy |
| `procurement.gr.created` | إيصال استلام | بعد استلام المواد | grId, poId, items, receivedBy |
| `procurement.invoice.received` | استلام فاتورة | بعد رفع الفاتورة | invoiceId, poId, amount |
| `procurement.invoice.paid` | دفع فاتورة | بعد تأكيد الدفع | invoiceId, poId, amount, paidAt |

### Tenders Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `tenders.tender.created` | إنشاء مناقصة | بعد نشر مناقصة | tenderId, type, deadline |
| `tenders.tender.awarded` | ترسية مناقصة | بعد اختيار الفائز | tenderId, winnerId, amount |

### Marketplace Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `marketplace.product.created` | إضافة منتج | بعد رفع منتج جديد | productId, supplierId, categoryId |
| `marketplace.product.price-updated` | تحديث سعر | بعد تغيير السعر | productId, oldPrice, newPrice |

### Project Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `projects.project.created` | إنشاء مشروع | بعد إضافة مشروع | projectId, name, budget |

### Social Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `social.message.sent` | إرسال رسالة | بعد إرسال رسالة | messageId, from, to, content |
| `social.post.created` | إنشاء منشور | بعد نشر منشور | postId, authorId, content |

### Notification Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `notification.email.sent` | إرسال إيميل | بعد إرسال إيميل | to, subject, status |
| `notification.sms.sent` | إرسال SMS | بعد إرسال رسالة | to, status |
| `notification.push.sent` | إرسال إشعار | بعد إرسال Push | userId, title, status |

### AI Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `ai.analysis.completed` | اكتمال تحليل | بعد معالجة AI | analysisId, type, result |
| `ai.ocr.completed` | اكتمال OCR | بعد معالجة مستند | documentId, text, confidence |

### Audit Events
| الحدث | المعنى | يحدث عندما | Payload |
|-------|--------|-----------|---------|
| `audit.log.created` | تسجيل حدث | أي تغيير في البيانات | entity, entityId, action, userId, changes |
