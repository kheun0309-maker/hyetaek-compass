import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPostsByCategory, paginate } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { pageMetadata } from "@/lib/seo";
import { categories, categoryMap, siteConfig } from "../../../../../../site.config";
import type { CategorySlug } from "../../../../../../site.config";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = Promise<{ slug: string; page: string }>;

export function generateStaticParams() {
  const out: { slug: string; page: string }[] = [];
  for (const c of categories) {
    const total = Math.ceil(
      getPostsByCategory(c.slug).length / siteConfig.postsPerPage,
    );
    for (let p = 2; p <= total; p++) out.push({ slug: c.slug, page: String(p) });
  }

  // 정적 내보내기는 빈 배열을 "generateStaticParams 없음"으로 처리해 빌드가 실패합니다.
  // 아직 2페이지가 없을 때를 위한 최소 1개 보장 (noindex + robots 차단이라 영향 없음).
  return out.length > 0 ? out : [{ slug: categories[0].slug, page: "2" }];
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, page } = await params;
  const cat = categoryMap[slug as CategorySlug];
  if (!cat) return {};

  return pageMetadata({
    title: `${cat.name} ${page}페이지`,
    description: cat.description,
    path: `/category/${slug}/page/${page}`,
    index: false,
  });
}

export default async function CategoryPagedPage({ params }: { params: Params }) {
  const { slug, page: raw } = await params;
  const cat = categoryMap[slug as CategorySlug];
  if (!cat) notFound();

  const pageNum = Number(raw);
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const posts = getPostsByCategory(cat.slug);
  const totalPages = Math.max(1, Math.ceil(posts.length / siteConfig.postsPerPage));

  // 범위를 벗어난 페이지는 빈 목록으로 렌더링합니다.
  const page = pageNum;
  const items = pageNum > totalPages ? [] : paginate(posts, pageNum, siteConfig.postsPerPage).items;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section__head">
          <h2>
            {cat.emoji} {cat.name} · {page}페이지
          </h2>
          <span className="section__more">총 {posts.length}개</span>
        </div>
        <PostList posts={items} />
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath={`/category/${cat.slug}`}
        />
      </div>
    </section>
  );
}
