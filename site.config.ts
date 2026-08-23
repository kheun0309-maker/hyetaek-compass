/**
 * 사이트 전역 설정. 배포 전에 이 파일의 값만 바꾸면 됩니다.
 */
export const siteConfig = {
  name: "혜택나침반",
  shortName: "혜택나침반",
  description:
    "정부지원금·복지수당·민원 발급까지, 놓치기 쉬운 국가 혜택을 절차 그대로 정리합니다.",
  // ⚠️ 배포 도메인으로 반드시 교체하세요 (사이트맵/OG/canonical에 사용)
  url: "https://example.com" as string,
  locale: "ko_KR",
  author: "혜택나침반 편집팀",
  email: "contact@example.com" as string,

  // Google AdSense — 승인 후 발급받은 값으로 교체 (예: "ca-pub-1234567890123456")
  adsense: {
    client: "" as string,
    // 애드센스 > 광고 > 광고 단위에서 만든 슬롯 ID를 넣으세요.
    slots: {
      /** 본문 중간 삽입용 (in-article 형식으로 생성) */
      inArticle: "" as string,
      /** 상단/하단 디스플레이 배너 */
      display: "" as string,
      /** 모바일 하단 고정 앵커 */
      anchor: "" as string,
    },
  },

  /**
   * 광고 배치 정책.
   * ⚠️ 광고를 늘리면 단기 수익은 오르지만, 콘텐츠 대비 광고 비율이 높으면
   *    애드센스 정책 위반(스크린 대비 광고 과다)과 SEO 순위 하락으로 이어집니다.
   *    아래 기본값이 "수익 / 사용자경험" 균형점입니다.
   */
  ads: {
    /** 본문 H2 몇 개마다 광고를 하나 넣을지. 2~3 권장. 1은 과밀. */
    inArticleEveryNHeadings: 2,
    /** 본문 안에 넣을 광고 최대 개수 */
    maxInArticle: 3,
    /** 제목 바로 아래(첫 화면) 배너 — 뷰어빌리티가 가장 높아 RPM 기여가 큼 */
    showTopBanner: true,
    /** 본문 끝 배너 — 이탈 직전 클릭률이 높음 */
    showBottomBanner: true,
    /** 모바일 하단 고정 앵커 — 한국 정보 블로그에서 단일 최고 수익 지면 */
    showStickyAnchor: true,
    /** 글 길이가 이보다 짧으면 본문 광고를 넣지 않음 (얇은 콘텐츠 정책 회피) */
    minCharsForInArticle: 1200,
  },

  /** 애드센스 외 다른 광고 네트워크를 쓸 때 ads.txt에 추가할 줄 */
  extraAdsTxt: [] as string[],

  /** 제휴 마케팅 (쿠팡 파트너스 등) */
  affiliate: {
    /** 쿠팡 파트너스 트래킹 코드. 예: "AF1234567" */
    coupangId: "" as string,
    /** 법적으로 요구되는 대가성 표시 문구 */
    disclosure:
      "이 글에는 제휴 링크가 포함되어 있으며, 링크를 통한 구매 시 운영자가 일정액의 수수료를 받습니다.",
  },

  // Google Analytics 4 (예: "G-XXXXXXXXXX")
  gaId: "" as string,

  // 검색엔진 소유 확인
  verification: {
    google: "" as string,
    naver: "" as string,
    // 다음(카카오)은 메타태그 대신 인증 HTML 파일 업로드 방식입니다.
    // 웹마스터도구에서 받은 파일을 public/ 폴더에 그대로 넣으면
    // https://도메인/파일명.html 로 접근되어 인증이 완료됩니다.
    // (이 값은 사용하지 않으므로 비워두어도 됩니다)
    daum: "" as string,
  },

  postsPerPage: 12,
} as const;

export type CategorySlug =
  | "subsidy"
  | "welfare"
  | "housing"
  | "health"
  | "tax"
  | "admin";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  emoji: string;
}

export const categories: Category[] = [
  {
    slug: "subsidy",
    name: "정부지원금",
    description: "정부·지자체가 주는 현금성 지원금 신청 자격과 절차",
    emoji: "💰",
  },
  {
    slug: "welfare",
    name: "복지·수당",
    description: "기초연금, 아동수당, 각종 바우처 등 복지 제도 총정리",
    emoji: "🤝",
  },
  {
    slug: "housing",
    name: "주거·청년",
    description: "청년월세, 전세대출, 행복주택 등 주거 지원 제도",
    emoji: "🏠",
  },
  {
    slug: "health",
    name: "건강·의료",
    description: "건강검진, 의료비 지원, 산정특례 등 의료 혜택",
    emoji: "🩺",
  },
  {
    slug: "tax",
    name: "세금·환급",
    description: "연말정산, 각종 환급금, 세금 감면 신청 방법",
    emoji: "🧾",
  },
  {
    slug: "admin",
    name: "민원·행정",
    description: "증명서 발급, 온라인 민원 신청 절차 안내",
    emoji: "📋",
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;
