/**
 * 자동 콘텐츠 파이프라인 (오케스트레이터).
 *
 * 한 번 실행하면 아래를 순서대로 수행합니다.
 *   1) 현재 재고 확인 → 발행량 램프 단계 결정
 *   2) 키워드 재고가 부족하면 자동 발굴 (discover)
 *   3) 이번 회차 분량만큼 초안 생성 (generate)
 *   4) 검색 인덱스 재빌드
 *
 * 실행:
 *   npm run pipeline              // 램프 설정대로 자동 진행
 *   npm run pipeline -- --dry     // 계획만 출력, API 호출 없음
 *   npm run pipeline -- --count 5 // 이번 회차만 개수 강제
 *   npm run pipeline -- --provider grok
 *
 * GitHub Actions에서 매일 자동 실행하도록 .github/workflows/content.yml 에 연결되어 있습니다.
 */
import { spawnSync } from "node:child_process";
import "dotenv/config";

import { parseArgs, str, boundedCount } from "./lib/cli";
import { pickKeywords } from "./lib/inventory";
import { readInventory, categoriesByNeed } from "./lib/inventory";
import { automationConfig, currentPhase } from "../automation.config";
import { categoryMap } from "../site.config";

/** tsx 로더를 붙여 하위 TypeScript 스크립트를 실행합니다 (윈도우/리눅스 공통). */
function run(script: string, extra: string[]): boolean {
  const res = spawnSync(
    process.execPath,
    ["--import", "tsx", script, ...extra],
    { stdio: "inherit", env: process.env },
  );
  return res.status === 0;
}

function line(char = "─") {
  console.log(char.repeat(58));
}

async function main() {
  const args = parseArgs();
  const dry = args.dry === true;
  const provider = str(args.provider);
  const providerArgs = provider ? ["--provider", provider] : [];

  const inv = readInventory();
  const phase = currentPhase(inv.published);

  const planned = boundedCount(args.count, phase.perRun, automationConfig.hardDailyLimit);

  line("═");
  console.log("자동 콘텐츠 파이프라인");
  line("═");
  console.log(`발행된 글       : ${inv.published}개 (초안 포함 ${inv.total}개)`);
  console.log(`현재 단계       : ${phase.label}`);
  console.log(`이번 회차 생성  : ${planned}개`);
  console.log(`대기 키워드     : ${inv.pendingKeywords.length}개`);
  console.log(
    `카테고리 분포   : ${categoriesByNeed(inv)
      .map((s) => `${categoryMap[s]?.name ?? s} ${inv.byCategory[s] ?? 0}`)
      .join(" · ")}`,
  );
  line();

  // ── 1단계: 키워드 재고 보충 ──────────────────────────────
  const needDiscovery =
    inv.pendingKeywords.length < automationConfig.keywordRefillThreshold ||
    inv.pendingKeywords.length < planned;

  if (needDiscovery) {
    console.log(
      `\n[1/3] 키워드 부족 (${inv.pendingKeywords.length} < ${automationConfig.keywordRefillThreshold}) → 자동 발굴 실행`,
    );
    if (dry) {
      console.log("      (dry run — 실행 생략)");
    } else if (!run("scripts/discover.ts", providerArgs)) {
      console.error("발굴 단계 실패. 파이프라인을 중단합니다.");
      process.exit(1);
    }
  } else {
    console.log(`\n[1/3] 키워드 재고 충분 → 발굴 생략`);
  }

  // ── 2단계: 초안 생성 ────────────────────────────────────
  console.log(`\n[2/3] 초안 ${planned}개 생성`);
  if (dry) {
    const preview = pickKeywords(inv, planned, automationConfig.balanceCategories);
    console.log("      (dry run) 다음 키워드가 처리될 예정입니다:");
    for (const k of preview) console.log(`        · [${k.category}] ${k.keyword}`);
  } else if (
    !run("scripts/generate.ts", [...providerArgs, "--limit", String(planned)])
  ) {
    console.error("생성 단계 실패.");
    process.exit(1);
  }

  // ── 3단계: 검색 인덱스 재빌드 ───────────────────────────
  console.log(`\n[3/3] 검색 인덱스 재빌드`);
  if (dry) {
    console.log("      (dry run — 실행 생략)");
  } else {
    if (!run("scripts/build-search-index.ts", [])) throw new Error("검색 인덱스 생성 실패");
  }

  const after = readInventory();
  line("═");
  console.log(
    `완료. 발행 ${after.published}개 / 초안 대기 ${after.total - after.published}개`,
  );
  console.log(
    "초안은 검토 후 draft: false 로 바꿔야 사이트에 노출됩니다. (npm run review)",
  );
  line("═");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
