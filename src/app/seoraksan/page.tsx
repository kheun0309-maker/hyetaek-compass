import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getSeoraksanDigest, getSeoraksanPosts } from "@/lib/seoraksan";
import PhotoCredit from "@/components/PhotoCredit";
import VideoPreview from "@/components/VideoPreview";
import AdSlot from "@/components/AdSlot";
import DataFreshness from "@/components/DataFreshness";
import { automationConfig } from "../../../automation.config";
import type { SourceKind } from "@/lib/topic-types";

export const dynamic = "force-static";
export const metadata = pageMetadata({ title: "설악산 여행 안내 — 단풍·차편·최근 소식", description: "설악산국립공원 여행을 준비하는 단풍·교통·탐방 안내와 날짜가 확인되는 공식 소식, 신문, 유튜브, 블로그 원문을 모았습니다.", path: "/seoraksan", image: "/images/seoraksan-autumn.jpg" });

const groups: { kind: SourceKind; title: string; note: string }[] = [
  { kind: "official", title: "공원·기상 공식 소식", note: "탐방로 통제·입산시간·예약 조건은 원문과 첨부 공고를 확인하세요." },
  { kind: "news", title: "신문·지역 소식", note: "지역신문이 공개한 RSS에서 제목·게시일·원문 링크를 모았습니다." },
  { kind: "video", title: "최근 유튜브 산행 영상", note: "제목은 제작자의 표현입니다. 영상의 ‘절정’은 해당 구간·촬영일의 개인 관찰이며 공식 단풍 판정과 다를 수 있어요." },
  { kind: "blog", title: "블로그에서 읽는 탐방 기록", note: "게시일과 방문일은 다를 수 있어요. 예약·교통 조건은 공식 안내에서 다시 확인하세요." },
];

export default function SeoraksanPage() {
  const digest = getSeoraksanDigest();
  const posts = getSeoraksanPosts();
  const cover = posts.find((post) => post.slug === "seoraksan-autumn-guide")?.cover;
  const failures = digest.checks.filter((check) => check.status === "error");
  const collected = new Date(digest.collectedAt);
  const collectedLabel = Number.isNaN(collected.getTime()) ? "수집 대기" : collected.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="topic-page">
      <section className="topic-hero wrap">
        <div className="topic-hero__copy">
          <p className="topic-eyebrow">산길·여행 · 설악산 특집</p>
          <h1>가을 산길에 나서기 전,<br /><strong>설악산을 차근히</strong></h1>
          <p className="topic-lead">단풍이 내려오는 길, 나에게 맞는 코스와 돌아오는 차편.<br />공식 안내와 최근 탐방 기록을 한곳에서 살펴보세요.</p>
          <div className="topic-links">
            <Link className="about-btn about-btn--primary" href="/seoraksan-autumn-guide">단풍·코스 살펴보기</Link>
            <Link className="about-btn about-btn--ghost" href="/seoraksan-transport-guide">차편 확인하기</Link>
          </div>
          <p className="topic-updated">원문 목록 수집: {collectedLabel} (한국시간)</p>
        </div>
        <figure className="topic-hero__photo">
          <img src="/images/seoraksan-autumn.jpg" alt="설악산 계곡과 단풍 숲의 과거 풍경" width={2048} height={1365} />
          {cover && <PhotoCredit cover={cover} />}
        </figure>
      </section>

      <nav className="topic-nav wrap" aria-label="설악산 특집 목차">
        <a href="#guides">여행 준비</a>{groups.map((group) => <a key={group.kind} href={`#${group.kind}`}>{group.title}</a>)}
        <a href="#before-you-go">공식 조회</a>
      </nav>

      <div className="wrap topic-content">
        <aside className="topic-note">
          <strong>첫 단풍 관측과 절정 예보는 구분해서 보세요</strong>
          <p>2026년 9월 28일은 기상청의 첫 단풍 관측일입니다. 10월 17일은 발표에 기재된 절정 평년값으로, 올해 절정 확정일이 아닙니다. 방문할 구간의 사진 촬영일과 기상을 함께 확인하세요.</p>
          <a href="https://www.weather.go.kr/gangwon/html/news/notice_view.jsp?pageNo=1&articleno=13415&boardId=press2" target="_blank" rel="noopener noreferrer">기상청 발표 확인 ↗</a>
        </aside>
        <DataFreshness collectedAt={digest.collectedAt} staleHours={automationConfig.research.staleHours} />
        {failures.length > 0 && <p className="notice" role="status">일부 출처({failures.map((check) => automationConfig.research.seoraksan.sources.find((source) => source.id === check.sourceId)?.label).join(", ")}) 수집에 실패해 마지막 성공 목록을 표시합니다.</p>}

        <section id="guides" className="topic-section">
          <div className="section__head"><h2>여행 준비, 이 순서로</h2></div>
          <div className="topic-guide-grid">
            {posts.filter((post) => post.slug !== "seoraksan-latest-news").map((post, i) => <Link key={post.slug} href={`/${post.slug}`} className="topic-guide">
              <span className="topic-guide__number">0{i + 1}</span><h3>{post.title}</h3><p>{post.description}</p><span className="topic-guide__more">안내 읽기 →</span>
            </Link>)}
          </div>
        </section>

        {groups.map((group) => {
          const items = digest.items.filter((item) => item.kind === group.kind);
          return <section key={group.kind} id={group.kind} className="topic-section">
            <div className="section__head"><h2>{group.title}</h2><span className="section__more">최근 45일 · {items.length}건</span></div>
            <p className="topic-section__note">{group.note}</p>
            {items.length ? <ul className={`source-list${group.kind === "video" ? " source-list--videos" : ""}`}>
              {items.map((item) => <li key={item.url}>
                <div className="source-list__meta"><span>{item.sourceName}</span><time dateTime={item.publishedAt}>{item.publishedAt} 게시</time></div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="source-list__title">{item.title} ↗</a>
                {item.kind === "video" && <VideoPreview url={item.url} title={item.title} />}
              </li>)}
            </ul> : <p className="topic-empty">수집 범위에서 날짜가 확인되는 최근 자료가 없습니다. 공식 채널이나 아래 검색에서 확인하세요.</p>}
            {group.kind === "video" && <a className="topic-search-link" href="https://www.youtube.com/results?search_query=%EC%84%A4%EC%95%85%EC%82%B0+%EB%8B%A8%ED%92%8D&sp=CAI%253D" target="_blank" rel="noopener noreferrer">다른 채널의 최근 영상도 검색 ↗</a>}
            {group.kind === "blog" && <a className="topic-search-link" href="https://search.naver.com/search.naver?where=blog&query=%EC%84%A4%EC%95%85%EC%82%B0%20%EB%8B%A8%ED%92%8D&sm=tab_opt&nso=so%3Add%2Cp%3A1m" target="_blank" rel="noopener noreferrer">개인 블로그의 최근 후기 검색 ↗</a>}
          </section>;
        })}

        <AdSlot format="display" />
        <section id="before-you-go" className="topic-section">
          <div className="section__head"><h2>방문 당일, 공식 화면에서 확인하기</h2></div>
          <div className="topic-official-grid">
            {[
              ["탐방로 통제·입산시간", "국립공원공단", "https://www.knps.or.kr/front/portal/visit/visitCourseMain.do?menuNo=7020091&parkId=120400"],
              ["단풍 사진·기상", "강원지방기상청", "https://www.weather.go.kr/gangwon/maple/"],
              ["탐방로·대피소 예약", "국립공원 예약시스템", "https://res.knps.or.kr/"],
              ["속초 7·7-1번 버스", "속초시 버스정보시스템", "https://bis.sokcho.go.kr/search"],
              ["케이블카 운행·요금", "설악 케이블카", "https://www.sorakcablecar.co.kr/"],
              ["고속·시외버스 예매", "고속버스 통합예매", "https://www.kobus.co.kr/"],
            ].map(([title, name, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer"><strong>{title} ↗</strong><span>{name}</span></a>)}
          </div>
          <p className="topic-scope">공식 사이트와 등록한 공개 RSS·영상 채널을 정기 수집합니다. 인터넷의 모든 게시물을 망라한 목록은 아니며, 새로운 자료가 없거나 수집이 실패하면 그 상태를 표시합니다. 기사·영상·블로그의 본문과 사진은 원문에서 확인하세요.</p>
          <details className="topic-source-checks"><summary>출처별 수집 상태와 마지막 성공 시각</summary><ul>
            {digest.checks.map((check) => {
              const source = automationConfig.research.seoraksan.sources.find((s) => s.id === check.sourceId);
              return <li key={check.sourceId}><a href={source?.home} target="_blank" rel="noopener noreferrer">{source?.label ?? check.sourceId}</a> · {check.status === "ok" ? "정상 수집" : "이번 수집 실패"} · {check.count}건 · 마지막 성공: {check.checkedAt ? new Date(check.checkedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "없음"}</li>;
            })}
          </ul></details>
        </section>
      </div>
    </div>
  );
}
