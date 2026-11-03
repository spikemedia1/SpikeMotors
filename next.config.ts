import path from "node:path";
import type { NextConfig } from "next";

// cacheComponents/partialPrefetching removidos: site institucional estático de página única,
// sem dados dinâmicos; menos superfície de erro de prerender.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.resolve("."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
