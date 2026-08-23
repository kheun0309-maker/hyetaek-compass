import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig, categories } from "../../../site.config";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "사이트 소개",
  description: `${siteConfig.name}이 어떤 정보를 어떻게 검증해 전달하는지 소개합니다.`,
  path: "/about",
});

/**
 * ⚠️ 애드센스 심사에서 "사이트의 정체성과 운영 주체"를 확인하는 페이지입니다.
 *    E-E-A-T(경험·전문성·권위·신뢰) 신호를 주는 역할도 합니다.
 */
export default function AboutPage() {
  return (
    <div className="article-wrap legal">
      <h1 className="article-title">사이트 소개</h1>

      <div className="prose">
        <p>
          {siteConfig.name}은 정부지원금·복지·민원처럼 흩어진 행정 정보를
          <strong> 회사원처럼 또렷하게</strong>,{" "}
          <strong>산길처럼 부담 없이</strong> 따라갈 수 있게 정리하는 안내
          사이트입니다. 급하게 챙기는 혜택 목록이 아니라, 한 걸음씩 확인하는
          절차 안내를 지향합니다.
        </p>

        <h2>이런 문제를 해결합니다</h2>
        <ul>
          <li>제도 이름은 들어봤는데 내가 대상인지 알 수 없을 때</li>
          <li>공고문 용어가 어려워 신청 순서가 파악되지 않을 때</li>
          <li>필요한 서류가 흩어져 있어 한 번에 챙기기 힘들 때</li>
        </ul>

        <h2>다루는 주제</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`}>
                {c.emoji} {c.name}
              </Link>{" "}
              — {c.description}
            </li>
          ))}
        </ul>

        <h2>콘텐츠 제작 원칙</h2>
        <ol>
          <li>
            <strong>공식 출처 우선.</strong> 각 제도의 소관 기관 공고와 공식
            안내를 1차 자료로 사용합니다.
          </li>
          <li>
            <strong>기준 연도 명시.</strong> 금액·소득 기준처럼 해마다 바뀌는
            숫자는 기준 시점을 함께 적습니다.
          </li>
          <li>
            <strong>검토 후 발행.</strong> 초안 작성에 AI 도구를 활용하지만,
            사람이 사실관계를 확인하기 전에는 발행하지 않습니다.
          </li>
          <li>
            <strong>변경 시 갱신.</strong> 제도가 바뀌면 기존 글을 수정하고 수정
            날짜를 표기합니다.
          </li>
        </ol>

        <h2>정정 요청</h2>
        <p>
          내용에 오류가 있거나 제도가 변경된 것을 발견하셨다면{" "}
          <Link href="/contact">문의 페이지</Link>를 통해 알려 주세요. 확인 후
          빠르게 수정하겠습니다.
        </p>

        <h2>수익 모델</h2>
        <p>
          사이트 운영과 콘텐츠 제작 비용을 충당하기 위해 광고를 게재하며, 일부
          글에는 제휴 링크가 포함될 수 있습니다. 광고나 제휴 여부가 정보의 내용이나
          추천 방향에 영향을 주지 않습니다.
        </p>
      </div>
    </div>
  );
}
