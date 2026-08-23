/**
 * 정적 내보내기 빌드 (Cloudflare Pages / Netlify / 일반 웹호스팅용).
 * 결과물: out/ 폴더 — 그대로 업로드하면 동작합니다.
 *
 * 실행: npm run build:static
 * (윈도우/리눅스 모두에서 환경변수가 동일하게 전달되도록 래퍼로 감쌌습니다)
 */
import { spawnSync } from "node:child_process";

const res = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "build"],
  {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "static" },
    shell: process.platform === "win32",
  },
);

process.exit(res.status ?? 1);
