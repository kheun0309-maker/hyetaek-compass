import Link from "next/link";
import { getAllPosts, getPostsByCategory, paginate } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";
import { siteConfig, categories } from "../../site.config";

export const dynamic = "force-static";

export default function HomePage() {
  const posts = getAllPosts();
  const { items, page, totalPages } = paginate(posts, 1, siteConfig.postsPerPage);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            놓치기 쉬운 국가 혜택,
            <br />
            신청 절차 그대로 정리했습니다
          </h1>
          <p>{siteConfig.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <h2>주제별로 찾기</h2>
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

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <h2>최신 글</h2>
            <Link href="/search" className="section__more">
              전체 검색 →
            </Link>
          </div>
          <PostList posts={items} />
          <Pagination page={page} totalPages={totalPages} basePath="" />
        </div>
      </section>
    </>
  );
}
