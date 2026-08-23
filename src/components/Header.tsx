"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "./SearchBox";
import {
  siteConfig,
  categories,
  navPrimarySlugs,
  categoryMap,
} from "../../site.config";

export default function Header() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const primary = navPrimarySlugs.map((s) => categoryMap[s]);
  const more = categories.filter((c) => !navPrimarySlugs.includes(c.slug));
  const moreActive = more.some((c) => pathname === `/category/${c.slug}`);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="logo" aria-label={`${siteConfig.name} 홈`}>
          <span className="logo__mark" aria-hidden="true">
            행
          </span>
          {siteConfig.name}
        </Link>

        <nav className="nav" aria-label="주요 카테고리">
          {primary.map((c) => {
            const href = `/category/${c.slug}`;
            return (
              <Link
                key={c.slug}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                {c.name}
              </Link>
            );
          })}

          <div className="nav-more" ref={moreRef}>
            <button
              type="button"
              className="nav-more__btn"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              aria-current={moreActive ? "true" : undefined}
              onClick={() => setMoreOpen((v) => !v)}
            >
              더보기
            </button>
            {moreOpen && (
              <div className="nav-more__panel" role="menu">
                {more.map((c) => {
                  const href = `/category/${c.slug}`;
                  return (
                    <Link
                      key={c.slug}
                      href={href}
                      role="menuitem"
                      aria-current={pathname === href ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <span aria-hidden="true">{c.emoji}</span>
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <SearchBox variant="header" />
      </div>
    </header>
  );
}
