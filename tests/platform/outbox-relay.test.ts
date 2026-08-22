import { describe, it, expect, vi, beforeEach } from "vitest";

const { publish } = vi.hoisted(() => ({
  publish: vi.fn(),
}));

vi.mock("@/modules/shared/events/event-bus", () => ({
  eventBus: { publish },
}));

vi.mock("@/lib/platform-prisma", () => ({
  platformPrisma: {
    outboxEvent: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    processedEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { platformPrisma } from "@/lib/platform-prisma";
import { OutboxRelayService } from "@/modules/platform/services/OutboxRelayService";

describe("VS-0 outbox relay", () => {
  const relay = new OutboxRelayService("test-consumer");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes pending events and marks them processed", async () => {
    vi.mocked(platformPrisma.outboxEvent.findMany).mockResolvedValue([
      {
        id: "evt-1",
        aggregateType: "Tenant",
        aggregateId: "t1",
        eventType: "Platform.Tenant.Created",
        schemaVersion: 1,
        payload: { tenantId: "t1" },
        correlationId: "corr-1",
        causationId: null,
        tenantId: "t1",
        status: "PENDING",
        retryCount: 0,
        lastError: null,
        createdAt: new Date(),
        publishedAt: null,
      },
    ] as never);

    vi.mocked(platformPrisma.processedEvent.findUnique).mockResolvedValue(null);
    vi.mocked(platformPrisma.processedEvent.create).mockResolvedValue({} as never);
    vi.mocked(platformPrisma.outboxEvent.update).mockResolvedValue({} as never);

    const result = await relay.relayBatch(10);

    expect(result.published).toBe(1);
    expect(publish).toHaveBeenCalledOnce();
    expect(platformPrisma.processedEvent.create).toHaveBeenCalledWith({
      data: { consumerId: "test-consumer", eventId: "evt-1" },
    });
  });
});
