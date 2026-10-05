/**
 * 자동 콘텐츠 발굴기.
 *
 * 현재 사이트의 카테고리별 글 분포를 보고, 비어 있는 영역부터
 * 새 롱테일 키워드를 찾아 data/keywords.csv 에 채웁니다.
 * 이미 다룬 주제는 프롬프트에 명시해 중복 발굴을 막습니다.
 *
 *   npm run discover                       // 부족한 카테고리 자동 선택
 *   npm run discover -- --category housing // 특정 카테고리만
 *   npm run discover -- --count 40
 *   npm run discover -- --provider grok
 */
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

import { createProvider } from "./lib/providers/index";
import { buildDiscoveryPrompt } from "./lib/prompts";
import { parseArgs, str, num } from "./lib/cli";
import { readInventory, categoriesByNeed } from "./lib/inventory";
import { automationConfig } from "../automation.config";
import { categoryMap, type CategorySlug } from "../site.config";

const CSV = path.join(process.cwd(), "data", "keywords.csv");
const SEEDS = path.join(process.cwd(), "data", "seeds.txt");

const SYSTEM =
  "당신은 한국 검색 시장에 정통한 SEO 키워드 리서처입니다. 요청받은 JSON 형식만 정확히 출력합니다.";

interface Found {
  keyword: string;
  category: string;
  intent: string;
}

function loadSeeds(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!fs.existsSync(SEEDS)) return map;

  for (const line of fs.readFileSync(SEEDS, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [cat, topic] = t.split("|").map((s) => s.trim());
    if (!cat || !topic) continue;
    map.set(cat, [...(map.get(cat) ?? []), topic]);
  }
  return map;
}

function extractJson(text: string): Found[] {
  let t = text.trim();
  const fence = /```(?:json)?\s*\n([\s\S]*?)\n```/.exec(t);
  if (fence) t = fence[1].trim();

  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("JSON 배열을 찾지 못했습니다.");

  const parsed = JSON.parse(t.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다.");

  return parsed
    .map((r) => r as Record<string, unknown>)
    .filter((r) => typeof r.keyword === "string" && r.keyword.trim().length > 1)
    .map((r) => ({
      keyword: String(r.keyword).trim(),
      category: String(r.category ?? "").trim(),
      intent: String(r.intent ?? "").trim(),
    }));
}

const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

async function main() {
  const args = parseArgs();
  const provider = createProvider(str(args.provider));
  const inv = readInventory();
  const seeds = loadSeeds();

  const totalWanted = num(args.count, automationConfig.keywordsPerDiscovery);

  // 대상 카테고리 결정: 지정이 있으면 그것만, 없으면 부족한 순으로 상위 3개
  const explicit = str(args.category) as CategorySlug | undefined;
  const targets: CategorySlug[] = explicit
    ? [explicit]
    : categoriesByNeed(inv).slice(0, 3);

  const perCategory = Math.max(5, Math.ceil(totalWanted / targets.length));

  console.log(`\n프로바이더: ${provider.name} (${provider.model})`);
  console.log(`현재 발행 ${inv.published}개 / 대기 키워드 ${inv.pendingKeywords.length}개`);
  console.log(
    `발굴 대상: ${targets.map((t) => categoryMap[t]?.name ?? t).join(", ")} (각 ${perCategory}개)\n`,
  );

  const known = new Set(inv.allKeywords.map((k) => k.keyword));
  const collected: Found[] = [];
  let failed = 0;

  for (const slug of targets) {
    const cat = categoryMap[slug];
    if (!cat) {
      console.log(`  · 알 수 없는 카테고리 건너뜀: ${slug}`);
      continue;
    }

    process.stdout.write(`  · ${cat.name} 발굴 중 ... `);
    try {
      const res = await provider.generate({
        system: SYSTEM,
        prompt: buildDiscoveryPrompt({
          categoryName: cat.name,
          categorySlug: cat.slug,
          categoryDesc: cat.description,
          seeds: seeds.get(cat.slug) ?? [],
          existingKeywords: inv.allKeywords
            .filter((k) => k.category === cat.slug)
            .map((k) => k.keyword),
          existingTitles: inv.titles,
          count: perCategory,
        }),
        maxTokens: 8000,
        temperature: 0.95,
      });

      const found = extractJson(res.text)
        // 카테고리는 요청한 값으로 강제 (모델이 다른 값을 넣는 경우 방지)
        .map((f) => ({ ...f, category: cat.slug }))
        .filter((f) => !known.has(f.keyword));

      for (const f of found) known.add(f.keyword);
      collected.push(...found);
      console.log(`${found.length}개`);
    } catch (err) {
      failed++;
      console.log(`실패: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (collected.length === 0) {
    console.log("\n새로 추가된 키워드가 없습니다.");
    if (failed > 0) process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(CSV)) {
    fs.mkdirSync(path.dirname(CSV), { recursive: true });
    fs.writeFileSync(CSV, "keyword,category,status,intent\n", "utf8");
  }

  fs.appendFileSync(
    CSV,
    collected
      .map((f) => [f.keyword, f.category, "", f.intent].map(esc).join(","))
      .join("\n") + "\n",
    "utf8",
  );

  console.log(`\n총 ${collected.length}개 키워드 추가 → data/keywords.csv`);
  for (const f of collected) {
    console.log(`  [${f.category}] ${f.keyword}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
