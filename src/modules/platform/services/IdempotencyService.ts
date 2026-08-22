import { platformPrisma } from "@/lib/platform-prisma";

export class IdempotencyService {
  async executeOnce<T>(
    idempotencyKey: string,
    tenantId: string | undefined,
    ttlMs: number,
    fn: () => Promise<T>
  ): Promise<{ replay: boolean; value: T }> {
    const now = new Date();
    const existing = await platformPrisma.idempotencyRecord.findUnique({
      where: { idempotencyKey },
    });

    if (existing && existing.expiresAt > now && existing.responseHash) {
      return { replay: true, value: JSON.parse(existing.responseHash) as T };
    }

    const value = await fn();
    const expiresAt = new Date(now.getTime() + ttlMs);

    await platformPrisma.idempotencyRecord.upsert({
      where: { idempotencyKey },
      create: {
        idempotencyKey,
        tenantId,
        responseHash: JSON.stringify(value),
        expiresAt,
      },
      update: {
        responseHash: JSON.stringify(value),
        expiresAt,
      },
    });

    return { replay: false, value };
  }

  async purgeExpired(referenceDate = new Date()) {
    return platformPrisma.idempotencyRecord.deleteMany({
      where: { expiresAt: { lt: referenceDate } },
    });
  }
}

export const idempotencyService = new IdempotencyService();
