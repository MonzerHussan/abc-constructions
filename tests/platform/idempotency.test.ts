import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/platform-prisma", () => ({
  platformPrisma: {
    idempotencyRecord: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { platformPrisma } from "@/lib/platform-prisma";
import { IdempotencyService } from "@/modules/platform/services/IdempotencyService";

describe("IdempotencyService", () => {
  const service = new IdempotencyService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached value on replay within TTL", async () => {
    vi.mocked(platformPrisma.idempotencyRecord.findUnique).mockResolvedValue({
      idempotencyKey: "key-1",
      tenantId: "t1",
      responseHash: JSON.stringify({ ok: true }),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    } as never);

    const fn = vi.fn();
    const result = await service.executeOnce("key-1", "t1", 60_000, fn);

    expect(result.replay).toBe(true);
    expect(result.value).toEqual({ ok: true });
    expect(fn).not.toHaveBeenCalled();
  });

  it("executes fn once then stores result", async () => {
    vi.mocked(platformPrisma.idempotencyRecord.findUnique).mockResolvedValue(null);
    vi.mocked(platformPrisma.idempotencyRecord.upsert).mockResolvedValue({} as never);

    const fn = vi.fn().mockResolvedValue({ count: 1 });
    const result = await service.executeOnce("key-2", "t1", 60_000, fn);

    expect(result.replay).toBe(false);
    expect(result.value).toEqual({ count: 1 });
    expect(fn).toHaveBeenCalledOnce();
  });
});
