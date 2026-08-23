"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchIndex, search } from "@/lib/search-client";
import { categoryMap } from "../../site.config";

interface SearchBoxProps {
  /** "header" = 드롭다운, "page" = 검색 전용 페이지 */
  variant?: "header" | "page";
  initialQuery?: string;
  autoFocus?: boolean;
}

const SearchIcon = () => (
  <svg
    className="search__icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function SearchBox({
  variant = "header",
  initialQuery = "",
  autoFocus = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(variant === "page");
  const [activated, setActivated] = useState(variant === "page");
  const [cursor, setCursor] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const docs = useSearchIndex(activated);
  const isPage = variant === "page";

  const results = useMemo(() => {
    if (!docs || query.trim().length === 0) return [];
    return search(docs, query, isPage ? 50 : 8);
  }, [docs, query, isPage]);

  // 바깥 클릭 시 닫기 (헤더 모드만)
  useEffect(() => {
    if (isPage) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isPage]);

  // 단축키: "/" 로 검색창 포커스
  useEffect(() => {
    if (isPage) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        boxRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isPage]);

  useEffect(() => setCursor(-1), [query]);

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && results[cursor]) go(results[cursor].s);
      else if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showPanel = open && (isPage ? query.trim().length > 0 : query.trim().length > 0);

  return (
    <div
      ref={boxRef}
      className={`search${isPage ? " search--page" : ""}`}
      role="search"
    >
      <SearchIcon />
      <input
        className="search__input"
        type="search"
        value={query}
        placeholder={isPage ? "예: 청년월세, 기초연금, ㅊㄴㅇㅅ" : "검색 ( / )"}
        aria-label="사이트 검색"
        autoFocus={autoFocus}
        onFocus={() => {
          setActivated(true);
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {showPanel && (
        <div className="search__panel">
          {!docs && <div className="search__empty">검색 준비 중…</div>}

          {docs && results.length === 0 && (
            <div className="search__empty">
              &ldquo;{query}&rdquo; 검색 결과가 없습니다
            </div>
          )}

          {results.map((r, i) => (
            <Link
              key={r.s}
              href={`/${r.s}`}
              className="search__item"
              data-active={i === cursor}
              onMouseEnter={() => setCursor(i)}
              onClick={() => setOpen(false)}
            >
              <div className="search__item-title">{r.t}</div>
              <div className="search__item-desc">
                {categoryMap[r.c]?.name ?? r.c} · {r.d}
              </div>
            </Link>
          ))}

          {!isPage && results.length > 0 && (
            <div className="search__hint">
              ↑↓ 이동 · Enter 열기 · 전체 결과는 Enter 두 번
            </div>
          )}
        </div>
      )}
    </div>
  );
}
