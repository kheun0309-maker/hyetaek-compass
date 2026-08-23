"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "./SearchBox";
import { siteConfig, categories } from "../../site.config";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="logo" aria-label={`${siteConfig.name} 홈`}>
          <span className="logo__mark" aria-hidden="true">
            혜
          </span>
          {siteConfig.name}
        </Link>

        <nav className="nav" aria-label="주요 카테고리">
          {categories.map((c) => {
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
        </nav>

        <SearchBox variant="header" />
      </div>
    </header>
  );
}
