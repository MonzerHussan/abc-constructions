import { PrismaClient } from "@/generated/platform-prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPlatform = globalThis as unknown as {
  platformPrisma: PrismaClient | undefined;
  platformPool: Pool | undefined;
};

function createPlatformPrismaClient() {
  const pool =
    globalForPlatform.platformPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: Number(process.env.PLATFORM_DATABASE_POOL_MAX ?? 3),
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 30_000),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 60_000),
      keepAlive: true,
      allowExitOnIdle: process.env.NODE_ENV !== "production",
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPlatform.platformPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const platformPrisma =
  globalForPlatform.platformPrisma ?? createPlatformPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPlatform.platformPrisma = platformPrisma;
}
