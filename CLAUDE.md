# CLAUDE.md

Cursor Agent를 위한 프로젝트 가이드. 상세는 `.cursor/rules/*.mdc`와 `PROJECT-MAP.md`를 참조한다.

## 1. 프로젝트 개요

**행정산책** — 정부지원금·복지·민원 안내 사이트. Next.js 정적 내보내기 + 콘텐츠 자동화 파이프라인.

- 런타임: Next.js App Router, React 19, TypeScript, 완전 정적 HTML (`out/`)
- 콘텐츠: `content/posts/*.md` (파일명 = URL 슬러그)
- 자동화: `scripts/` (발굴 → 생성 → 검토 → 인덱스)
- 배포: Cloudflare Pages (`npm run build:static` → `out/`)
- 전역 설정: `site.config.ts`, `automation.config.ts`

백엔드·DB·세션 인증은 없다. 서버 기능이 필요하면 `BUILD_TARGET=server`로만 전환한다.

## 2. 빠른 시작

```powershell
npm install
npm run doctor          # 설정·API 키 진단
npm run dev             # http://localhost:3000 (초안 draft:true 도 보임)
npm run build:static    # 배포용 정적 빌드 → out/
```

## 3. 핵심 설계 원칙

| 원칙 | 근거 룰 |
|---|---|
| 커밋·푸시·운영 배포는 사용자 요청 없이 하지 않는다 | `no-direct-deploy.mdc` |
| 문제 발생 시 근본 원인 분석 → 항구적 수정 | `problem-solving.mdc` |
| 설정값(도메인, 광고, 카테고리, 램프)은 `site.config.ts` / `automation.config.ts`에만 둔다 | `professional-dev-agent.mdc` |
| UI는 CSS 변수(`src/app/globals.css`)로만 색·간격을 주고, 절제된 정보 계층을 유지한다 | `ui-design-philosophy.mdc` |
| 프롬프트는 `scripts/lib/prompts.ts` 한 곳, 슬러그는 발행 후 변경 금지 | `frontend-development-rules.mdc`, `content-pipeline.mdc` |
| 중요 기술 결정·버그 원인은 해당 도메인 룰에 자동 캡처 | `knowledge-capture.mdc` |

## 4. 작업별 참조

| 작업 | 참조 |
|---|---|
| 파일 위치 찾기 | `PROJECT-MAP.md` |
| 수익·애드센스·운영 순서 | `PLAYBOOK.md` |
| 배포 절차 | `DEPLOY.md` |
| UI/라우트/컴포넌트 | `frontend-development-rules.mdc` |
| 글 생성·키워드·프롬프트 | `content-pipeline.mdc` |
| 멀티 에이전트 개발 | `multi-agent-workflow.mdc` |
| PowerShell `$` 이스케이프 | `powershell-escape.mdc` |

## 5. Cursor 룰 (`.cursor/rules/`)

| 파일 | 적용 | 내용 |
|---|---|---|
| `professional-dev-agent.mdc` | 항상 | 범용 설계, 설정 외부화, 검증 |
| `problem-solving.mdc` | 항상 | 근본 원인 → 항구적 수정 |
| `knowledge-capture.mdc` | 항상 | 중요 결정을 룰에 기록 |
| `frontend-development-rules.mdc` | 항상 | App Router, SEO, 컴포넌트 |
| `ui-design-philosophy.mdc` | 항상 | 토큰·절제된 UI |
| `no-direct-deploy.mdc` | 항상 | 무단 커밋/푸시/배포 금지 |
| `multi-agent-workflow.mdc` | 요청 시 | 4단계 전문 에이전트 워크플로 |
| `content-pipeline.mdc` | 요청 시 | 키워드·생성·프롬프트 |
| `powershell-escape.mdc` | 요청 시 | PowerShell `$` / `&&` |

전문 에이전트 방식으로 개발하려면 **"전문 에이전트 방식으로 개발해줘"** 라고 요청한다.

## 6. 주의사항

- **민감 정보 커밋 금지**: `.env`는 `.gitignore`에 있다. API 키를 코드·룰·커밋에 넣지 않는다.
- **PowerShell**: `&&` 대신 `;`. `$`가 들어 있는 명령은 작은따옴표 또는 `powershell-escape.mdc`.
- **정적 내보내기**: `headers()`·이미지 최적화·서버 API는 기본 빌드에서 동작하지 않는다.
- **초안**: `draft: true` 글은 프로덕션 빌드에서 제외된다 (`src/lib/posts.ts`의 `getAllPosts()`).
