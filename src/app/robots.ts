import type { MetadataRoute } from "next";
import { siteConfig } from "../../site.config";

// 정적 내보내기(output: export)에서도 파일로 생성되도록 강제합니다.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 목록/검색 페이지는 색인 대상에서 제외해 크롤 예산을 본문에 집중시킵니다.
        disallow: ["/search", "/page/", "/tag/", "/setup"],
      },
      // 네이버·다음 크롤러는 명시적으로 허용해 두면 수집이 빨라집니다.
      { userAgent: "Yeti", allow: "/" },
      { userAgent: "Daum", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
