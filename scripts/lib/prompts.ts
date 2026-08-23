/**
 * 콘텐츠 생성 프롬프트.
 * 행정 코어는 공고·자격·절차 가드, digital/life/money는 funissu형 하우투 공식을 사용합니다.
 */
import { categories, isAdminCategory } from "../../site.config";

export const SYSTEM_PROMPT = `당신은 대한민국 일상 정보를 차근히 안내하는 전문 에디터입니다.
사이트 톤은 "행정산책" — 회사원처럼 또렷하고, 산길처럼 부담 없는 안내입니다.

공통 작성 원칙:
1. 결론을 미루지 않는다. 독자가 바로 할 일을 앞쪽에서 밝힌다.
2. 절차는 반드시 "1단계 → 2단계" 순서로 쓴다. 어디에 들어가 무엇을 누르는지 구체적으로 쓴다.
3. 해마다 바뀌는 금액·요금·기준은 확실하지 않으면 단정하지 말고 "공식 화면에서 최신 기준 확인"이라고 안내한다.
4. 존재를 확신할 수 없는 URL·전화번호·법령 조항 번호는 지어내지 않는다. 서비스·기관 이름으로만 안내한다.
5. 문체는 정중한 해요체. 한 문장은 짧게. 과장·낚시·이모지 남발 금지.
6. 표는 비교·조건처럼 정말 필요할 때만 쓴다.

절대 하지 말 것:
- 사실이 아닐 수 있는 내용을 사실처럼 단정하기
- "필자는", "이 글에서는 알아보겠습니다" 같은 군더더기 도입부
- 같은 문장 반복으로 분량 늘리기`;

export interface PromptInput {
  keyword: string;
  category: string;
  /** 이미 존재하는 글 제목들 — 중복 주제를 피하기 위해 전달 */
  existingTitles?: string[];
}

function frontmatterBlock(): string {
  return `## 출력 형식 (이 형식만 출력. 설명이나 인사말 금지)

---
title: "제목"
description: "검색 결과에 노출될 요약. 90~120자."
slug: "english-kebab-case-slug"
tags: ["태그1", "태그2", "태그3"]
faq:
  - q: "자주 묻는 질문 1"
    a: "2~3문장 답변"
  - q: "자주 묻는 질문 2"
    a: "2~3문장 답변"
  - q: "자주 묻는 질문 3"
    a: "2~3문장 답변"
---

(여기부터 마크다운 본문)

## slug 작성 규칙
- 영문 소문자 + 하이픈만 사용 (예: youth-monthly-rent-support)
- 키워드를 영문으로 옮긴 3~5단어
- 한글, 숫자만으로 된 slug 금지`;
}

function adminBodyRules(): string {
  return `## 제목 작성 규칙
- 검색 키워드를 제목 앞쪽에 그대로 포함
- "[대상] [혜택명] 신청방법, [부가정보] 총정리" 형태
- 40자 이내

## 본문 구조 (반드시 이 순서)
1. 도입부 2~3문장. H2 없이 바로 시작. 누가 얼마를 받을 수 있는지 핵심을 먼저 말한다.
2. \`## 한눈에 보기\` — 지원 대상 / 지원 금액 / 신청 기간 / 신청처를 표로 정리
3. \`## 지원 대상 및 자격 요건\` — 불릿으로 조건 나열, 헷갈리는 조건은 부연 설명
4. \`## 신청 방법\` — \`### 온라인 신청\`, \`### 방문 신청\` 하위 섹션. 각각 번호 매긴 단계별 절차
5. \`## 필요 서류\` — 불릿 목록
6. \`## 자주 묻는 질문\` — 위 frontmatter의 faq 내용을 본문에도 Q/A 형태로 서술
7. \`## 마무리\` — 핵심 3줄 요약 + 확인이 필요한 사항 안내

## 분량
본문 2,500~3,500자 (한글 기준). 각 H2 섹션은 300~600자.

## 행정·복지 글 추가 가드
- 금액·소득 기준·기한은 기준 연도를 함께 표기한다.
- 기관명은 복지로, 정부24, 국민건강보험공단처럼 실재하는 이름으로만 쓴다.`;
}

function tipBodyRules(category: string): string {
  const titleHint =
    category === "money"
      ? '"[서비스/상황] [절약·할인] 방법, [핵심 팁]" 형태'
      : '"[기기/앱/상황] [하고 싶은 일] 방법, [핵심 팁]" 형태';

  return `## 제목 작성 규칙
- 검색 키워드를 제목 앞쪽에 그대로 포함
- ${titleHint}
- 40자 이내. 클릭베이트·허위 절약 금액 금지

## 본문 구조 (반드시 이 순서)
1. 도입부 2~3문장. H2 없이 바로 시작. "무엇이 불편했는지 → 어떻게 해결하는지"를 먼저 말한다.
2. \`## 한눈에 보기\` — 필요한 것 / 대략 소요 시간 / 주의할 점을 짧게 정리 (표 또는 불릿)
3. \`## 따라 하기\` — 번호 매긴 단계. 화면·메뉴 이름을 구체적으로 쓴다. OS·앱 버전이 다르면 분기한다.
4. \`## 안 될 때 확인할 것\` — 흔한 실패 원인과 대안
5. \`## 자주 묻는 질문\` — frontmatter faq를 본문 Q/A로 서술
6. \`## 마무리\` — 핵심 요약 3줄

## 분량
본문 2,000~3,200자 (한글 기준).

## 생활·디지털·할인 글 추가 가드
- 할인율·요금·포인트는 "예시·변동 가능"을 명시하고 확정 수치처럼 단정하지 않는다.
- 특정 쇼핑몰·카드 혜택은 가입 권유 톤으로 쓰지 말고, 확인 방법 중심으로 쓴다.`;
}

export function buildUserPrompt({
  keyword,
  category,
  existingTitles = [],
}: PromptInput): string {
  const cat = categories.find((c) => c.slug === category);
  const catLine = cat ? `${cat.name} (${cat.description})` : category;
  const admin = isAdminCategory(category);

  const dupBlock =
    existingTitles.length > 0
      ? `\n## 이미 발행된 글 (주제가 겹치지 않게 할 것)\n${existingTitles
          .slice(0, 40)
          .map((t) => `- ${t}`)
          .join("\n")}\n`
      : "";

  return `아래 검색 키워드로 정보성 글 한 편을 작성하세요.

## 검색 키워드
${keyword}

## 카테고리
${catLine}
${dupBlock}
${frontmatterBlock()}

${admin ? adminBodyRules() : tipBodyRules(category)}`;
}

/** 키워드 확장용 프롬프트 — 1개 시드에서 롱테일 키워드 여러 개를 뽑습니다. */
export function buildKeywordPrompt(seed: string, count: number): string {
  return `"${seed}" 주제와 관련해서, 한국 사람들이 실제로 검색창에 칠 법한
롱테일 검색 키워드 ${count}개를 뽑아주세요.

조건:
- 대형 언론사/공공기관 사이트가 이미 1페이지를 장악한 초광범위 키워드(예: "정부지원금", "아이폰")는 제외
- "누가 + 무엇을 + 어떻게" 가 드러나는 구체적인 질문형·상황형 키워드 위주
  (예: "청년월세 특별지원 재신청 방법", "아이폰 재난문자 끄는 방법")
- 각 키워드는 8~25자

출력은 아래 JSON 배열 하나만. 다른 텍스트 금지.
[
  {"keyword": "키워드", "category": "카테고리slug", "intent": "검색 의도 한 줄"}
]

사용 가능한 카테고리 slug: ${categories.map((c) => c.slug).join(", ")}`;
}

/**
 * 자동 발굴 프롬프트.
 * "이미 다룬 것"을 명시해 중복을 막고, 커버리지가 빈 영역을 채우게 유도합니다.
 */
export function buildDiscoveryPrompt(input: {
  categoryName: string;
  categorySlug: string;
  categoryDesc: string;
  seeds: string[];
  existingKeywords: string[];
  existingTitles: string[];
  count: number;
}): string {
  const {
    categoryName,
    categorySlug,
    categoryDesc,
    seeds,
    existingKeywords,
    existingTitles,
    count,
  } = input;

  const seedBlock =
    seeds.length > 0
      ? `\n## 이 카테고리의 대표 주제 영역\n${seeds.map((s) => `- ${s}`).join("\n")}\n`
      : "";

  const usedBlock =
    existingKeywords.length > 0 || existingTitles.length > 0
      ? `\n## 이미 다뤘거나 예약된 주제 (절대 중복 금지)\n${[
          ...existingKeywords,
          ...existingTitles,
        ]
          .slice(0, 120)
          .map((s) => `- ${s}`)
          .join("\n")}\n`
      : "";

  const intentHint = isAdminCategory(categorySlug)
    ? `"자격/신청방법/서류/기간/금액/거절사유/재신청" 같은 실행형 의도`
    : `"설정방법/끄는법/하는법/안될때/절약/할인" 같은 실행형 의도`;

  return `"${categoryName}" 카테고리(${categoryDesc})에서
아직 다루지 않은 롱테일 검색 키워드 ${count}개를 발굴하세요.
${seedBlock}${usedBlock}
## 발굴 기준
1. 실제 한국 사람이 검색창에 칠 법한 구체적인 표현일 것
2. 대형 기관·언론사가 이미 점유한 초광범위 단일 키워드는 제외
3. ${intentHint}를 담을 것
4. 서로 겹치지 않게, 세부 주제를 최대한 분산시킬 것
5. 위 "이미 다뤘거나 예약된 주제"와 의미가 겹치면 안 됨

## 출력
아래 JSON 배열 하나만 출력. 설명·인사말·코드펜스 금지.
[
  {"keyword": "키워드", "category": "${categorySlug}", "intent": "검색 의도 한 줄"}
]`;
}
