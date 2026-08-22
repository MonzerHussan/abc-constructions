import { platformPrisma } from "@/lib/platform-prisma";
import type { Prisma } from "@/generated/platform-prisma/client";
import { OutboxStatus } from "@/generated/platform-prisma/client";

export interface OutboxEventInput {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  schemaVersion?: number;
  correlationId: string;
  causationId?: string;
  tenantId?: string;
}

export class OutboxService {
  async enqueue(
    input: OutboxEventInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? platformPrisma;
    return client.outboxEvent.create({
      data: {
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        eventType: input.eventType,
        schemaVersion: input.schemaVersion ?? 1,
        payload: input.payload as Prisma.InputJsonValue,
        correlationId: input.correlationId,
        causationId: input.causationId,
        tenantId: input.tenantId,
        status: OutboxStatus.PENDING,
      },
    });
  }

  async fetchPendingBatch(limit = 50) {
    return platformPrisma.outboxEvent.findMany({
      where: { status: OutboxStatus.PENDING },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async markPublished(eventId: string) {
    return platformPrisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: OutboxStatus.PUBLISHED,
        publishedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(eventId: string, error: string, maxRetries = 5) {
    const event = await platformPrisma.outboxEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) return null;

    const retryCount = event.retryCount + 1;
    return platformPrisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        retryCount,
        lastError: error.slice(0, 2000),
        status:
          retryCount >= maxRetries ? OutboxStatus.FAILED : OutboxStatus.PENDING,
      },
    });
  }

  async hasProcessed(consumerId: string, eventId: string) {
    const record = await platformPrisma.processedEvent.findUnique({
      where: {
        consumerId_eventId: { consumerId, eventId },
      },
    });
    return Boolean(record);
  }

  async markProcessed(consumerId: string, eventId: string) {
    return platformPrisma.processedEvent.create({
      data: { consumerId, eventId },
    });
  }
}

export const outboxService = new OutboxService();
