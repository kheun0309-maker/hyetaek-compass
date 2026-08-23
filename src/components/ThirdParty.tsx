import Script from "next/script";
import { siteConfig } from "../../site.config";

/**
 * 애드센스 로더.
 * autoAds가 true면 구글이 알아서 광고를 배치하고,
 * false면 AdSlot 컴포넌트가 놓인 자리에만 광고가 나갑니다.
 *
 * 참고: 자동광고 + 수동 슬롯을 동시에 쓰면 광고가 과밀해져
 *      "광고 대비 콘텐츠 부족" 정책 위반이 날 수 있습니다. 하나만 고르세요.
 */
export function AdsenseScript() {
  const client = siteConfig.adsense.client;
  if (!client) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

/** Google Analytics 4 */
export function Analytics() {
  const id = siteConfig.gaId;
  if (!id) return null;

  return (
    <>
      <Script
        id="ga4-src"
        async
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}

/** 검색 결과에 노출되는 구조화 데이터(JSON-LD)를 안전하게 삽입 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 결과만 넣으므로 XSS 위험 없음. </script> 이스케이프 처리.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
