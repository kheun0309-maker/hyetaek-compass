import Link from "next/link";
import type { Post } from "@/lib/types";
import { categoryMap } from "../../site.config";

export default function PostCard({ post }: { post: Post }) {
  const cat = categoryMap[post.category];

  return (
    <Link href={`/${post.slug}`} className="post-card">
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
          npm run generate 로 초안을 만들고, 검토 후 draft: false 로 바꾸면
          여기에 나타납니다.
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
