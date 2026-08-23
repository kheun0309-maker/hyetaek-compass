import Link from "next/link";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import CardCarousel, { type CarouselCard } from "@/components/CardCarousel";
import AdSlot from "@/components/AdSlot";
import { categories, categoryMap } from "../../site.config";

export const dynamic = "force-static";

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "혜택나침반",
    title: "놓치기 쉬운 국가 혜택,",
    titleAccent: "신청 절차 그대로",
    sub: "자격 조건부터 필요 서류까지. 공고문을 다시 읽지 않아도 되게 정리했습니다.",
    href: "/search",
    cta: "혜택 찾아보기",
    theme: "mint",
    emoji: "🧭",
  },
  {
    eyebrow: "주거·청년",
    title: "월세 지원, 전세 보증까지",
    titleAccent: "내가 받을 수 있는지 먼저",
    sub: "소득 기준과 나이 조건을 표 하나로 확인하고, 신청 화면 순서대로 따라가세요.",
    href: "/category/housing",
    cta: "주거 지원 보기",
    theme: "blue",
    emoji: "🏠",
  },
  {
    eyebrow: "민원·행정",
    title: "주민센터 가지 않아도",
    titleAccent: "온라인으로 3분이면",
    sub: "등본·초본부터 각종 증명서까지, 발급 옵션을 어떻게 골라야 하는지 알려드립니다.",
    href: "/category/admin",
    cta: "발급 방법 보기",
    theme: "peach",
    emoji: "📋",
  },
];

const QUICK_PRIMARY = [
  { label: "전체 글", href: "/page/2" },
  { label: "통합 검색", href: "/search" },
];

const QUICK_SECONDARY = [
  { label: "사이트 소개", href: "/about" },
  { label: "문의하기", href: "/contact" },
  { label: "RSS 구독", href: "/rss.xml" },
];

export default function HomePage() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 4);

  // 카테고리별 대표 글 (각 카테고리 최신 1편)
  const picks = categories
    .map((c) => getPostsByCategory(c.slug)[0])
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const cards: CarouselCard[] = posts.slice(0, 8).map((p, i) => ({
    badge: categoryMap[p.category]?.name ?? "정보",
    badgeTone: i === 0 ? "new" : i % 2 === 0 ? "service" : "recommend",
    title: p.title,
    desc: p.description,
    href: `/${p.slug}`,
  }));

  return (
    <>
      <HeroCarousel slides={SLIDES} />

      {/* 히어로 위로 겹쳐 올라오는 퀵메뉴 */}
      <div className="wrap">
        <nav className="quickbar" aria-label="바로가기">
          <div className="quickbar__primary">
            {QUICK_PRIMARY.map((q) => (
              <Link key={q.href} href={q.href}>
                {q.label}
              </Link>
            ))}
          </div>
          <div className="quickbar__secondary">
            {QUICK_SECONDARY.map((q) => (
              <Link key={q.href} href={q.href}>
                {q.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* 새소식 / 주제별 추천 2단 */}
      <section className="section">
        <div className="wrap news-columns">
          <div className="news-col">
            <div className="news-col__head">
              <h2>새로 올라온 글</h2>
              <Link href="/page/2">바로가기 ›</Link>
            </div>
            <ul className="news-list">
              {latest.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`}>
                    <span className="news-list__title">{p.title}</span>
                    <time dateTime={p.date}>{p.date.slice(5).replace("-", ".")}</time>
                  </Link>
                </li>
              ))}
              {latest.length === 0 && (
                <li className="news-list__empty">아직 발행된 글이 없습니다</li>
              )}
            </ul>
          </div>

          <div className="news-col">
            <div className="news-col__head">
              <h2>주제별 대표 글</h2>
              <Link href="/search">바로가기 ›</Link>
            </div>
            <ul className="news-list">
              {picks.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`}>
                    <span className="news-list__cat">
                      {categoryMap[p.category]?.name}
                    </span>
                    <span className="news-list__title">{p.title}</span>
                  </Link>
                </li>
              ))}
              {picks.length === 0 && (
                <li className="news-list__empty">준비 중입니다</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 카테고리 타일 */}
      <section className="section section--soft">
        <div className="wrap">
          <div className="section__head">
            <h2>주제별로 찾기</h2>
            <Link href="/search" className="section__more">
              전체 검색 ›
            </Link>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="cat-card">
                <div className="cat-card__emoji" aria-hidden="true">
                  {c.emoji}
                </div>
                <div className="cat-card__name">{c.name}</div>
                <div className="cat-card__count">
                  글 {getPostsByCategory(c.slug).length}개
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <AdSlot format="display" />
      </div>

      {/* 추천 카드 캐러셀 */}
      {cards.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section__head">
              <h2>이런 혜택도 있어요</h2>
            </div>
            <CardCarousel cards={cards} />
          </div>
        </section>
      )}
    </>
  );
}
