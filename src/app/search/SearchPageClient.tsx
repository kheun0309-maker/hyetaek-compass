"use client";

import { useSearchParams } from "next/navigation";
import SearchBox from "@/components/SearchBox";

/**
 * ?q= 파라미터를 읽어 검색창에 채워 넣습니다.
 * useSearchParams는 Suspense 경계 안에서만 쓸 수 있어 별도 파일로 분리했습니다.
 */
export default function SearchPageClient() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <>
      <SearchBox variant="page" initialQuery={q} autoFocus />
      <p
        className="search__hint"
        style={{ borderTop: "none", paddingLeft: 0, marginTop: 10 }}
      >
        초성으로도 찾을 수 있어요. 예: <strong>ㅊㄴㅇㅅ</strong> → 청년월세
      </p>
    </>
  );
}
