type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;

function getBucket(key: string, limit: number, windowMs: number): Bucket {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  return bucket;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

setInterval(cleanup, WINDOW_MS).unref();

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs?: number;
}): { ok: boolean; remaining: number; retryAfterMs: number } {
  const windowMs = opts.windowMs ?? WINDOW_MS;
  const bucket = getBucket(opts.key, opts.limit, windowMs);
  if (bucket.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.resetAt - Date.now()),
    };
  }
  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count, retryAfterMs: 0 };
}
