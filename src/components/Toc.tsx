import type { Heading } from "@/lib/types";

/**
 * 목차. funissu는 Easy Table of Contents 플러그인을 쓰지만
 * 여기서는 빌드 시 헤딩을 추출해 추가 JS 없이 렌더링합니다.
 */
export default function Toc({ headings }: { headings: Heading[] }) {
  const items = headings.filter((h) => h.id && h.level <= 3);
  if (items.length < 2) return null;

  return (
    <nav className="toc" aria-label="목차">
      <div className="toc__title">목차</div>
      <ol>
        {items.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
