import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Página única com salas por hash: só a raiz é indexável.
  return [{ url: `${base}/`, changeFrequency: "monthly", priority: 1 }];
}
