/**
 * 롱테일 키워드 확장기.
 * 시드 키워드 하나를 넣으면 AI가 검색 가능성 있는 롱테일 키워드를 뽑아
 * data/keywords.csv 에 이어붙입니다.
 *
 *   npm run keywords -- --seed "청년 주거 지원" --count 20
 *   npm run keywords -- --seed "기초연금" --count 15 --provider openai
 */
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

import { createProvider } from "./lib/providers/index";
import { buildKeywordPrompt } from "./lib/prompts";
import { parseArgs, str, num } from "./lib/cli";
import { parseCsv } from "./lib/csv";
import { categories } from "../site.config";

const CSV = path.join(process.cwd(), "data", "keywords.csv");
const VALID = new Set(categories.map((c) => c.slug));

const SYSTEM =
  "당신은 한국 검색 시장을 잘 아는 SEO 키워드 리서처입니다. 요청받은 JSON 형식만 정확히 출력합니다.";

interface Row {
  keyword: string;
  category: string;
  intent: string;
}

function extractJson(text: string): Row[] {
  let t = text.trim();
  const fence = /```(?:json)?\n([\s\S]*?)\n```/.exec(t);
  if (fence) t = fence[1].trim();

  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("JSON 배열을 찾지 못했습니다.");

  const parsed = JSON.parse(t.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다.");

  return parsed
    .map((r) => r as Record<string, unknown>)
    .filter((r) => typeof r.keyword === "string" && r.keyword.trim().length > 0)
    .map((r) => ({
      keyword: String(r.keyword).trim(),
      category: VALID.has(String(r.category) as never) ? String(r.category) : "subsidy",
      intent: String(r.intent ?? "").trim(),
    }));
}

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

async function main() {
  const args = parseArgs();
  const seed = str(args.seed);
  if (!seed) {
    console.error('사용법: npm run keywords -- --seed "청년 주거 지원" --count 20');
    process.exit(1);
  }
  const count = num(args.count, 20);

  const provider = createProvider(str(args.provider));
  console.log(`프로바이더: ${provider.name} (${provider.model})`);
  console.log(`시드: "${seed}" → ${count}개 확장 중...\n`);

  const result = await provider.generate({
    system: SYSTEM,
    prompt: buildKeywordPrompt(seed, count),
    maxTokens: 8000,
    temperature: 0.9,
  });

  const rows = extractJson(result.text);

  fs.mkdirSync(path.dirname(CSV), { recursive: true });
  const exists = fs.existsSync(CSV);
  const existing = exists ? parseCsv(fs.readFileSync(CSV, "utf8")) : [];
  const seen = new Set(existing.map((r) => r.keyword));

  const fresh = rows.filter((r) => !seen.has(r.keyword));

  const lines = fresh.map(
    (r) =>
      [r.keyword, r.category, "", r.intent].map(csvEscape).join(","),
  );

  if (!exists) {
    fs.writeFileSync(CSV, "keyword,category,status,intent\n", "utf8");
  }
  if (lines.length > 0) {
    fs.appendFileSync(CSV, lines.join("\n") + "\n", "utf8");
  }

  console.log(`추가 ${fresh.length}개 / 중복 제외 ${rows.length - fresh.length}개`);
  for (const r of fresh) console.log(`  · [${r.category}] ${r.keyword}`);
  console.log(`\n→ data/keywords.csv 갱신 완료. 이어서 실행:  npm run generate -- --limit 5`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
