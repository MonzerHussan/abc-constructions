# ADR-006: API Standards — Response Envelope, Pagination, Error Codes

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
توحيد شكل الـ API Responses وطريقة التعامل مع الأخطاء والصفحات يضمن اتساق الواجهة بين جميع الـ Domains.

## القرار

### 1. Response Envelope
كل API Response يستخدم الشكل التالي:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-30T12:00:00Z",
    "requestId": "req_xxx"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "PURCHASE_REQUEST_NOT_FOUND",
    "message": "طلب الشراء غير موجود",
    "details": { "id": "pr_xxx" }
  },
  "meta": {
    "timestamp": "2026-07-30T12:00:00Z",
    "requestId": "req_xxx"
  }
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": { ... }
}
```

### 2. Error Code Format
`{DOMAIN}_{ENTITY}_{ISSUE}` — كل الأحرف كبيرة. مثال:
- `CORE_USER_NOT_FOUND`
- `PROCUREMENT_PO_ALREADY_APPROVED`
- `TENDERS_BID_EXPIRED`

### 3. HTTP Status Codes
- `200` — النجاح
- `201` — إنشاء
- `400` — خطأ في الإدخال (Validation)
- `401` — غير مصادق
- `403` — غير مصرح
- `404` — غير موجود
- `409` — تعارض (مثل طلب مكرر)
- `422` — خطأ في منطق الأعمال
- `500` — خطأ في الخادم

### 4. Pagination
- `page` يبدأ من 1
- `limit` الافتراضي 20، الحد الأقصى 100
- `sort` بصيغة `field:direction` مثال `createdAt:desc`
- `filter` كـ Query Parameters
