import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPostsByCategory, paginate } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";
import { JsonLd } from "@/components/ThirdParty";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { categories, categoryMap, siteConfig } from "../../../../site.config";
import type { CategorySlug } from "../../../../site.config";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryMap[slug as CategorySlug];
  if (!cat) return {};

  return pageMetadata({
    title: `${cat.name} 정보 모음`,
    description: cat.description,
    path: `/category/${cat.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const cat = categoryMap[slug as CategorySlug];
  if (!cat) notFound();

  const posts = getPostsByCategory(cat.slug);
  const { items, page, totalPages } = paginate(posts, 1, siteConfig.postsPerPage);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: cat.name, path: `/category/${cat.slug}` },
        ])}
      />

      <section className="hero">
        <div className="wrap">
          <h1>
            {cat.emoji} {cat.name}
          </h1>
          <p>{cat.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <h2>글 {posts.length}개</h2>
          </div>
          <PostList posts={items} />
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={`/category/${cat.slug}`}
          />
          <AdSlot format="display" />
        </div>
      </section>
    </>
  );
}
