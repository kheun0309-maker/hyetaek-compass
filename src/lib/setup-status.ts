import { getAllPosts, getPostsByCategory } from "./posts";
import { siteConfig, categories } from "../../site.config";
import { currentPhase } from "../../automation.config";

export type StatusLevel = "done" | "todo" | "optional";

export interface StatusItem {
  label: string;
  level: StatusLevel;
  /** 현재 값 또는 상태 설명 */
  detail: string;
  /** 어떻게 고치는지 */
  how?: string;
  /** 수정해야 할 파일 */
  file?: string;
}

export interface StatusGroup {
  title: string;
  description: string;
  items: StatusItem[];
}

/**
 * 운영자 대시보드(/setup)에 표시할 설정 상태.
 *
 * ⚠️ 이 함수는 API 키 같은 비밀값을 절대 읽지 않습니다.
 *    site.config.ts에 적힌 공개 설정과 콘텐츠 통계만 다룹니다.
 *    (API 키 점검은 터미널 전용입니다 → npm run doctor)
 */
export function getSetupStatus(): StatusGroup[] {
  const posts = getAllPosts();
  const published = posts.filter((p) => !p.draft);
  const drafts = posts.filter((p) => p.draft);
  const ads = siteConfig.adsense;

  const urlOk =
    siteConfig.url !== "https://example.com" && siteConfig.url.startsWith("https://");
  const emailOk = !siteConfig.email.includes("example.com");

  const emptyCategories = categories.filter(
    (c) => getPostsByCategory(c.slug).filter((p) => !p.draft).length === 0,
  );

  return [
    {
      title: "1단계 · 배포 준비",
      description: "배포 전에 반드시 끝내야 하는 항목입니다.",
      items: [
        {
          label: "도메인 설정",
          level: urlOk ? "done" : "todo",
          detail: siteConfig.url,
          how: urlOk
            ? "설정 완료"
            : "실제 도메인으로 바꾸지 않으면 sitemap·canonical·OG가 전부 무효가 되어 검색에 잡히지 않습니다.",
          file: "site.config.ts → url",
        },
        {
          label: "문의 이메일",
          level: emailOk ? "done" : "todo",
          detail: siteConfig.email,
          how: emailOk
            ? "설정 완료"
            : "애드센스 심사에서 연락처 확인 항목입니다. 실제 사용하는 주소로 바꾸세요.",
          file: "site.config.ts → email",
        },
        {
          label: "사이트 이름",
          level: "done",
          detail: siteConfig.name,
          file: "site.config.ts → name",
        },
      ],
    },
    {
      title: "2단계 · 콘텐츠 확보",
      description: "애드센스 승인의 실질적인 관문입니다.",
      items: [
        {
          label: "발행된 글",
          level: published.length >= 30 ? "done" : "todo",
          detail: `${published.length}편`,
          how:
            published.length >= 30
              ? "애드센스 신청 가능한 분량입니다."
              : `승인 신청까지 ${30 - published.length}편 더 필요합니다. npm run pipeline 으로 초안을 만들고 검토 후 발행하세요.`,
        },
        {
          label: "검토 대기 초안",
          level: drafts.length === 0 ? "done" : "optional",
          detail: `${drafts.length}편`,
          how:
            drafts.length === 0
              ? "대기 중인 초안이 없습니다."
              : "npm run review 로 목록을 확인하고, 사실 확인 후 발행하세요. 검토 없이 발행하면 구글 제재 대상입니다.",
        },
        {
          label: "빈 카테고리",
          level: emptyCategories.length === 0 ? "done" : "todo",
          detail:
            emptyCategories.length === 0
              ? "없음"
              : emptyCategories.map((c) => c.name).join(", "),
          how:
            emptyCategories.length === 0
              ? "모든 카테고리에 글이 있습니다."
              : "글이 0편인 카테고리는 심사에서 감점 요인입니다. 각 카테고리에 최소 3편씩 채우세요.",
        },
      ],
    },
    {
      title: "3단계 · 검색 노출",
      description: "등록하지 않으면 검색에 절대 나오지 않습니다.",
      items: [
        {
          label: "구글 소유확인",
          level: siteConfig.verification.google ? "done" : "todo",
          detail: siteConfig.verification.google || "미설정",
          how: "search.google.com/search-console 에서 HTML 태그 방식으로 받은 값을 넣고 재배포하세요.",
          file: "site.config.ts → verification.google",
        },
        {
          label: "네이버 소유확인",
          level: siteConfig.verification.naver ? "done" : "todo",
          detail: siteConfig.verification.naver || "미설정",
          how: "searchadvisor.naver.com 등록. 네이버는 등록하지 않으면 사실상 노출되지 않습니다. 소유확인 후 사이트맵과 RSS를 모두 제출하세요.",
          file: "site.config.ts → verification.naver",
        },
        {
          label: "GA4 분석",
          level: siteConfig.gaId ? "done" : "optional",
          detail: siteConfig.gaId || "미설정",
          how: "방문 통계 없이는 무엇을 고쳐야 할지 알 수 없습니다. 초기에 넣어두세요.",
          file: "site.config.ts → gaId",
        },
      ],
    },
    {
      title: "4단계 · 수익화",
      description: "애드센스 승인 후에 채우는 항목입니다.",
      items: [
        {
          label: "애드센스 client",
          level: ads.client ? "done" : "optional",
          detail: ads.client || "미설정 (광고 자리표시자 표시 중)",
          how: "승인 후 ca-pub- 으로 시작하는 게시자 ID를 넣으세요. /ads.txt 가 자동으로 생성됩니다.",
          file: "site.config.ts → adsense.client",
        },
        {
          label: "광고 슬롯",
          level: ads.slots.inArticle && ads.slots.display && ads.slots.anchor ? "done" : "optional",
          detail: [
            ads.slots.inArticle ? "본문삽입 ✓" : "본문삽입 ✗",
            ads.slots.display ? "디스플레이 ✓" : "디스플레이 ✗",
            ads.slots.anchor ? "앵커 ✓" : "앵커 ✗",
          ].join(" · "),
          how: "애드센스 → 광고 → 광고 단위에서 3개를 만들고 각 ID를 넣으세요.",
          file: "site.config.ts → adsense.slots",
        },
        {
          label: "제휴 마케팅",
          level: siteConfig.affiliate.coupangId ? "done" : "optional",
          detail: siteConfig.affiliate.coupangId || "미설정",
          how: "글이 100편을 넘은 뒤에 붙이세요. AffiliateBox 컴포넌트가 대가성 표시와 rel 속성을 자동 처리합니다.",
          file: "site.config.ts → affiliate",
        },
      ],
    },
  ];
}

export interface ContentStats {
  published: number;
  drafts: number;
  byCategory: { name: string; emoji: string; slug: string; count: number }[];
  phaseLabel: string;
  perRun: number;
  totalChars: number;
}

export function getContentStats(): ContentStats {
  const posts = getAllPosts();
  const published = posts.filter((p) => !p.draft);
  const phase = currentPhase(published.length);

  return {
    published: published.length,
    drafts: posts.length - published.length,
    byCategory: categories.map((c) => ({
      name: c.name,
      emoji: c.emoji,
      slug: c.slug,
      count: getPostsByCategory(c.slug).filter((p) => !p.draft).length,
    })),
    phaseLabel: phase.label,
    perRun: phase.perRun,
    totalChars: published.reduce((sum, p) => sum + p.body.length, 0),
  };
}

/** 전체 진행률 (선택 항목 제외) */
export function getProgress(groups: StatusGroup[]): { done: number; total: number } {
  const required = groups.flatMap((g) => g.items).filter((i) => i.level !== "optional");
  return {
    done: required.filter((i) => i.level === "done").length,
    total: required.length,
  };
}
