import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = Promise<{ tag: string }>;

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return pageMetadata({
    title: `#${name} 관련 글`,
    description: `${name} 태그가 달린 글 모음입니다.`,
    path: `/tag/${tag}`,
    // 태그 페이지는 중복 색인을 만들기 쉬워 noindex
    index: false,
  });
}

export default async function TagPage({ params }: { params: Params }) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);

  const posts = getAllPosts().filter((p) => (p.tags ?? []).includes(name));
  if (posts.length === 0) notFound();

  return (
    <section className="section">
      <div className="wrap">
        <div className="section__head">
          <h2>#{name}</h2>
          <span className="section__more">글 {posts.length}개</span>
        </div>
        <PostList posts={posts} />
      </div>
    </section>
  );
}
