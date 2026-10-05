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

const PRINCIPLES = [
  {
    title: "공식 출처 우선",
    body: "소관 기관 공고와 공식 안내를 1차 자료로 씁니다. 추측으로 절차를 채우지 않습니다.",
  },
  {
    title: "기준 시점 명시",
    body: "금액·소득 기준처럼 바뀌는 숫자는 언제 기준인지 함께 적습니다.",
  },
  {
    title: "검토 후 발행",
    body: "AI가 작성한 해설은 검토 후 발행합니다. 공식 소식·영상 목록은 날짜와 출처를 점검해 자동 갱신하고 원문으로 연결합니다.",
  },
  {
    title: "변경 시 갱신",
    body: "제도가 바뀌면 글을 고치고 수정 날짜를 남깁니다. 낡은 안내를 그대로 두지 않습니다.",
  },
] as const;

const PROBLEMS = [
  {
    title: "대상인지 모를 때",
    body: "제도 이름은 들어봤는데, 내가 받을 수 있는지부터 막힐 때.",
  },
  {
    title: "설정·메뉴를 모를 때",
    body: "앱이나 폰에 기능은 있는데, 어디를 눌러야 하는지 안 보일 때.",
  },
  {
    title: "서류·정보가 흩어질 때",
    body: "필요한 서류나 팁이 여러 곳에 흩어져 한 번에 챙기기 힘들 때.",
  },
] as const;

/**
 * ⚠️ 애드센스 심사에서 "사이트의 정체성과 운영 주체"를 확인하는 페이지입니다.
 *    E-E-A-T(경험·전문성·권위·신뢰) 신호를 주는 역할도 합니다.
 */
export default function AboutPage() {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="wrap about-hero__inner">
          <p className="about-hero__eyebrow">사이트 소개</p>
          <h1 className="about-hero__title">
            회사원처럼 또렷하게,
            <br />
            <strong>산길처럼 부담 없이</strong>
          </h1>
          <p className="about-hero__lead">
            {siteConfig.name}은 정부지원금·복지·민원뿐 아니라, 앱 설정·생활
            절약처럼 일상에서 막히는 일도 급하게 나열하지 않습니다. 한 걸음씩
            확인하는 절차 안내를 지향합니다.
          </p>
          <div className="about-hero__actions">
            <Link href="/search" className="about-btn about-btn--primary">
              필요한 절차 찾기
            </Link>
            <Link href="/contact" className="about-btn about-btn--ghost">
              문의하기
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="wrap">
          <header className="about-section__head">
            <h2>이런 막힘을 풀어 드립니다</h2>
            <p>검색으로 들어온 분들이 자주 부딪히는 지점입니다.</p>
          </header>
          <div className="about-problem-grid">
            {PROBLEMS.map((item) => (
              <article key={item.title} className="about-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section--soft">
        <div className="wrap">
          <header className="about-section__head">
            <h2>다루는 주제</h2>
            <p>행정 코어와 생활·디지털·할인 팁을 같은 기준으로 차근히 정리합니다.</p>
          </header>
          <div className="about-topic-grid">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="about-topic"
              >
                <span className="about-topic__emoji" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="about-topic__name">{c.name}</span>
                <span className="about-topic__desc">{c.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="wrap">
          <header className="about-section__head">
            <h2>콘텐츠 제작 원칙</h2>
            <p>신뢰는 말보다, 반복되는 작업 방식에서 나옵니다.</p>
          </header>
          <ol className="about-principle-list">
            {PRINCIPLES.map((item, i) => (
              <li key={item.title} className="about-principle">
                <span className="about-principle__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-section about-section--soft">
        <div className="wrap about-note-grid">
          <article className="about-note">
            <h2>정정 요청</h2>
            <p>
              오류나 제도 변경을 발견하시면{" "}
              <Link href="/contact">문의 페이지</Link>로 알려 주세요. 확인 후
              수정합니다.
            </p>
          </article>
          <article className="about-note">
            <h2>수익 모델</h2>
            <p>
              운영 비용을 위해 광고를 게재하며, 일부 글에 제휴 링크가 포함될 수
              있습니다. 광고·제휴가 안내 내용의 방향을 바꾸지 않습니다.
            </p>
          </article>
        </div>
      </section>

      <section className="about-cta">
        <div className="wrap about-cta__inner">
          <div>
            <h2>오늘 처리할 행정이 있다면</h2>
            <p>검색으로 바로 찾거나, 카테고리에서 천천히 둘러보세요.</p>
          </div>
          <div className="about-hero__actions">
            <Link href="/search" className="about-btn about-btn--accent">
              통합 검색
            </Link>
            <Link href="/" className="about-btn about-btn--ghost-light">
              홈으로
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
