import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // ─── TypeScript ────────────────────────────────────────────────────────────────
  typescript: {
    // Still ignore build errors for now, but we should fix these over time
    ignoreBuildErrors: true,
  },

  // ─── React Strict Mode ────────────────────────────────────────────────────────
  reactStrictMode: true,

  // ─── Experimental ─────────────────────────────────────────────────────────────
  experimental: {
    // Optimize package imports — tree-shake heavy libraries
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
      "@radix-ui/react-icons",
      "@tanstack/react-table",
      "uuid",
    ],
  },

  // ─── Turbopack Config (Next.js 16+) ──────────────────────────────────────────
  turbopack: {
    // Add turbopack-specific config here if needed
  },

  // ─── Image Optimization ───────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ─── Security & Caching Headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|css|js)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
