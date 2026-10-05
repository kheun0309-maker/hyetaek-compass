import Link from "next/link";
import type { Post } from "@/lib/types";
import { categoryMap } from "../../site.config";

export default function PostCard({ post }: { post: Post }) {
  const cat = categoryMap[post.category];

  return (
    <Link href={`/${post.slug}`} className="post-card">
      {post.thumbnail && <img className="post-card__image" src={post.thumbnail} alt="" loading="lazy" width={600} height={400} />}
      {post.thumbnail && post.cover && <span className="post-card__credit">사진: {post.cover.author} · {post.cover.license} · {post.cover.capturedAt} 자료 사진<br />원본·이용허락 링크는 글에서 확인</span>}
      <span className="post-card__cat">
        {cat ? `${cat.emoji} ${cat.name}` : post.category}
      </span>
      <h3 className="post-card__title">{post.title}</h3>
      {post.description && <p className="post-card__desc">{post.description}</p>}
      <div className="post-card__meta">
        <time dateTime={post.date}>{post.date}</time>
        <span>읽는 데 {post.readingMinutes}분</span>
        {post.draft && <span>· 초안</span>}
      </div>
    </Link>
  );
}

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <strong>아직 발행된 글이 없습니다</strong>
        <span>
          이 주제의 안내를 준비하고 있습니다. 다른 카테고리도 살펴보세요.
        </span>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </div>
  );
}
