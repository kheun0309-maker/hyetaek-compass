import type { PostFrontmatter } from "@/lib/types";

export default function PhotoCredit({ cover }: { cover: NonNullable<PostFrontmatter["cover"]> }) {
  return (
    <figcaption className="photo-credit">
      {cover.capturedAt} 촬영 · 현재 실황과 다른 과거 자료 사진<br />
      <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer">사진: {cover.author}</a>
      {" · "}<a href={cover.licenseUrl} target="_blank" rel="noopener noreferrer">{cover.license}</a>
      {" · 내용 변경 없이 화면 크기에 맞춰 표시"}
    </figcaption>
  );
}
