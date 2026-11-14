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
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return false;

  const match = (urlStr: string | null) => {
    if (!urlStr) return false;
    try {
      return new URL(urlStr).host === host;
    } catch {
      return false;
    }
  };

  if (req.method === "GET" || req.method === "HEAD") {
    return true;
  }

  return match(origin) || match(referer);
}

export const LIMITS = {
  /** Align with middleware: 12 mutating requests / 10 min (defense in depth). */
  mutatePerWindow: 12,
  mutateWindowMs: 10 * 60_000,
  readPerMin: 60,
  /** Raw JSON body ceiling (base64-expanded AV up to ~15MB decoded). */
  maxPayloadBytes: 22 * 1024 * 1024,
} as const;
