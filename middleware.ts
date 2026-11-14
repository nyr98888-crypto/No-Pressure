import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge API shield only — never touches pages, static assets, or hydration.
 * Uses Web Crypto via globalThis only (no Node `crypto` imports).
 */

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

const POST_LIMIT = 12;
const POST_WINDOW_MS = 10 * 60_000;
const GET_LIMIT = 60;
const GET_WINDOW_MS = 60_000;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return true;
}

function hostMatches(urlStr: string | null, host: string | null): boolean {
  if (!urlStr || !host) return false;
  try {
    return new URL(urlStr).host === host;
  } catch {
    return false;
  }
}

function isAutomatedWithoutAppOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const ua = (req.headers.get("user-agent") || "").toLowerCase();

  const fromApp =
    hostMatches(origin, host) || hostMatches(referer, host);

  const scriptUa =
    /(?:^|[\s\/])(?:curl|wget|python-requests|httpie|postmanruntime|insomnia|scrapy|go-http-client|libwww-perl|java\/|okhttp|axios\/|node-fetch|undici)/i.test(
      ua
    );

  if (!fromApp) return true;
  if (scriptUa && !hostMatches(origin, host)) return true;
  return false;
}

function tooMany() {
  return NextResponse.json(
    { error: "Too Many Requests" },
    {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Cache-Control": "no-store",
      },
    }
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Belt-and-suspenders: never rate-limit non-API even if matcher drifts
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const method = request.method.toUpperCase();
  const ip = clientIp(request);

  if (method === "GET" || method === "HEAD") {
    if (!allow(`mw:get:${ip}`, GET_LIMIT, GET_WINDOW_MS)) {
      return tooMany();
    }
    return NextResponse.next();
  }

  if (
    method === "POST" ||
    method === "PATCH" ||
    method === "PUT" ||
    method === "DELETE"
  ) {
    if (!allow(`mw:post:${ip}`, POST_LIMIT, POST_WINDOW_MS)) {
      return tooMany();
    }

    if (method === "POST" || method === "PATCH" || method === "PUT") {
      const ct = (request.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/json") && !ct.includes("application/octet-stream")) {
        // Allow Lemon webhook raw body when paywall path is used
        if (!pathname.startsWith("/api/webhooks/")) {
          return NextResponse.json(
            { error: "Content-Type must be application/json" },
            { status: 415 }
          );
        }
      }
      if (
        !pathname.startsWith("/api/webhooks/") &&
        isAutomatedWithoutAppOrigin(request)
      ) {
        return NextResponse.json(
          { error: "Forbidden origin" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  /*
   * API routes only — never runs on pages, `/_next/static`, `/_next/image`,
   * favicon, manifest, or static image/icon assets (those never match `/api`).
   */
  matcher: ["/api/:path*"],
};
