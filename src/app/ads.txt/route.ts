import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";

/**
 * ads.txt — 광고 수익 보호를 위한 필수 파일.
 *
 * 이 파일이 없으면 사칭 사업자가 내 사이트 이름으로 가짜 광고 재고를 팔 수 있고,
 * 일부 광고주는 ads.txt가 없는 사이트에 아예 입찰하지 않습니다(=단가 하락).
 * site.config.ts의 adsense.client 값만 채우면 자동으로 생성됩니다.
 */
export function GET() {
  const client = siteConfig.adsense.client;

  if (!client) {
    return new Response("# adsense client id가 아직 설정되지 않았습니다\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const pub = client.replace(/^ca-/, "");

  const lines = [
    "# Google AdSense",
    `google.com, ${pub}, DIRECT, f08c47fec0942fa0`,
    ...siteConfig.extraAdsTxt,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
