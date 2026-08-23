/**
 * 콘텐츠 재고 조회.
 * 파이프라인이 "지금 무엇이 부족한지" 판단하는 근거를 제공합니다.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseCsv } from "./csv";
import { categories, type CategorySlug, type ContentPillar } from "../../site.config";
import { automationConfig } from "../../automation.config";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CSV = path.join(process.cwd(), "data", "keywords.csv");

export interface KeywordRow {
  keyword: string;
  category: string;
  status: string;
  intent: string;
}

export interface Inventory {
  /** draft:false 로 실제 발행된 글 수 */
  published: number;
  /** 초안 포함 전체 글 수 */
  total: number;
  /** 카테고리별 글 수 (발행+초안 — 기둥 균형·발굴 우선순위용) */
  byCategory: Record<string, number>;
  /** 이미 존재하는 글 제목 (중복 회피용) */
  titles: string[];
  /** 이미 사용된 slug */
  slugs: Set<string>;
  /** 아직 글로 만들지 않은 키워드 */
  pendingKeywords: KeywordRow[];
  /** CSV의 전체 키워드 */
  allKeywords: KeywordRow[];
}

export function readInventory(): Inventory {
  const byCategory: Record<string, number> = Object.fromEntries(
    categories.map((c) => [c.slug, 0]),
  );
  const titles: string[] = [];
  const slugs = new Set<string>();
  let published = 0;
  let total = 0;

  if (fs.existsSync(POSTS_DIR)) {
    for (const file of fs.readdirSync(POSTS_DIR)) {
      if (!/\.mdx?$/.test(file)) continue;
      total++;
      slugs.add(file.replace(/\.mdx?$/, ""));

      try {
        const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
        if (data.title) titles.push(String(data.title));
        const cat = String(data.category ?? "");
        if (cat in byCategory) byCategory[cat]++;
        if (data.draft !== true) published++;
      } catch {
        /* 깨진 파일은 무시 */
      }
    }
  }

  let allKeywords: KeywordRow[] = [];
  if (fs.existsSync(CSV)) {
    allKeywords = parseCsv(fs.readFileSync(CSV, "utf8")).map((r) => ({
      keyword: r.keyword ?? "",
      category: r.category ?? "subsidy",
      status: r.status ?? "",
      intent: r.intent ?? "",
    }));
  }

  const pendingKeywords = allKeywords.filter(
    (r) => r.keyword.length > 0 && r.status !== "done",
  );

  return {
    published,
    total,
    byCategory,
    titles,
    slugs,
    pendingKeywords,
    allKeywords,
  };
}

/** 글 수가 가장 적은 카테고리부터 정렬. 기둥 최소 비중 미달이면 해당 기둥을 앞에 둔다. */
export function categoriesByNeed(inv: Inventory): CategorySlug[] {
  const total = Math.max(
    1,
    Object.values(inv.byCategory).reduce((a, b) => a + b, 0),
  );
  const pillarCount: Record<ContentPillar, number> = {
    admin: 0,
    tips: 0,
    money: 0,
  };
  for (const c of categories) {
    pillarCount[c.pillar] += inv.byCategory[c.slug] ?? 0;
  }

  const min = automationConfig.pillarMinShare;
  const deficit = (p: ContentPillar) =>
    pillarCount[p] / total < min[p] ? 0 : 1;

  return [...categories]
    .sort((a, b) => {
      const pillarCmp = deficit(a.pillar) - deficit(b.pillar);
      if (pillarCmp !== 0) return pillarCmp;
      return (inv.byCategory[a.slug] ?? 0) - (inv.byCategory[b.slug] ?? 0);
    })
    .map((c) => c.slug);
}

/**
 * 카테고리 균형을 고려해 처리할 키워드를 고릅니다.
 * 부족한 카테고리의 키워드를 우선 배치하되, 재고가 없으면 남은 것으로 채웁니다.
 */
export function pickKeywords(
  inv: Inventory,
  count: number,
  balance: boolean,
): KeywordRow[] {
  if (!balance) return inv.pendingKeywords.slice(0, count);

  const order = categoriesByNeed(inv);
  const buckets = new Map<string, KeywordRow[]>();
  for (const row of inv.pendingKeywords) {
    const list = buckets.get(row.category) ?? [];
    list.push(row);
    buckets.set(row.category, list);
  }

  const picked: KeywordRow[] = [];
  // 라운드 로빈: 부족한 카테고리부터 한 개씩 돌아가며 뽑습니다.
  let progressed = true;
  while (picked.length < count && progressed) {
    progressed = false;
    for (const cat of order) {
      if (picked.length >= count) break;
      const list = buckets.get(cat);
      if (list && list.length > 0) {
        picked.push(list.shift()!);
        progressed = true;
      }
    }
  }

  return picked;
}

/** 처리 완료한 키워드를 CSV에서 status=done 으로 표시 */
export function markKeywordsDone(keywords: string[]): void {
  if (!fs.existsSync(CSV) || keywords.length === 0) return;

  const done = new Set(keywords);
  const rows = parseCsv(fs.readFileSync(CSV, "utf8"));

  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

  const out = [
    "keyword,category,status,intent",
    ...rows.map((r) => {
      const status = done.has(r.keyword) ? "done" : (r.status ?? "");
      return [r.keyword ?? "", r.category ?? "", status, r.intent ?? ""]
        .map(esc)
        .join(",");
    }),
  ].join("\n");

  fs.writeFileSync(CSV, out + "\n", "utf8");
}
