import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Surface subtle bugs (double-invoked effects) during dev; no-op in prod.
  reactStrictMode: true,
  // Don't advertise the framework on an internet-facing kiosk.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
