import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "문의하기",
  description: "정정 요청, 제휴 제안, 기타 문의를 받는 창구입니다.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="article-wrap legal">
      <h1 className="article-title">문의하기</h1>

      <div className="prose">
        <p>
          아래 이메일로 연락 주시면 확인 후 회신드립니다. 영업일 기준 2~3일이
          소요될 수 있습니다.
        </p>

        <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>

        <h2>이런 문의를 받습니다</h2>
        <ul>
          <li>
            <strong>정보 정정 요청</strong> — 제도가 변경되었거나 내용에 오류가
            있는 경우. 해당 글 주소를 함께 보내주시면 빠르게 확인할 수 있습니다.
          </li>
          <li>
            <strong>저작권 관련 문의</strong> — 이미지나 인용에 문제가 있는 경우
            즉시 조치합니다.
          </li>
          <li>
            <strong>제휴 및 광고 문의</strong>
          </li>
          <li>
            <strong>다뤄줬으면 하는 주제 제안</strong>
          </li>
        </ul>

        <h2>답변드리기 어려운 문의</h2>
        <ul>
          <li>개인의 구체적인 수급 자격 판정 (소관 기관에 문의해 주세요)</li>
          <li>법률·세무·의료 자문</li>
          <li>신청 대행 요청</li>
        </ul>
      </div>
    </div>
  );
}
