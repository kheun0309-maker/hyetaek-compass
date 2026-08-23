/**
 * Cloudflare Pages 배포 실행기.
 *
 *   npm run deploy
 *
 * 인증 방법 두 가지 중 하나가 필요합니다.
 *   A) 브라우저 로그인:  npx wrangler login   (최초 1회)
 *   B) API 토큰:        .env 의 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 *
 * 이 스크립트는 .env 를 읽어 wrangler에 환경변수로 전달합니다.
 * 토큰 값은 화면에 출력하지 않습니다.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT = process.env.CF_PAGES_PROJECT || "haengjeong-sancheck";
const OUT = path.join(process.cwd(), "out");

/** .env 를 읽어 process.env 에 채웁니다 (이미 있는 값은 유지) */
function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;

  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (val && !process.env[key]) process.env[key] = val;
  }
}

loadEnv();

if (!fs.existsSync(OUT)) {
  console.error("out/ 폴더가 없습니다. 먼저 npm run build 를 실행하세요.");
  process.exit(1);
}

const hasToken =
  !!process.env.CLOUDFLARE_API_TOKEN && !!process.env.CLOUDFLARE_ACCOUNT_ID;

console.log("\nCloudflare Pages 배포");
console.log(`  프로젝트 : ${PROJECT}`);
console.log(`  업로드   : out/ (${fs.readdirSync(OUT).length}개 최상위 항목)`);
console.log(
  `  인증     : ${hasToken ? "API 토큰 (.env)" : "wrangler 로그인 세션"}\n`,
);

if (!hasToken) {
  console.log(
    "  ℹ️  API 토큰이 없어 로그인 세션을 사용합니다.\n" +
      "     로그인한 적이 없다면 먼저 실행하세요:  npx wrangler login\n",
  );
}

const res = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "wrangler",
    "pages",
    "deploy",
    "out",
    `--project-name=${PROJECT}`,
    "--branch=main",
  ],
  {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  },
);

if (res.status !== 0) {
  console.error(`
배포 실패. 자주 나오는 원인:
  · 인증 안 됨        →  npx wrangler login  또는 .env 에 CLOUDFLARE_API_TOKEN/ACCOUNT_ID 입력
  · 토큰 권한 부족    →  Account > Cloudflare Pages > Edit 권한이 있어야 합니다
  · 프로젝트 이름 충돌 →  CF_PAGES_PROJECT 환경변수로 다른 이름을 지정하세요
`);
}

process.exit(res.status ?? 1);
