# 행정산책

정부지원금·복지·민원을 회사원처럼 또렷하게, 산길처럼 부담 없이 안내하는 사이트.
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
npm run dev               # http://localhost:3000
```

**설정 상태는 브라우저에서도 볼 수 있습니다** → http://localhost:3000/setup
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

# 검토 후 발행 (이 단계를 건너뛰면 구글 제재 대상)
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
| **자동 램프** | 초기 하루 10편 → 안정기 2편으로 발행량 자동 조절 |
| **초성 검색** | `ㅊㄴㅇㅅ` → 청년월세. 서버 없이 클라이언트에서 동작 |
| **광고 최적화** | 지연 로딩 · CLS 0 · 광고 과밀 방지 가드 |
| **SEO 기본기** | 사이트맵 · robots · JSON-LD · RSS · ads.txt 자동 생성 |
| **안전장치** | AI 초안은 `draft:true`. 사람이 검토해야 발행됨 |

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
