import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AdsenseScript, Analytics, JsonLd } from "@/components/ThirdParty";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "../../site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — 정부지원금·복지 정보 안내`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/rss.xml" },
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  verification: {
    ...(siteConfig.verification.google
      ? { google: siteConfig.verification.google }
      : {}),
    ...(siteConfig.verification.naver
      ? { other: { "naver-site-verification": siteConfig.verification.naver } }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          본문 바로가기
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyAnchorAd />
        <AdsenseScript />
        <Analytics />
      </body>
    </html>
  );
}
