import type { MetadataRoute } from "next";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories } from "../../site.config";

// 정적 내보내기(output: export)에서도 파일로 생성되도록 강제합니다.
export const dynamic = "force-static";

/**
 * 사이트맵. Rank Math가 하던 일을 코드로 대체합니다.
 * /sitemap.xml 로 자동 노출되며 robots.txt에서 참조합니다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c) => getPostsByCategory(c.slug).length > 0)
    .map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
