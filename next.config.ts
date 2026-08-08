import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Surface subtle bugs (double-invoked effects) during dev; no-op in prod.
  reactStrictMode: true,
  // Don't advertise the framework on an internet-facing kiosk.
  poweredByHeader: false,
  async headers() {
    const immutableAsset = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Self-hosted CesiumJS engine, fonts, and pre-downloaded map tile packs
      // are static and never change in place — cache them for a full year so
      // the kiosk's TV never re-fetches them over WiFi after the first load.
      { source: '/cesium/:path*', headers: immutableAsset },
      { source: '/fonts/:path*', headers: immutableAsset },
      { source: '/viveka-digvijaya/tiles/:path*', headers: immutableAsset },
      { source: '/rkm-centres/tiles/:path*', headers: immutableAsset },
      { source: '/viveka-digvijaya/data/images/:path*', headers: immutableAsset },
      { source: '/rkm-centres/images/:path*', headers: immutableAsset },
    ];
  },
};

export default nextConfig;
