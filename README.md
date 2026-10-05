# 행정산책

행정·복지, 디지털·생활비, 산길·여행을 차근히 안내하는 사이트.
**Next.js 15 정적 생성 + AI 콘텐츠 파이프라인 + 한글 검색 + 애드센스 최적화.**

- 📍 **[PROJECT-MAP.md](PROJECT-MAP.md)** — 뭘 고치려면 어떤 파일을 열어야 하는지
- 🚀 **[DEPLOY.md](DEPLOY.md)** — Cloudflare Pages 배포 단계별 가이드
- 💰 **[PLAYBOOK.md](PLAYBOOK.md)** — 애드센스 승인부터 포털 등록, 수익화 운영까지

---

## 빠른 시작

```bash
npm install
cp .env.example .env      # 이미 생성되어 있습니다. 키만 채우세요
npm run doctor            # 설정 점검 + API 연결 테스트
npm run dev               # http://localhost:3006
```

**설정 상태는 브라우저에서도 볼 수 있습니다** → http://localhost:3006/setup
(운영자 전용 대시보드. 검색엔진에 노출되지 않으며 API 키는 표시하지 않습니다)

`.env`에서 AI 프로바이더를 고릅니다.

```bash
AI_PROVIDER=openai        # openai | anthropic | grok
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.1      # 계정에서 쓸 수 있는 ID로 맞추세요
```

모델 ID가 맞는지 모르겠다면:

```bash
npm run doctor -- --models
```

---

## 콘텐츠 만들기

```bash
# 자동: 키워드 발굴 → 초안 생성 → 인덱스 갱신까지 한 번에
npm run pipeline
npm run pipeline -- --dry           # 비용 없이 계획만 확인

# 사실·절차를 검토한 뒤 발행
npm run review
npm run review -- --publish <슬러그>

# 개별 실행
npm run discover                                     # 키워드만 발굴
npm run generate -- --keyword "청년월세 신청" --category housing
npm run new -- --slug my-post --title "제목"         # AI 없이 직접
```

프로바이더는 아무 명령에나 붙일 수 있습니다.

```bash
npm run generate -- --limit 5 --provider grok
npm run discover -- --provider openai
```

---

## 주요 특징

| | |
|---|---|
| **정적 생성** | 모든 글이 빌드 시 HTML로 구워집니다. 서버 비용 0원, 최고 속도 |
| **멀티 AI** | Claude / OpenAI / Grok 을 명령 하나로 전환 |
| **자동 수집** | 공식 공지·지역신문·블로그·유튜브의 제목·게시일·원문 링크를 매일 갱신 |
| **선택적 AI 램프** | API 키와 활성화 변수를 설정하면 회당 초안 개수 조절 |
| **초성 검색** | `ㅊㄴㅇㅅ` → 청년월세. 서버 없이 클라이언트에서 동작 |
| **광고 최적화** | 지연 로딩 · CLS 0 · 광고 과밀 방지 가드 |
| **SEO 기본기** | 사이트맵 · robots · JSON-LD · RSS · ads.txt 자동 생성 |
| **안전장치** | AI 초안은 `draft:true`. 사람이 검토해야 발행됨 |

## 설악산 자동 운영

- `/seoraksan`: 단풍·코스·차편·방문 준비와 출처별 최근 자료.
- `/seoraksan-latest-news`: 고정 URL에서 소식 목록만 갱신. 원문 본문·사진은 복제하지 않음.
- `npm run refresh:sources`: API 키 없이 공개 출처를 수집. 출처와 검색 범위는 `automation.config.ts`의 `research`에 설정.
- GitHub Actions는 매일 **한국시간 09:17** 예약 실행(지연 가능). 수집 → 타입·11개 회귀 검사 → 정적 빌드 → 변경 저장 → 연결된 Cloudflare Pages 배포.
- 최근 45일의 설악산 관련 제목만 수집. 실패한 출처는 이전 목록과 마지막 성공 시각을 유지. 공식 출처가 모두 실패하거나 검사·빌드에 실패하면 갱신 커밋을 만들지 않음.
- 배포가 멈춰도 특집 열람 시 수집 후 48시간 경과 여부를 확인. 영상은 클릭할 때만 삽입.
- 사진에는 저작자·이용허락·실제 촬영일을 표시. 과거 자료 사진이며 올해 단풍 실황으로 표시하지 않음.

GitHub의 Actions → **자동 콘텐츠 파이프라인 → Run workflow**에서 즉시 출처 갱신을 실행할 수 있습니다. `count`를 비우면 기본적으로 AI를 호출하지 않습니다.

AI 초안도 예약 생성하려면 저장소 변수 `CONTENT_GENERATION_ENABLED=true`, `AI_PROVIDER=openai|anthropic|grok`와 해당 Secret(`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`)을 설정하세요. 모델 ID는 해당 `*_MODEL` 변수로 설정합니다. AI 생성 실패는 실행 결과에 실패로 남으며, 검증을 통과한 출처 갱신은 저장됩니다. AI 해설은 `reviewed:true`까지 공개 빌드·검색·사이트맵에서 제외합니다.

```bash
npm run refresh:sources -- --dry  # 네트워크·파일 변경 없이 과정 확인
npm run check                    # 타입 및 회귀 검사 (lint도 타입 검사에 연결)
npm run build:static             # 배포 검증
```

---

## 배포 — Cloudflare Pages

완전 정적 빌드라 무료 플랜에서 **상업적 이용(광고 게재)이 허용**되고 대역폭 제한도 없습니다.

```bash
npm run build:static     # out/ 폴더에 정적 HTML 생성
npm run preview:static   # Cloudflare 런타임으로 로컬 확인 (127.0.0.1:8788)
npm run deploy           # wrangler로 직접 배포 (선택)
```

Cloudflare Pages 대시보드 설정:

| 항목 | 값 |
|---|---|
| Framework preset | **None** |
| Build command | `npm run build:static` |
| Build output directory | `out` |

**단계별 안내는 [DEPLOY.md](DEPLOY.md)** 를 보세요. 도메인 연결, 배포 확인, 문제 해결까지 정리되어 있습니다.

> 배포 전 **`site.config.ts`의 `url`을 실제 도메인으로 바꾸세요.**
> 안 바꾸면 sitemap·canonical·OG가 전부 `example.com`을 가리켜 무효가 됩니다.

배포 후 [PLAYBOOK.md](PLAYBOOK.md) 4번(포털 등록)을 진행하세요.

---

## 문제 해결

### 화면이 스타일 없이 텍스트만 나올 때

`npm run dev`가 켜져 있는 상태에서 `npm run build`를 실행하면
두 프로세스가 같은 `.next` 폴더를 공유해 CSS가 404가 됩니다.

```bash
# 개발 서버를 끄고
rm -rf .next
npm run dev
```

**개발 서버와 빌드를 동시에 돌리지 마세요.** 빌드 확인이 필요하면 dev를 먼저 종료하세요.

### 브라우저 캐시가 남아 있을 때

Ctrl + Shift + R (강제 새로고침)

### 초안이 사이트에 안 보일 때

정상 동작입니다. `draft: true`인 글은 프로덕션 빌드에서 제외됩니다.
`npm run dev`에서는 보이며, 발행하려면 `npm run review -- --publish <슬러그>`.
