import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import AdSlot from "@/components/AdSlot";
import Toc from "@/components/Toc";
import { JsonLd } from "@/components/ThirdParty";
import {
  pageMetadata,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";
import { categoryMap, siteConfig } from "../../../site.config";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/${post.slug}`,
    type: "article",
    image: post.thumbnail,
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    // 초안은 검색엔진에 색인시키지 않습니다
    index: !post.draft,
  });
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = categoryMap[post.category];
  const adCfg = siteConfig.ads;

  // 얇은 글에는 본문 광고를 넣지 않습니다 (애드센스 "가치 없는 콘텐츠" 회피)
  const allowInArticle = post.body.length >= adCfg.minCharsForInArticle;
  const { chunks: rawChunks, headings } = await renderMarkdown(
    post.body,
    allowInArticle ? adCfg.inArticleEveryNHeadings : 0,
  );

  // 본문 광고 개수 상한 적용 — 초과분은 앞 조각에 합쳐 광고 과밀을 막습니다.
  const chunks =
    rawChunks.length > adCfg.maxInArticle + 1
      ? [
          ...rawChunks.slice(0, adCfg.maxInArticle),
          rawChunks.slice(adCfg.maxInArticle).join(""),
        ]
      : rawChunks;

  const related = getRelatedPosts(post, 5);
  const nextPost = related[0];
  const faq = post.faq ?? [];

  const trail = [
    { name: "홈", path: "/" },
    ...(cat ? [{ name: cat.name, path: `/category/${cat.slug}` }] : []),
    { name: post.title, path: `/${post.slug}` },
  ];

  return (
    <article className="article-wrap">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(trail)} />
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link>
        {cat && (
          <>
            <span aria-hidden="true">›</span>
            <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
          </>
        )}
      </nav>

      <h1 className="article-title">{post.title}</h1>

      <div className="article-meta">
        <time dateTime={post.date}>발행 {post.date}</time>
        {post.updated && post.updated !== post.date && (
          <time dateTime={post.updated}>수정 {post.updated}</time>
        )}
        <span>읽는 데 {post.readingMinutes}분</span>
        {post.draft && <span>· 검토 전 초안</span>}
      </div>

      <p className="notice">
        지원 금액·소득 기준·신청 기간은 해마다 바뀝니다. 신청 전에 반드시{" "}
        <strong>복지로, 정부24 등 공식 홈페이지</strong>에서 최신 기준을 확인해
        주세요.
      </p>

      {/* 첫 화면 배너 — 뷰어빌리티가 가장 높은 지면이라 lazy를 끕니다 */}
      {adCfg.showTopBanner && <AdSlot format="display" lazy={false} />}

      <Toc headings={headings} />

      {chunks.map((html, i) => (
        <div key={i}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {i < chunks.length - 1 && <AdSlot format="in-article" />}
        </div>
      ))}

      {faq.length > 0 && (
        <section className="faq">
          <h2>자주 묻는 질문</h2>
          {faq.map((f, i) => (
            <details key={i} {...(i === 0 ? { open: true } : {})}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      {(post.tags?.length ?? 0) > 0 && (
        <div className="tags">
          {post.tags!.map((t) => (
            <Link key={t} href={`/tag/${encodeURIComponent(t)}`} className="tag">
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/*
        다음 글 유도 CTA.
        광고 수익 = 페이지뷰 × RPM 이므로, 세션당 페이지뷰를 1.0 → 1.8로 올리는 것이
        광고를 하나 더 붙이는 것보다 수익 기여가 큽니다.
      */}
      {nextPost && (
        <Link href={`/${nextPost.slug}`} className="next-cta">
          <div className="next-cta__label">다음으로 읽어보세요</div>
          <div className="next-cta__title">{nextPost.title}</div>
          {nextPost.description && (
            <div className="next-cta__desc">{nextPost.description}</div>
          )}
        </Link>
      )}

      {adCfg.showBottomBanner && <AdSlot format="display" />}

      {related.length > 1 && (
        <section className="related">
          <h2>함께 보면 좋은 글</h2>
          <ul>
            {related.slice(1).map((r) => (
              <li key={r.slug}>
                <Link href={`/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
