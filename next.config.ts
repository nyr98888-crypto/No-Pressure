import type { NextConfig } from "next";

/**
 * Security headers that MUST NOT block Next.js hydration, Tailwind, blob:/data:
 * media, canvas PNG exports, or Web Audio.
 * CSP is intentionally omitted (or keep Report-Only only) — a tight enforce CSP
 * previously froze the app on the Suspense "Loading No Pressure…" fallback.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
