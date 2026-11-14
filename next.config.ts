import type { NextConfig } from "next";

/**
 * Platform security headers (replaces middleware/proxy).
 * No Edge middleware — avoids Vercel Edge routing manifest failures on Next 16.
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
  // cacheComponents / partialPrefetching disabled: Vercel was packaging
  // Ready builds with an empty route manifest (404 NOT_FOUND on all URLs).
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
