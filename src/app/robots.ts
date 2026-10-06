import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// クロール自体は許可し、各ページの noindex を読ませて検索結果に載せない（デモ版の方針）
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
