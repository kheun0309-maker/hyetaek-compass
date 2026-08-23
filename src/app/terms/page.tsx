import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "이용약관",
  description: `${siteConfig.name} 서비스 이용약관 및 면책 조항입니다.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="article-wrap legal">
      <h1 className="article-title">이용약관</h1>
      <div className="article-meta">
        <span>최종 개정일: 2026년 1월 1일</span>
      </div>

      <div className="prose">
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 {siteConfig.name}(이하 &ldquo;사이트&rdquo;)이 제공하는 정보
          서비스의 이용 조건 및 절차, 이용자와 사이트의 권리·의무를 정함을 목적으로
          합니다.
        </p>

        <h2>제2조 (정보의 성격과 면책)</h2>
        <ul>
          <li>
            사이트가 제공하는 모든 정보는 <strong>일반적인 안내 목적</strong>이며,
            법률·세무·의료 자문을 대체하지 않습니다.
          </li>
          <li>
            정부 지원 제도의 지원 금액, 소득 기준, 신청 기간 등은 수시로 변경되므로,
            실제 신청 전에는 반드시 각 소관 기관의 공식 홈페이지에서 최신 정보를
            확인해야 합니다.
          </li>
          <li>
            사이트는 게시된 정보의 정확성·완전성을 보장하기 위해 노력하지만, 정보의
            오류 또는 변경으로 인해 발생한 손해에 대해서는 책임을 지지 않습니다.
          </li>
        </ul>

        <h2>제3조 (저작권)</h2>
        <ul>
          <li>
            사이트에 게시된 콘텐츠의 저작권은 사이트 운영자에게 있습니다.
          </li>
          <li>
            이용자는 출처를 명시한 인용을 넘어 콘텐츠를 무단 복제·배포·전송할 수
            없습니다.
          </li>
          <li>
            저작권 침해가 의심되는 게시물을 발견한 경우 문의 페이지를 통해 알려
            주시면 확인 후 신속히 조치하겠습니다.
          </li>
        </ul>

        <h2>제4조 (광고 및 제휴)</h2>
        <p>
          사이트는 운영 유지를 위해 Google AdSense 등 광고를 게재하며, 일부 게시물에
          제휴 링크가 포함될 수 있습니다. 제휴 링크를 통해 발생한 구매에 대해 사이트가
          수수료를 지급받을 수 있으며, 해당 게시물에는 그 사실을 명확히 표시합니다.
          제휴 여부는 콘텐츠의 내용에 영향을 주지 않습니다.
        </p>

        <h2>제5조 (외부 링크)</h2>
        <p>
          사이트는 이용자 편의를 위해 외부 사이트 링크를 제공할 수 있으며, 외부
          사이트의 콘텐츠나 서비스에 대해서는 책임을 지지 않습니다.
        </p>

        <h2>제6조 (약관의 변경)</h2>
        <p>
          사이트는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 사이트에
          게시함으로써 효력이 발생합니다.
        </p>
      </div>
    </div>
  );
}
