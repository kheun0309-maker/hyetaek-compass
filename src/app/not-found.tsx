import Link from "next/link";
import { categories } from "../../site.config";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty-state">
        <strong>페이지를 찾을 수 없습니다</strong>
        <p>주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <p style={{ marginTop: 24 }}>
          <Link href="/" className="tag">
            홈으로
          </Link>{" "}
          <Link href="/search" className="tag">
            검색하기
          </Link>
        </p>
      </div>

      <div className="cat-grid" style={{ marginBottom: 60 }}>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="cat-card">
            <div className="cat-card__emoji" aria-hidden="true">
              {c.emoji}
            </div>
            <div className="cat-card__name">{c.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
