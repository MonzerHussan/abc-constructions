# ADR-009: Observability — Logging, Metrics, Tracing, Health Checks

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
منصة تعيش 10 سنوات تحتاج رؤية واضحة لأداء التطبيق وحالته الصحية حتى في المراحل الأولى. نبدأ بسيطاً ثم نوسع.

## القرار

### 1. Logging (Pino)
```typescript
// src/modules/shared/utils/logger.ts
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Usage in Services
logger.info({ domain: 'procurement', action: 'po.created', poId }, 'Purchase Order created');
logger.error({ err, domain: 'procurement', poId }, 'Failed to create Purchase Order');
```

### 2. Structured Logging Format
```json
{
  "level": "info",
  "time": "2026-07-30T12:00:00Z",
  "msg": "Purchase Order created",
  "domain": "procurement",
  "action": "po.created",
  "poId": "po_xxx",
  "correlationId": "corr_xxx",
  "requestId": "req_xxx",
  "userId": "user_xxx"
}
```

### 3. Health Checks
```typescript
// GET /api/v1/health
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy", "latency": "2ms" },
    "storage": { "status": "healthy" },
    "redis": { "status": "skipped" }
  },
  "uptime": 3600,
  "version": "1.0.0"
}
```

### 4. Metrics (بسيطة)
- Counters: عدد الطلبات، عدد الأخطاء، عدد الأحداث
- Timers: زمن استجابة APIs، زمن معالجة Events
- Gauges: عدد المستخدمين النشطين

### 5. Tracing (مستقبلاً)
- إضافة OpenTelemetry في المرحلة القادمة
- حالياً: `correlationId` يمر عبر جميع الطبقات

### 6. Feature Flags
```typescript
// src/modules/shared/utils/feature-flags.ts
const features = {
  newProcurementFlow: process.env.FF_NEW_PROCUREMENT === 'true',
  aiSuggestions: process.env.FF_AI_SUGGESTIONS === 'true',
};
```
