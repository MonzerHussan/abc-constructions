# ADR-004: Event Bus — Event-Driven Communication

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
الـ Domains تحتاج للتواصل دون اقتران مباشر. مثال: بعد إصدار PurchaseOrder، يجب إرسال إشعار، تحديث الميزانية، وربما بدء Workflow. الخيارات:
1. **استدعاء مباشر** — Procurement Service يستدعي Notification Service مباشرة
2. **Event Bus** — Procurement ينشر حدث `PO.Created` ويستقبله Notification, Budget, Workflow

## القرار
اعتمدنا **Event Bus مع واجهة مجردة** بحيث:
- **البداية:** Node.js EventEmitter داخلي (بسيط، لا يحتاج بنية تحتية)
- **المستقبل:** يمكن التبديل إلى RabbitMQ أو Kafka دون تغيير كود المصدر

### الـ واجهة المجردة

```typescript
interface IEventBus {
  publish(event: IEvent): Promise<void>;
  subscribe(eventName: string, handler: IEventHandler): void;
}

interface IEvent {
  name: string;
  payload: unknown;
  metadata: {
    timestamp: Date;
    correlationId: string;
    source: string;
  };
}
```

### Event Naming Convention
`{Domain}.{Entity}.{Action}` — مثال: `procurement.purchase-order.created`

### القواعد
- **Event واحد ← Handler واحد مسؤول عن مهمة محددة**
- **Handlers يجب أن تكون Idempotent** (يمكن تشغيلها أكثر من مرة دون تأثير جانبي)
- **الـ Events مسجلة في ADR (سجل الأحداث)**
- **الأخطاء في الـ Handler لا تسقط الـ Publisher**
- **في EventEmitter: الأخطاء تُسجل وتُتجاهل (Fail Silent)**

## النتائج
- **إيجابي:** فك اقتران كامل بين الـ Domains، قابلية التوسع، إمكانية التبديل للـ External Event Bus
- **سلبي:** صعوبة تتبع تدفق الأحداث (يحتاج Logging قوي)
- **محايد:** EventEmitter لا يضمن التوصيل (At-Most-Once)، ولكن مقبول للمرحلة الأولى

## بدائل مستقبلية
- الانتقال إلى RabbitMQ أو Kafka مع ضمان At-Least-Once أو Exactly-Once
- إضافة Event Sourcing أو CQRS عند الحاجة
