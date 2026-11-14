type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

function prune(bucket: Bucket, windowMs: number, now: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  prune(bucket, windowMs, now);
  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    return { ok: false, remaining: 0 };
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: limit - bucket.timestamps.length };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    // Allow non-browser GET tools without Origin; mutate routes must have Origin
    return req.method === "GET" || req.method === "HEAD";
  }
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}

export const LIMITS = {
  createPerHour: 10,
  updatePerHour: 20,
  readPerMin: 60,
  maxPayloadBytes: 1.3 * 1024 * 1024,
} as const;
