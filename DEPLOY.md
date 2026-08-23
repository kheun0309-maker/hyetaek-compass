# Cloudflare Pages 배포 가이드

이 사이트는 **완전 정적(HTML 파일 80개)** 으로 빌드되어 Cloudflare Pages에 그대로 올라갑니다.
서버가 없으므로 요금·트래픽 걱정이 없고, 무료 플랜에서 **상업적 이용(광고 게재)이 허용**됩니다.

로컬에서 Cloudflare 런타임으로 검증을 마친 상태입니다.

```
✓ 확장자 없는 URL 라우팅   /about, /category/admin, /page/2 → 전부 200
✓ SEO 파일                sitemap.xml, robots.txt, rss.xml, ads.txt → 전부 200
✓ 없는 페이지             /no-such-page → 404 (소프트 404 아님)
✓ 캐시 헤더               _next/static/* → max-age=31536000, immutable
✓ 보안 헤더               nosniff, referrer-policy 적용
✓ 클라이언트 검색         search-index.json 로드 및 초성 검색 동작
```

---

## 0. 배포 전 필수 수정

`site.config.ts` 최상단:

```ts
url: "https://실제도메인.com",   // ← 안 바꾸면 sitemap·canonical·OG가 전부 무효
email: "실제이메일@주소",
```

> 이 값이 `example.com`인 채로 배포하면 검색엔진이 색인할 수 없습니다. **가장 흔한 실수입니다.**

---

## 1. 도메인 구입

| 등록업체 | 특징 |
|---|---|
| **Cloudflare Registrar** | 원가 판매(마진 0). Pages와 같은 계정이라 연결이 클릭 두 번 |
| 가비아 / 후이즈 | 한국어 지원, 카드·계좌 결제 편함. 대신 갱신비가 조금 비쌈 |

`.com` 기준 연 1~2만원. **Cloudflare Registrar를 쓰면 DNS 설정을 아예 건드릴 필요가 없습니다.**

---

## 2. GitHub 저장소 만들기

아직 git 저장소가 아니라면:

```bash
git init
git add .
git commit -m "init: 행정산책 사이트"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

> `.gitignore`에 `node_modules`, `.next`, `out`, `.env`가 이미 들어 있어
> API 키나 빌드 결과물이 올라가지 않습니다.

---

## 3. Cloudflare Pages 연결

1. https://dash.cloudflare.com 접속 → 왼쪽 메뉴 **Workers & Pages**
2. **Create** → **Pages** 탭 → **Connect to Git**
3. GitHub 계정 연결 후 저장소 선택
4. 빌드 설정을 아래 그대로 입력

| 항목 | 값 |
|---|---|
| Framework preset | **None** (Next.js 프리셋 선택 금지 — 정적 내보내기라 설정이 달라집니다) |
| Build command | `npm run build:static` |
| Build output directory | `out` |
| Root directory | (비움) |

5. **Save and Deploy**

첫 배포는 2~3분 걸립니다. 완료되면 `저장소명.pages.dev` 주소가 나옵니다.

> Node 버전은 `.node-version` 파일(`22`)로 고정되어 있어 별도 설정이 필요 없습니다.

---

## 4. 도메인 연결

1. Pages 프로젝트 → **Custom domains** → **Set up a domain**
2. 구입한 도메인 입력
3. Cloudflare Registrar에서 샀다면 **자동 연결**되고, 다른 곳에서 샀다면 안내대로 네임서버를 변경합니다
4. SSL 인증서는 자동 발급됩니다 (몇 분 소요)

연결 후 **`site.config.ts`의 `url`을 이 도메인으로 바꾸고 다시 push** 하세요.

---

## 5. 배포 확인

브라우저에서 아래 주소들이 정상인지 확인합니다.

```
https://도메인/                     사이트 첫 화면
https://도메인/sitemap.xml          URL 목록이 보여야 함
https://도메인/robots.txt           Sitemap 줄에 실제 도메인이 있어야 함
https://도메인/rss.xml              글 목록이 보여야 함
https://도메인/ads.txt              애드센스 승인 전에는 안내 문구
```

`sitemap.xml`에 `example.com`이 보이면 0번을 안 한 것입니다.

---

## 6. 이후 운영

**push하면 자동 배포됩니다.** 별도 작업이 필요 없습니다.

```
글 작성/발행 → git push → Cloudflare가 자동 빌드 → 2~3분 후 반영
```

GitHub Actions가 매일 초안을 커밋하면 그때도 자동 빌드가 돕니다.
초안은 `draft: true`라 사이트에 나타나지 않으므로 안심해도 됩니다.
(무료 플랜 빌드 한도는 월 500회 — 하루 1회 커밋이면 여유롭습니다.)

---

## 로컬에서 배포본 미리보기

Cloudflare와 동일한 런타임으로 확인할 수 있습니다.

```bash
npm run preview:static
```

`http://127.0.0.1:8788` 에서 실제 배포 결과와 같은 라우팅·헤더로 동작합니다.

## 수동 배포 (Git 없이)

```bash
npx wrangler login     # 최초 1회
npm run deploy
```

---

## 문제 해결

| 증상 | 원인 / 해결 |
|---|---|
| 빌드 실패: `next: not found` | Build command가 `npm run build:static`인지 확인 |
| 페이지는 나오는데 CSS가 없음 | Build output directory가 `out`인지 확인 |
| 모든 URL이 첫 화면으로 감 | `public/_redirects`에 SPA 폴백(`/* /index.html 200`)을 넣지 마세요 |
| sitemap에 example.com | `site.config.ts`의 `url` 수정 후 재배포 |
| 404 페이지가 밋밋함 | `src/app/not-found.tsx` 수정 |
