/**
 * 설정 진단 도구.
 *
 *   npm run doctor              설정 점검 + API 연결 테스트
 *   npm run doctor -- --models  내 계정에서 쓸 수 있는 모델 ID 목록 보기
 *   npm run doctor -- --no-api  API 호출 없이 설정만 점검
 *
 * API 연결 테스트는 아주 짧은 요청 1건만 보냅니다 (비용 1원 미만).
 */
import "dotenv/config";

import { createProvider, resolveProviderName, PROVIDER_NAMES } from "./lib/providers/index";
import type { ProviderName } from "./lib/providers/types";
import { parseArgs } from "./lib/cli";
import { readInventory } from "./lib/inventory";
import { siteConfig, categories } from "../site.config";
import { currentPhase } from "../automation.config";

const OK = "✅";
const WARN = "⚠️ ";
const NO = "❌";

let warnCount = 0;
let errorCount = 0;

function section(title: string) {
  console.log(`\n${"─".repeat(60)}\n${title}\n${"─".repeat(60)}`);
}

function check(label: string, ok: boolean, detail: string, level: "error" | "warn" = "error") {
  if (ok) {
    console.log(`${OK} ${label.padEnd(24)} ${detail}`);
  } else if (level === "warn") {
    warnCount++;
    console.log(`${WARN}${label.padEnd(24)} ${detail}`);
  } else {
    errorCount++;
    console.log(`${NO} ${label.padEnd(24)} ${detail}`);
  }
}

/** 키를 절대 그대로 출력하지 않습니다 */
function mask(key: string): string {
  if (key.length <= 12) return "설정됨";
  return `${key.slice(0, 6)}…${key.slice(-4)} (${key.length}자)`;
}

const KEY_ENV: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  grok: "XAI_API_KEY",
};

function checkSiteConfig() {
  section("1. 사이트 설정  (site.config.ts)");

  const urlSet = siteConfig.url !== "https://example.com" && siteConfig.url.startsWith("https://");
  check(
    "도메인",
    urlSet,
    urlSet
      ? siteConfig.url
      : `${siteConfig.url} ← 실제 도메인으로 바꾸세요. 안 바꾸면 sitemap·canonical이 전부 무효입니다`,
  );

  const emailSet = !siteConfig.email.includes("example.com");
  check(
    "문의 이메일",
    emailSet,
    emailSet ? siteConfig.email : "example.com 그대로입니다. 애드센스 심사에서 감점 요인",
    "warn",
  );

  const ads = siteConfig.adsense;
  check(
    "애드센스 client",
    ads.client.startsWith("ca-pub-"),
    ads.client || "미설정 — 승인 후 입력하세요 (지금은 광고 자리표시자가 표시됩니다)",
    "warn",
  );

  if (ads.client) {
    const missing = Object.entries(ads.slots)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    check(
      "애드센스 슬롯",
      missing.length === 0,
      missing.length === 0 ? "3개 모두 설정됨" : `미설정: ${missing.join(", ")}`,
      "warn",
    );
  }

  check("GA4", !!siteConfig.gaId, siteConfig.gaId || "미설정 — 방문 통계를 볼 수 없습니다", "warn");
  check(
    "구글 소유확인",
    !!siteConfig.verification.google,
    siteConfig.verification.google || "미설정 — Search Console 등록 시 필요",
    "warn",
  );
  check(
    "네이버 소유확인",
    !!siteConfig.verification.naver,
    siteConfig.verification.naver || "미설정 — 네이버 노출에 필수입니다",
    "warn",
  );
}

function checkContent() {
  section("2. 콘텐츠 현황");

  const inv = readInventory();
  const phase = currentPhase(inv.published);
  const drafts = inv.total - inv.published;

  check(
    "발행된 글",
    inv.published >= 30,
    inv.published >= 30
      ? `${inv.published}편 — 애드센스 신청 가능`
      : `${inv.published}편 — 애드센스 신청까지 ${30 - inv.published}편 더 필요`,
    "warn",
  );

  console.log(`   검토 대기 초안        ${drafts}편`);
  console.log(`   대기 키워드           ${inv.pendingKeywords.length}개`);
  console.log(`   현재 발행 단계        ${phase.label} (회당 ${phase.perRun}편)`);
  console.log(
    `   카테고리 분포         ${categories
      .map((c) => `${c.name} ${inv.byCategory[c.slug] ?? 0}`)
      .join(" · ")}`,
  );

  const empty = categories.filter((c) => (inv.byCategory[c.slug] ?? 0) === 0);
  if (empty.length > 0) {
    check(
      "빈 카테고리",
      false,
      `${empty.map((c) => c.name).join(", ")} — 글이 0편인 카테고리는 애드센스 심사에서 감점됩니다`,
      "warn",
    );
  }
}

function checkKeys(): ProviderName[] {
  section("3. AI 프로바이더 키");

  const active = resolveProviderName();
  console.log(`   현재 선택된 프로바이더: ${active}  (.env의 AI_PROVIDER)\n`);

  const available: ProviderName[] = [];

  for (const name of PROVIDER_NAMES) {
    const env = KEY_ENV[name];
    const val = process.env[env]?.trim() ?? "";
    const isActive = name === active;

    if (val) {
      available.push(name);
      check(`${name}`, true, `${mask(val)}${isActive ? "  ← 사용 중" : ""}`);
    } else {
      check(
        `${name}`,
        false,
        isActive
          ? `${env} 없음 — .env에 키를 넣어야 글 생성이 됩니다`
          : `${env} 없음 (선택 사항)`,
        isActive ? "error" : "warn",
      );
    }
  }

  return available;
}

async function testApi(names: ProviderName[]) {
  section("4. API 연결 테스트");

  if (names.length === 0) {
    console.log("   키가 설정된 프로바이더가 없어 건너뜁니다.");
    return;
  }

  for (const name of names) {
    process.stdout.write(`   ${name.padEnd(12)} 호출 중 ... `);
    try {
      const provider = createProvider(name);
      const res = await provider.generate({
        system: "당신은 연결 테스트에 응답하는 도우미입니다. 다른 말 없이 요청받은 단어만 출력합니다.",
        prompt: "연결 확인. OK 라고만 답하세요.",
        maxTokens: 1024,
        temperature: 0,
      });
      const tok = res.usage ? ` · ${res.usage.input}→${res.usage.output} tok` : "";
      console.log(`${OK} 성공  (${res.model})${tok}`);
    } catch (err) {
      errorCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`${NO} 실패`);
      console.log(`      ${msg.slice(0, 200)}`);
      hintFor(name, msg);
    }
  }
}

function hintFor(name: ProviderName, msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("401") || m.includes("invalid") || m.includes("authentication")) {
    console.log(`      → 키가 잘못되었습니다. ${KEY_ENV[name]} 값을 다시 확인하세요.`);
  } else if (m.includes("model") || m.includes("404") || m.includes("does not exist")) {
    console.log(`      → 모델 ID가 계정에서 사용 불가합니다. 사용 가능한 목록:  npm run doctor -- --models`);
  } else if (m.includes("quota") || m.includes("billing") || m.includes("credit") || m.includes("429")) {
    console.log(`      → 결제/한도 문제입니다. 콘솔에서 결제 수단과 사용량을 확인하세요.`);
  } else if (m.includes("enotfound") || m.includes("econnrefused") || m.includes("timeout")) {
    console.log(`      → 네트워크 연결 문제입니다. 방화벽/프록시를 확인하세요.`);
  }
}

async function showModels(names: ProviderName[]) {
  section("사용 가능한 모델 목록");

  if (names.length === 0) {
    console.log("   키가 설정된 프로바이더가 없습니다.");
    return;
  }

  for (const name of names) {
    console.log(`\n▸ ${name}`);
    try {
      const models = await createProvider(name).listModels();
      if (models.length === 0) {
        console.log("   (목록이 비어 있습니다)");
        continue;
      }
      for (const id of models) console.log(`   ${id}`);
      console.log(`\n   → .env의 ${name.toUpperCase().replace("GROK", "XAI")}_MODEL 값을 위 목록 중 하나로 맞추세요.`);
    } catch (err) {
      console.log(`   조회 실패: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

function summary() {
  section("결과");

  if (errorCount === 0 && warnCount === 0) {
    console.log("🎉 모든 항목 정상입니다. 바로 운영 가능합니다.");
  } else {
    console.log(`${NO} 반드시 고쳐야 함: ${errorCount}건`);
    console.log(`${WARN}권장 사항:        ${warnCount}건`);
  }

  console.log(`
다음에 할 일
  · 설정 상태를 브라우저에서 보려면:   npm run dev  →  http://localhost:3000/setup
  · 글 생성:                           npm run pipeline
  · 초안 검토/발행:                    npm run review
  · 배포 절차:                         DEPLOY.md
`);
}

async function main() {
  const args = parseArgs();

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${siteConfig.name} 설정 진단`);
  console.log(`${"═".repeat(60)}`);

  checkSiteConfig();
  checkContent();
  const available = checkKeys();

  if (args.models === true) {
    await showModels(available);
    return;
  }

  if (args["no-api"] !== true) {
    await testApi(available);
  }

  summary();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
