import type { MetadataRoute } from "next";
import { MODELS, modelPath } from "@/lib/models";
import { SITE_URL } from "@/lib/site";

// SEOの仕組みとしてサイトマップは用意する。デモ版は各ページに noindex を付けているため検索結果には出ない。
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ev`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...MODELS.map((m) => ({
      url: `${SITE_URL}${modelPath(m)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
