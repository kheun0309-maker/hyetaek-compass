import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** 1페이지 URL. 2페이지부터는 `${basePath}/page/2` 형태가 됩니다. */
  basePath: string;
  firstPagePath?: string;
}

/** 현재 페이지 주변 + 처음/끝만 보여주는 축약 페이지 번호 목록 */
function pageWindow(page: number, total: number): (number | "...")[] {
  const out: (number | "...")[] = [];
  const push = (n: number | "...") => out.push(n);

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - page) <= 2) push(i);
    else if (out[out.length - 1] !== "...") push("...");
  }
  return out;
}

export default function Pagination({ page, totalPages, basePath, firstPagePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (n: number) => (n === 1 ? firstPagePath ?? (basePath || "/posts") : `${basePath}/page/${n}`);

  return (
    <nav className="pagination" aria-label="페이지 이동">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="이전 페이지">
          ←
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          ←
        </span>
      )}

      {pageWindow(page, totalPages).map((n, i) =>
        n === "..." ? (
          <span key={`gap-${i}`} className="is-disabled">
            …
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)}>
            {n}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" aria-label="다음 페이지">
          →
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          →
        </span>
      )}
    </nav>
  );
}
