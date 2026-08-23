import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPageClient from "./SearchPageClient";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "통합 검색",
  description:
    "정부지원금, 복지수당, 민원 발급 등 사이트 내 모든 글을 한 번에 검색하세요.",
  path: "/search",
  index: false,
});

export default function SearchPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="section__head">
          <h2>통합 검색</h2>
        </div>
        <Suspense
          fallback={<div className="search__empty">검색창 준비 중…</div>}
        >
          <SearchPageClient />
        </Suspense>
      </div>
    </section>
  );
}
