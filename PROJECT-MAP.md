# 프로젝트 지도

> **이 파일의 목적**: 무언가를 고칠 때 **전체 코드를 뒤지지 않고** 해당 파일만 열도록 안내합니다.
> 파일을 추가하면 이 문서도 함께 갱신하세요.

---

## 1. "이걸 바꾸고 싶다" → "이 파일만 열면 된다"

| 하고 싶은 일 | 열어야 할 파일 |
|---|---|
| 사이트 이름·도메인·이메일 변경 | `site.config.ts` (상단) |
| 애드센스 ID / 광고 슬롯 ID 입력 | `site.config.ts` → `adsense` |
| 광고 개수·위치 조절 | `site.config.ts` → `ads` |
| 쿠팡 파트너스 등 제휴 설정 | `site.config.ts` → `affiliate` |
| GA4 / 서치콘솔·네이버 소유확인 코드 | `site.config.ts` → `gaId`, `verification` |
| 카테고리 추가·삭제·이름 변경 | `site.config.ts` → `categories` (+ `CategorySlug`, `pillar`) |
| 헤더에 바로 보일 카테고리 | `site.config.ts` → `navPrimarySlugs` |
| 하루 몇 개씩 자동 생성할지 | `automation.config.ts` → `ramp` |
| 자동 발굴 주제 범위 넓히기 | `data/seeds.txt` |
| AI가 쓰는 글의 구조·문체·규칙 | `scripts/lib/prompts.ts` |
| AI 프로바이더 추가 (예: Gemini) | `scripts/lib/providers/` |
| 색상·폰트·여백 등 디자인 | `src/app/globals.css` (최상단 토큰) |
| 글 본문 레이아웃 / 광고 삽입 위치 | `src/app/[slug]/page.tsx` |
| 홈 화면 구성 | `src/app/page.tsx` |
| 헤더 메뉴 / 로고 | `src/components/Header.tsx` |
| 푸터 링크 | `src/components/Footer.tsx` |
| 검색 동작·점수 방식 | `src/lib/search-client.ts` |
| 초성 검색 로직 | `src/lib/hangul.ts` |
| 사이트맵에 포함할 URL | `src/app/sitemap.ts` |
| robots.txt 규칙 | `src/app/robots.ts` |
| 구조화 데이터(JSON-LD) | `src/lib/seo.ts` |
| 개인정보처리방침·이용약관 문구 | `src/app/privacy/`, `src/app/terms/` |
| 자동 실행 시각(cron) | `.github/workflows/content.yml` |
| 설악산 수집 출처·기간·제한 변경 | `automation.config.ts` → `research` |
| 설악산 공지·RSS 파싱·실패 처리 | `scripts/lib/source-feed.ts`, `scripts/refresh-sources.ts` |
| 설악산 특집 화면 | `src/app/seoraksan/page.tsx`, `src/lib/seoraksan.ts` |
| 출처별 마지막 성공 상태 | `data/topics/seoraksan.json` |
| AI 미검토 글 공개 차단 | `src/lib/publication.ts` |
| 사진 저작자 표기·영상·갱신 지연 표시 | `PhotoCredit.tsx`, `VideoPreview.tsx`, `DataFreshness.tsx` |
| 수집·발행·마크다운 회귀 검사 | `tests/` (`npm run check`) |
| 정적 호스팅 캐시 헤더 | `public/_headers` |
| 리다이렉트 규칙 | `public/_redirects` |
| 배포 절차 | `DEPLOY.md` |
| API 키 입력 | `.env` (`.env.example` 참고) |
| 설정 대시보드 내용 | `src/lib/setup-status.ts` |
| 빌드 모드 전환 | `next.config.ts` (`BUILD_TARGET=static`) |

---

## 2. 디렉터리 구조

```
site/
├─ site.config.ts            ★ 사이트·광고·제휴 전역 설정 (가장 먼저 수정할 파일)
├─ automation.config.ts      ★ 자동 발행량 램프 설정
├─ next.config.ts               Next.js 설정 (캐시 헤더 등)
│
├─ content/posts/*.md        ★ 글 원본. 파일명 = URL 슬러그
├─ data/
│   ├─ keywords.csv          ★ 키워드 재고 (status=done 이면 처리 완료)
│   └─ seeds.txt                자동 발굴의 주제 앵커
│
├─ scripts/                     Node 스크립트 (사이트 런타임과 분리)
│   ├─ pipeline.ts           ★ 오케스트레이터: 발굴 → 생성 → 인덱스
│   ├─ discover.ts              카테고리 갭 기반 키워드 자동 발굴
│   ├─ generate.ts              키워드 → 마크다운 초안 생성
│   ├─ review.ts                초안 목록 확인 / 발행 처리
│   ├─ expand-keywords.ts       시드 하나로 키워드 확장 (수동용)
│   ├─ new-post.ts              빈 글 템플릿 생성 (AI 없이 직접 쓸 때)
│   ├─ doctor.ts            ★ 설정 진단 + API 연결 테스트
│   ├─ build-search-index.ts    검색 인덱스 JSON 생성
│   └─ lib/
│       ├─ providers/        ★ AI 프로바이더 추상화
│       │   ├─ index.ts         팩토리 (--provider / AI_PROVIDER 해석)
│       │   ├─ anthropic.ts     Claude (@anthropic-ai/sdk)
│       │   ├─ openai-compatible.ts  OpenAI + Grok(xAI)
│       │   └─ types.ts         공통 인터페이스
│       ├─ prompts.ts        ★ 모든 프롬프트가 여기 한 곳에 모여 있음
│       ├─ inventory.ts         재고 조회 / 카테고리 균형 / done 처리
│       ├─ cli.ts               인자 파서
│       └─ csv.ts               CSV 파서
│
├─ src/
│   ├─ app/                     라우트 (App Router)
│   │   ├─ layout.tsx           전역 레이아웃 · 메타데이터 · 스크립트
│   │   ├─ globals.css       ★ 전체 스타일 (상단에 디자인 토큰)
│   │   ├─ page.tsx             홈
│   │   ├─ page/[page]/         홈 2페이지 이후
│   │   ├─ [slug]/           ★ 글 상세 (광고 삽입 로직 포함)
│   │   ├─ category/[slug]/     카테고리 목록 (+ /page/[page])
│   │   ├─ tag/[tag]/           태그 목록
│   │   ├─ search/              검색 페이지
│   │   ├─ setup/           ★ 운영자 설정 대시보드 (noindex)
│   │   ├─ about, contact,      애드센스 심사 필수 페이지
│   │   │  privacy, terms/
│   │   ├─ sitemap.ts           /sitemap.xml
│   │   ├─ robots.ts            /robots.txt
│   │   ├─ rss.xml/route.ts     /rss.xml
│   │   └─ ads.txt/route.ts     /ads.txt (광고 수익 보호)
│   │
│   ├─ components/
│   │   ├─ AdSlot.tsx        ★ 광고 슬롯 (지연 로딩 · CLS 방지)
│   │   ├─ StickyAnchorAd.tsx   모바일 하단 고정 광고
│   │   ├─ Affiliate.tsx        제휴 링크 박스 (대가성 표시 포함)
│   │   ├─ SearchBox.tsx     ★ 검색 UI (헤더/페이지 겸용)
│   │   ├─ Header, Footer, PostCard, Toc, Pagination
│   │   └─ ThirdParty.tsx       애드센스·GA4 로더 · JSON-LD
│   │
│   └─ lib/
│       ├─ posts.ts          ★ 마크다운 읽기 · 정렬 · 관련글
│       ├─ markdown.ts       ★ 마크다운 → HTML + 목차 + 광고 분할
│       ├─ search-client.ts     클라이언트 검색 (점수 계산)
│       ├─ hangul.ts            초성 추출 · 정규화
│       ├─ seo.ts               메타데이터 · JSON-LD 빌더
│       ├─ setup-status.ts      /setup 페이지의 체크리스트 정의
│       └─ types.ts             공통 타입
│
└─ .github/workflows/content.yml  매일 자동 실행
```

---

## 3. 데이터 흐름

```
data/seeds.txt ──┐
                 ├─▶ discover.ts ──▶ data/keywords.csv
content/posts ───┘   (AI: 갭 분석)      (status="")
                                            │
                                            ▼
                                      generate.ts
                                   (AI: 본문 작성)
                                            │
                                            ▼
                            content/posts/<slug>.md
                            draft: true / reviewed: false
                                            │
                                    ┌───────┴───────┐
                                    │  사람이 검토   │  ← 사실·절차 확인
                                    └───────┬───────┘
                                            │
                                     review.ts --publish
                                            │
                                  draft: false / reviewed: true
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                  build-search-index   sitemap.ts        [slug]/page.tsx
                  → search-index.json  → /sitemap.xml    → 정적 HTML
```

---

## 4. 명령어

공개 출처 경로는 AI 해설과 별개입니다. `refresh-sources.ts` → `data/topics/seoraksan.json` + 고정 URL 소식 글 → 검사·정적 빌드 → GitHub 저장 → Cloudflare Pages. 제목·게시일·원문 링크만 자동 발행하고, 수집 실패는 마지막 성공 상태를 보존합니다.

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버. 초안(`draft:true`)도 보입니다 |
| `npm run build` | 일반 Next.js 빌드 (로컬 확인용) |
| `npm run build:static` | **배포용.** 완전 정적 내보내기 → `out/` |
| `npm run preview:static` | Cloudflare 런타임으로 배포본 로컬 확인 |
| `npm run deploy` | wrangler로 Cloudflare Pages 직접 배포 |
| `npm run pipeline` | 발굴 → 생성 → 인덱스 자동 진행 |
| `npm run pipeline -- --dry` | 계획만 출력 (API 호출·비용 없음) |
| `npm run discover` | 키워드만 발굴 |
| `npm run generate -- --limit 5` | 초안 5개 생성 |
| `npm run generate -- --keyword "..." --category tax` | 특정 키워드 하나만 |
| `npm run review` | 검토 대기 초안 목록 |
| `npm run review -- --publish <슬러그>` | 초안 발행 |
| `npm run new -- --slug ... --title "..."` | 빈 템플릿 (직접 작성용) |
| `npm run doctor` | 설정 진단 + API 키 연결 테스트 |
| `npm run doctor -- --models` | 내 계정에서 쓸 수 있는 모델 ID 목록 |
| `npm run index` | 검색 인덱스만 재생성 |
| `npm run refresh:sources` | 공개 출처 수집·설악산 소식 갱신 (키 불필요) |
| `npm run check` | 타입 및 회귀 검사 |

모든 AI 명령에 `--provider anthropic\|openai\|grok` 를 붙여 모델을 바꿀 수 있습니다.

---

## 5. 규칙

1. **`draft: true` 인 글은 프로덕션 빌드에서 자동 제외됩니다.** `src/lib/posts.ts`의 `getAllPosts()`가 처리합니다.
2. **슬러그는 영문 kebab-case.** 파일명이 곧 URL이며, 한 번 발행한 뒤에는 바꾸지 마세요(색인이 끊깁니다).
3. **프롬프트 수정은 `scripts/lib/prompts.ts` 한 곳에서만.** 여러 곳에 흩어지면 품질 관리가 불가능해집니다.
4. **광고를 늘리기 전에 `site.config.ts`의 `ads` 주석을 읽으세요.** 과밀은 정책 위반 + 순위 하락입니다.
