import type { NextConfig } from "next";

/**
 * BUILD_TARGET=static 이면 완전 정적 HTML로 내보냅니다(out/ 폴더).
 * → Cloudflare Pages, Netlify, S3, 일반 웹호스팅 어디든 올릴 수 있습니다.
 * 값이 없으면 기본 Next.js 빌드(Vercel용)로 동작합니다.
 */
const isStaticExport = process.env.BUILD_TARGET === "static";

const nextConfig: NextConfig = {
  // 정적 생성 우선. 모든 글 페이지는 빌드 시 HTML로 구워집니다.
  ...(isStaticExport ? { output: "export" as const } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 정적 내보내기에서는 Next.js 이미지 최적화 서버를 쓸 수 없습니다.
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  // headers()는 정적 내보내기에서 무시됩니다(호스팅 쪽에서 설정).
  async headers() {
    return [
      {
        // 정적 자산 장기 캐시 (Core Web Vitals / SEO에 유리)
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
