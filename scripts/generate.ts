/**
 * AI 콘텐츠 생성기.
 *
 *   npm run generate -- --keyword "청년월세 특별지원 신청방법" --category housing
 *   npm run generate -- --file data/keywords.csv --limit 5
 *   npm run generate -- --file data/keywords.csv --provider grok
 *   npm run generate -- --keyword "..." --category tax --dry     (파일 저장 없이 출력만)
 *
 * 프로바이더 선택: --provider anthropic|openai|grok  (없으면 .env의 AI_PROVIDER)
 *
 * ⚠️ 생성된 글은 draft: true, reviewed: false 상태로 저장됩니다.
 *    사실 확인 후 프론트매터를 draft: false 로 바꿔야 프로덕션 빌드에 포함됩니다.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import "dotenv/config";

import { createProvider } from "./lib/providers/index";
import { SYSTEM_PROMPT, buildUserPrompt } from "./lib/prompts";
import { parseArgs, str, num } from "./lib/cli";
import { readInventory, pickKeywords, markKeywordsDone } from "./lib/inventory";
import { automationConfig } from "../automation.config";
import { categories } from "../site.config";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const VALID_CATEGORIES = new Set(categories.map((c) => c.slug));

interface Job {
  keyword: string;
  category: string;
}

/** AI 출력에서 프론트매터 + 본문을 안전하게 추출 */
function extractDocument(raw: string): { data: Record<string, unknown>; body: string } {
  let text = raw.trim();

  // ```markdown ... ``` 으로 감싸서 오는 경우 제거
  const fence = /^```[a-zA-Z]*\n([\s\S]*?)\n```$/.exec(text);
  if (fence) text = fence[1].trim();

  // 첫 `---` 앞에 잡담이 붙은 경우 잘라내기
  const start = text.indexOf("---");
  if (start > 0) text = text.slice(start);

  if (!text.startsWith("---")) {
    throw new Error("프론트매터(---)를 찾지 못했습니다.");
  }

  const parsed = matter(text);
  return { data: parsed.data as Record<string, unknown>, body: parsed.content.trim() };
}

function slugify(input: string, fallback: string): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length >= 3 ? s : fallback;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadJobs(args: Record<string, string | boolean>): Job[] {
  const keyword = str(args.keyword);
  if (keyword) {
    const category = str(args.category) ?? "subsidy";
    if (!VALID_CATEGORIES.has(category as never)) {
      throw new Error(
        `알 수 없는 카테고리 "${category}". 사용 가능: ${[...VALID_CATEGORIES].join(", ")}`,
      );
    }
    return [{ keyword, category }];
  }

  // data/keywords.csv 에서 아직 처리하지 않은 키워드를 가져옵니다.
  // --balance false 를 주지 않으면 글이 적은 카테고리부터 균형 있게 뽑습니다.
  const inv = readInventory();
  const balance = args.balance !== "false" && automationConfig.balanceCategories;
  const limit = num(args.limit, inv.pendingKeywords.length);

  return pickKeywords(inv, limit, balance).map((r) => ({
    keyword: r.keyword,
    category: VALID_CATEGORIES.has(r.category as never) ? r.category : "subsidy",
  }));
}



async function main() {
  const args = parseArgs();
  const dry = args.dry === true;

  const provider = createProvider(str(args.provider));
  const jobs = loadJobs(args);

  if (jobs.length === 0) {
    console.log("처리할 키워드가 없습니다.");
    return;
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  console.log(`\n프로바이더: ${provider.name} (${provider.model})`);
  console.log(`생성 대상: ${jobs.length}개\n`);

  const titles = readInventory().titles;
  const completed: string[] = [];
  let ok = 0;
  let failed = 0;

  for (const [i, job] of jobs.entries()) {
    const label = `[${i + 1}/${jobs.length}] ${job.keyword}`;
    process.stdout.write(`${label} ... `);

    try {
      const result = await provider.generate({
        system: SYSTEM_PROMPT,
        prompt: buildUserPrompt({
          keyword: job.keyword,
          category: job.category,
          existingTitles: titles,
        }),
        maxTokens: num(process.env.AI_MAX_TOKENS, 16000),
        temperature: Number(process.env.AI_TEMPERATURE ?? 0.7),
      });

      const { data, body } = extractDocument(result.text);

      const slug = slugify(
        String(data.slug ?? ""),
        `post-${Date.now()}-${i}`,
      );

      const frontmatter = {
        title: String(data.title ?? job.keyword),
        description: String(data.description ?? ""),
        category: job.category,
        date: today(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        faq: Array.isArray(data.faq) ? data.faq : [],
        // 사람이 검토하기 전까지는 발행되지 않습니다.
        draft: true,
        aiGenerated: true,
        reviewed: false,
        provider: `${result.provider}:${result.model}`,
      };

      const out = matter.stringify(`\n${body}\n`, frontmatter);

      if (dry) {
        console.log("(dry run)\n");
        console.log(out.slice(0, 1200));
        console.log("...\n");
      } else {
        const dest = path.join(POSTS_DIR, `${slug}.md`);
        if (fs.existsSync(dest)) {
          console.log(`건너뜀 (이미 존재: ${slug}.md)`);
          continue;
        }
        fs.writeFileSync(dest, out, "utf8");
        titles.push(frontmatter.title);
        completed.push(job.keyword);
        const tok = result.usage
          ? ` · ${result.usage.input}→${result.usage.output} tok`
          : "";
        console.log(`저장 ${slug}.md${tok}`);
      }
      ok++;
    } catch (err) {
      failed++;
      console.log(`실패: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\n완료: 성공 ${ok} / 실패 ${failed}`);
  if (ok > 0 && !dry) {
    console.log(
      "\n다음 단계:\n" +
        "  1) content/posts/ 의 새 글을 열어 사실관계를 확인하세요\n" +
        "  2) 확인이 끝나면 프론트매터를 draft: false, reviewed: true 로 변경\n" +
        "  3) npm run index && npm run build\n",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
