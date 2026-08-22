import { eventBus } from "@/modules/shared/events/event-bus";
import type { IEvent } from "@/modules/shared/events/types";
import { outboxService } from "@/modules/platform/services/OutboxService";

const DEFAULT_CONSUMER_ID = "platform.outbox-relay";

export class OutboxRelayService {
  constructor(private readonly consumerId = DEFAULT_CONSUMER_ID) {}

  async relayBatch(limit = 50): Promise<{ published: number; skipped: number; failed: number }> {
    const pending = await outboxService.fetchPendingBatch(limit);
    let published = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of pending) {
      const alreadyProcessed = await outboxService.hasProcessed(
        this.consumerId,
        row.id
      );
      if (alreadyProcessed) {
        await outboxService.markPublished(row.id);
        skipped += 1;
        continue;
      }

      try {
        const event: IEvent = {
          name: row.eventType,
          version: row.schemaVersion,
          payload: row.payload,
          metadata: {
            timestamp: row.createdAt,
            correlationId: row.correlationId,
            source: "platform.outbox",
            requestId: row.id,
            userId: undefined,
            orgId: row.tenantId ?? undefined,
          },
        };

        await eventBus.publish(event);
        await outboxService.markProcessed(this.consumerId, row.id);
        await outboxService.markPublished(row.id);
        published += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown outbox relay error";
        await outboxService.markFailed(row.id, message);
        failed += 1;
      }
    }

    return { published, skipped, failed };
  }
}

export const outboxRelayService = new OutboxRelayService();
