import Link from "next/link";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import CardCarousel, { type CarouselCard } from "@/components/CardCarousel";
import AdSlot from "@/components/AdSlot";
import PhotoCredit from "@/components/PhotoCredit";
import {
  categories,
  categoryMap,
  ADMIN_CATEGORY_SLUGS,
  TIP_CATEGORY_SLUGS,
  type CategorySlug,
  siteConfig,
} from "../../site.config";

export const dynamic = "force-static";

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "행정산책",
    title: "복잡한 일,",
    titleAccent: "산책하듯 차근히",
    sub: "행정·복지부터 앱 설정·생활 절약까지. 회사원처럼 또렷하게 정리했습니다.",
    href: "/search",
    cta: "필요한 안내 찾기",
    theme: "mint",
    emoji: "🥾",
  },
  {
    eyebrow: "민원·행정",
    title: "주민센터 가지 않아도",
    titleAccent: "온라인으로 차근히",
    sub: "등본·초본부터 각종 증명서까지, 발급 옵션을 어떻게 고르는지 알려드립니다.",
    href: "/category/admin",
    cta: "발급 방법 보기",
    theme: "peach",
    emoji: "📋",
  },
  {
    eyebrow: "디지털·앱",
    title: "막히는 설정,",
    titleAccent: "화면 순서대로",
    sub: "아이폰·네이버·알림처럼 검색으로 찾는 작은 문제, 따라 하기만 하면 됩니다.",
    href: "/category/digital",
    cta: "디지털 팁 보기",
    theme: "blue",
    emoji: "📱",
  },
];

const QUICK_PRIMARY = [
  { label: "전체 글", href: "/posts" },
  { label: "통합 검색", href: "/search" },
];

const QUICK_SECONDARY = [
  { label: "정부지원금", href: "/category/subsidy" },
  { label: "디지털·앱", href: "/category/digital" },
  { label: "생활비·할인", href: "/category/money" },
  { label: "사이트 소개", href: "/about" },
];

function postsInSlugs(slugs: CategorySlug[], limit: number) {
  return getAllPosts()
    .filter((p) => (slugs as string[]).includes(p.category))
    .slice(0, limit);
}

export default function HomePage() {
  const posts = getAllPosts();
  const featuredCover = posts.find((post) => post.slug === "seoraksan-autumn-guide")?.cover;
  const latest = posts.slice(0, 4);
  const adminPosts = postsInSlugs(ADMIN_CATEGORY_SLUGS, 4);
  const tipPosts = postsInSlugs(TIP_CATEGORY_SLUGS, 4);

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

      <section className="section">
        <div className="wrap news-columns">
          <div className="news-col">
            <div className="news-col__head">
              <h2>새로 올라온 글</h2>
              <Link href="/posts">바로가기 ›</Link>
            </div>
            <ul className="news-list">
              {latest.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`}>
                    <span className="news-list__title">{p.title}</span>
                    <time dateTime={p.date}>
                      {p.date.slice(5).replace("-", ".")}
                    </time>
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

      <section className="section section--soft">
        <div className="wrap news-columns">
          <div className="news-col">
            <div className="news-col__head">
              <h2>행정·복지 안내</h2>
              <Link href="/category/admin">민원 ›</Link>
            </div>
            <ul className="news-list">
              {adminPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`}>
                    <span className="news-list__cat">
                      {categoryMap[p.category]?.name}
                    </span>
                    <span className="news-list__title">{p.title}</span>
                  </Link>
                </li>
              ))}
              {adminPosts.length === 0 && (
                <li className="news-list__empty">행정·복지 글이 곧 올라옵니다</li>
              )}
            </ul>
          </div>

          <div className="news-col">
            <div className="news-col__head">
              <h2>생활·디지털 팁</h2>
              <Link href="/category/digital">디지털 ›</Link>
            </div>
            <ul className="news-list">
              {tipPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`}>
                    <span className="news-list__cat">
                      {categoryMap[p.category]?.name}
                    </span>
                    <span className="news-list__title">{p.title}</span>
                  </Link>
                </li>
              ))}
              {tipPosts.length === 0 && (
                <li className="news-list__empty">생활·디지털 팁이 곧 올라옵니다</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap featured-guide">
          <figure><img src={siteConfig.featuredGuide.image} width={2048} height={1365} alt="가을 단풍이 물든 설악산 계곡" loading="lazy" />{featuredCover && <PhotoCredit cover={featuredCover} />}</figure>
          <div><p className="topic-eyebrow">이번에 걷고 싶은 길</p><h2>{siteConfig.featuredGuide.title}</h2><p>{siteConfig.featuredGuide.description}</p><Link href={siteConfig.featuredGuide.href} className="about-btn about-btn--primary">설악산 특집 보기 →</Link></div>
        </div>
      </section>

      <section className="section">
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

      {cards.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section__head">
              <h2>이런 안내도 있어요</h2>
            </div>
            <CardCarousel cards={cards} />
          </div>
        </section>
      )}
    </>
  );
}
