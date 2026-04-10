import type { NextConfig } from "next";

const backendApiOrigin =
  process.env.BACKEND_API_ORIGIN?.replace(/\/$/, "") || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Proxy /api requests to the NestJS backend so the browser never makes
   *  cross-origin calls (eliminates CORS issues in development and keeps
   *  frontend code stable across environments). */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
