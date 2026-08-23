import { siteConfig } from "../../site.config";

interface AffiliateBoxProps {
  /** 박스 제목. 예: "전세 계약 전 확인용 등기부등본 열람" */
  title: string;
  /** 왜 이걸 추천하는지 1~2문장 */
  reason: string;
  /** 이동할 제휴 링크 */
  href: string;
  /** 버튼 문구 */
  cta?: string;
}

/**
 * 제휴 링크 박스 (쿠팡 파트너스 등).
 *
 * 애드센스만으로는 RPM 상한이 있습니다. 글 주제와 정말 맞는 제품/서비스가
 * 있을 때만 제휴 링크를 붙이면 클릭당 수익이 광고보다 몇 배 높습니다.
 * 단, 아래 두 가지는 법적 의무입니다.
 *  1) 대가성 표시 (표시광고법) — disclosure 문구를 반드시 노출
 *  2) rel="sponsored nofollow" — 구글 정책. 없으면 수동 조치 대상
 */
export default function AffiliateBox({
  title,
  reason,
  href,
  cta = "자세히 보기",
}: AffiliateBoxProps) {
  return (
    <aside className="affiliate">
      <div className="affiliate__label">추천</div>
      <h3 className="affiliate__title">{title}</h3>
      <p className="affiliate__reason">{reason}</p>
      <a
        className="affiliate__cta"
        href={href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
      >
        {cta} →
      </a>
      <p className="affiliate__disclosure">{siteConfig.affiliate.disclosure}</p>
    </aside>
  );
}
