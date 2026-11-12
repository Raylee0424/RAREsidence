import type { NextConfig } from "next";

// Server-side only: where Next forwards /api and /uploads. Read when the
// server starts, so changing it needs a restart.
const API_URL = (process.env.API_URL ?? "http://localhost:3001").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // The browser talks to the API through this app's own origin. That makes the
  // httpOnly session cookie first-party, so proxy.ts can see it, and needs no CORS.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

