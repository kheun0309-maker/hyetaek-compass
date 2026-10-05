import { notFound } from "next/navigation";
import { getAllPosts, paginate } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "../../../../site.config";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = Promise<{ page: string }>;

export function generateStaticParams() {
  const total = Math.ceil(getAllPosts().length / siteConfig.postsPerPage);
  // 1페이지는 "/posts"가 담당하므로 2페이지부터 생성
  const params = Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));

  // 정적 내보내기(output: export)는 빈 배열을 "generateStaticParams 없음"으로 보고
  // 빌드를 실패시킵니다. 글이 적어 2페이지가 아직 없을 때를 위한 최소 1개 보장.
  // 이 페이지는 noindex이고 robots.txt에서도 차단되므로 SEO 영향은 없습니다.
  return params.length > 0 ? params : [{ page: "2" }];
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { page } = await params;
  return pageMetadata({
    title: `전체 글 ${page}페이지`,
    path: `/page/${page}`,
    // 목록 페이지는 색인 가치가 낮아 noindex, 링크만 따라가게 합니다
    index: false,
  });
}

export default async function PagedHome({ params }: { params: Params }) {
  const { page: raw } = await params;
  const pageNum = Number(raw);
  if (!Number.isInteger(pageNum) || pageNum < 2) notFound();

  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / siteConfig.postsPerPage));

  // 범위를 벗어난 페이지는 빈 목록으로 렌더링합니다.
  // (정적 내보내기에서 notFound()를 쓰면 빌드가 막히므로)
  const page = pageNum;
  const items = pageNum > totalPages ? [] : paginate(posts, pageNum, siteConfig.postsPerPage).items;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section__head">
          <h2>전체 글 · {page}페이지</h2>
          <span className="section__more">총 {posts.length}개</span>
        </div>
        <PostList posts={items} />
        <Pagination page={page} totalPages={totalPages} basePath="" />
      </div>
    </section>
  );
}
