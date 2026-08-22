import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/platform-prisma", () => ({
  platformPrisma: {
    outboxEvent: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { platformPrisma } from "@/lib/platform-prisma";
import { OutboxService } from "@/modules/platform/services/OutboxService";

describe("OutboxService reliability", () => {
  const service = new OutboxService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks event FAILED after max retries", async () => {
    vi.mocked(platformPrisma.outboxEvent.findUnique).mockResolvedValue({
      id: "evt-1",
      retryCount: 4,
    } as never);
    vi.mocked(platformPrisma.outboxEvent.update).mockResolvedValue({} as never);

    await service.markFailed("evt-1", "boom", 5);

    expect(platformPrisma.outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "evt-1" },
        data: expect.objectContaining({
          status: "FAILED",
          retryCount: 5,
        }),
      })
    );
  });

  it("keeps PENDING when under max retries", async () => {
    vi.mocked(platformPrisma.outboxEvent.findUnique).mockResolvedValue({
      id: "evt-2",
      retryCount: 1,
    } as never);
    vi.mocked(platformPrisma.outboxEvent.update).mockResolvedValue({} as never);

    await service.markFailed("evt-2", "transient", 5);

    expect(platformPrisma.outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          retryCount: 2,
        }),
      })
    );
  });
});
